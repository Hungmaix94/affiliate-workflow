import { generateCopywriting } from './copywriter.js';
import { generateMedia } from './media_generator.js';
import { publishPost } from './social_publisher.js';

async function runDrillTest() {
  console.log('=== CHẠY THỬ QUY TRÌNH REVIEW MÁY KHOAN COBRA ===');
  
  const productInfo = {
    productName: "Máy Khoan Búa Dùng Pin Cobra Hammer Drill",
    price: "1.250.000 VND",
    description: "Máy khoan búa dùng pin Cobra Hammer Drill thiết kế cực kỳ hầm hố với tông màu xám và đen, chữ COBRA đỏ nổi bật. Có tay cầm phụ chống rung màu đen, nút chọn 3 chế độ khoan chuyên nghiệp (khoan thường, khoan búa, đục búa). Máy dùng pin tiện lợi không dây rợ lằng nhằng, cầm đầm tay, chắc chắn."
  };

  // 1. Soạn kịch bản
  const copywriterOutput = await generateCopywriting(productInfo);
  console.log('\n[Bước 1] Kịch bản sinh ra:\n', copywriterOutput.script);
  console.log('\n[Bước 1] Caption bài đăng:\n', copywriterOutput.caption);

  // 2. Sinh video
  console.log('\n[Bước 2] Bắt đầu sinh giọng đọc và ghép video...');
  const mediaOutput = await generateMedia({
    script: copywriterOutput.script,
    influencerName: "Khánh Linh",
    veoPrompt: "A close-up UGC-style vertical smartphone vlog video of a young Vietnamese woman holding and demonstrating a grey and black Cobra cordless hammer drill with red lettering. She is showing the mode selector dial and the black auxiliary handle, standing in a cozy home workshop with tools in the background, natural lighting, realistic"
  });

  // 3. Đăng bài (upload lên R2)
  console.log('\n[Bước 3] Đang tải lên R2...');
  const publishResult = await publishPost({
    videoUrl: mediaOutput.videoUrl!,
    caption: copywriterOutput.caption,
    platforms: ['tiktok']
  });

  console.log('\n=== HOÀN THÀNH REVIEW MÁY KHOAN COBRA ===');
  console.log('Public R2 Video URL:', publishResult.results[0].postId);
}

runDrillTest();
