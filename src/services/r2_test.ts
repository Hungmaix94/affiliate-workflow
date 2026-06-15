import fs from 'fs';
import path from 'path';
import { uploadFileToR2 } from './r2_storage.js';

async function testUpload() {
  console.log('=== KHỞI CHẠY KIỂM TRA UPLOAD CLOUDFLARE R2 ===');
  
  // Tạo thư mục assets nếu chưa có
  const assetsDir = path.join(process.cwd(), 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Tạo file test
  const testFilePath = path.join(assetsDir, 'test_r2_upload.txt');
  const fileContent = `Đây là nội dung tệp test được tạo tự động vào lúc: ${new Date().toISOString()}`;
  fs.writeFileSync(testFilePath, fileContent);
  console.log(`[Test] Đã tạo tệp kiểm tra tại: ${testFilePath}`);

  try {
    const publicUrl = await uploadFileToR2(testFilePath, 'text/plain');
    console.log(`\n[Test] 🎉 UPLOAD THÀNH CÔNG!`);
    console.log(`[Test] Public URL của tệp: ${publicUrl}`);
    
    // Đọc thử file qua fetch nếu publicUrl hợp lệ
    if (publicUrl.startsWith('http')) {
      console.log(`[Test] Đang thử tải nội dung từ URL công khai...`);
      const response = await fetch(publicUrl);
      if (response.ok) {
        const text = await response.text();
        console.log(`[Test] Nội dung lấy được từ R2: "${text}"`);
        if (text === fileContent) {
          console.log(`[Test] ✅ Nội dung khớp hoàn toàn! Xác minh R2 hoạt động tốt.`);
        } else {
          console.warn(`[Test] ⚠️ Nội dung nhận về không khớp.`);
        }
      } else {
        console.warn(`[Test] ⚠️ Không thể kết nối hoặc tải file từ URL (Status: ${response.status}). Điều này có thể xảy ra nếu R2 Bucket chưa được mở quyền Public hoặc Domain chưa trỏ đúng.`);
      }
    }
  } catch (error: any) {
    console.error(`[Test] ❌ Lỗi khi kiểm tra upload:`, error);
  } finally {
    // Xóa file local sau khi test
    try {
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log(`[Test] Đã dọn dẹp tệp test local.`);
      }
    } catch (cleanupErr) {
      // Bỏ qua lỗi dọn dẹp
    }
  }
}

testUpload();
