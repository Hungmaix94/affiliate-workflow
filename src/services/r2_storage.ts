import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'influencers';
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// Khởi tạo S3Client kết nối tới Cloudflare R2 (S3-compatible)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

/**
 * Tải một file cục bộ lên tmpfiles.org làm giải pháp thay thế hoàn toàn miễn phí, không cần tài khoản/thẻ.
 */
async function uploadToTmpFiles(filePath: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);

    console.log(`[R2Storage - Fallback] Đang tải tệp ${fileName} lên tmpfiles.org (miễn phí)...`);
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`tmpfiles.org API trả về mã lỗi: ${response.statusText}`);
    }

    const json = await response.json() as any;
    if (json.status === 'success' && json.data && json.data.url) {
      const downloadUrl = json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
      console.log(`[R2Storage - Fallback] ✅ Tải lên tmpfiles.org thành công. URL công khai: ${downloadUrl}`);
      return downloadUrl;
    } else {
      throw new Error(`Cấu trúc phản hồi không hợp lệ: ${JSON.stringify(json)}`);
    }
  } catch (error: any) {
    console.error(`[R2Storage - Fallback] ❌ Tải lên tmpfiles.org thất bại: ${error.message}`);
    throw error;
  }
}

/**
 * Tải một file cục bộ lên Cloudflare R2 và trả về URL truy cập công khai.
 * Nếu chưa cấu hình hoặc lỗi kết nối, tự động chuyển hướng upload lên tmpfiles.org miễn phí.
 * 
 * @param filePath Đường dẫn tuyệt đối hoặc tương đối của file cục bộ.
 * @param mimeType Định dạng file (ví dụ: 'video/mp4', 'image/png').
 * @returns Public URL truy cập file sau khi upload.
 */
export async function uploadFileToR2(filePath: string, mimeType?: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File không tồn tại tại đường dẫn: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    throw new Error(`Đường dẫn cung cấp là một thư mục, không thể upload: ${filePath}`);
  }

  const isDefaultConfig = !accountId || accountId.startsWith('your_cloudflare') || 
                           !accessKeyId || accessKeyId.startsWith('your_cloudflare');

  if (isDefaultConfig) {
    console.log(`[R2Storage] Chưa cấu hình thông tin Cloudflare R2 thật. Tự động dùng fallback miễn phí tmpfiles.org.`);
    return uploadToTmpFiles(filePath);
  }

  const fileName = path.basename(filePath);
  const fileExtension = path.extname(filePath);
  const baseNameWithoutExt = path.basename(filePath, fileExtension);
  const uniqueKey = `${baseNameWithoutExt}-${Date.now()}${fileExtension}`;

  const fileBuffer = fs.readFileSync(filePath);

  let contentType = mimeType;
  if (!contentType) {
    switch (fileExtension.toLowerCase()) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.mp4':
        contentType = 'video/mp4';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      default:
        contentType = 'application/octet-stream';
    }
  }

  try {
    console.log(`[R2Storage] Đang tải lên R2: ${fileName} -> Key: ${uniqueKey} (Content-Type: ${contentType})...`);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueKey,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    console.log(`[R2Storage] ✅ Tải lên R2 thành công.`);

    if (publicUrl) {
      const trimmedPublicUrl = publicUrl.endsWith('/') ? publicUrl.slice(0, -1) : publicUrl;
      return `${trimmedPublicUrl}/${uniqueKey}`;
    }

    return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${uniqueKey}`;
  } catch (err: any) {
    console.warn(`[R2Storage] ⚠️ Gặp lỗi khi tải lên R2 (${err.message}). Tự động dùng fallback miễn phí tmpfiles.org.`);
    return uploadToTmpFiles(filePath);
  }
}
