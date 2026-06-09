import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import dotenv from 'dotenv';
import { controlAlibabaCloud } from './services/gpu_controller.js';
import { generateMedia } from './services/media_generator.js';
import { scrapeProduct } from './services/product_scraper.js';
import { generateCopywriting } from './services/copywriter.js';
import { publishPost } from './services/social_publisher.js';

dotenv.config();

// Trình điều phối Squad Agent (Simulation)
async function main() {
  console.log('=== MULTICA SQUAD AUTOPILOT STARTING ===');
  
  const squadPath = path.join(process.cwd(), '.multica/squad.yml');
  const autopilotPath = path.join(process.cwd(), '.multica/autopilot.json');
  
  if (!fs.existsSync(squadPath) || !fs.existsSync(autopilotPath)) {
    console.error('Lỗi: Thiếu cấu hình squad.yml hoặc autopilot.json trong thư mục .multica');
    process.exit(1);
  }

  try {
    const squadConfig = YAML.parse(fs.readFileSync(squadPath, 'utf8'));
    const autopilotConfig = JSON.parse(fs.readFileSync(autopilotPath, 'utf8'));

    console.log(`\nActive Squad: ${squadConfig.squad.name}`);
    console.log(`Leader: ${squadConfig.squad.leader.name} (${squadConfig.squad.leader.role})`);
    console.log(`Đang chạy chiến dịch trên Autopilot: ${autopilotConfig.autopilots[0].name}`);
    
    // Nhận URL sản phẩm từ đối số dòng lệnh hoặc dùng mặc định
    const args = process.argv.slice(2);
    const productUrl = args.find(arg => !arg.startsWith('-')) || 'https://shopee.vn/croissant-socola-phap';

    // Điều phối luồng chạy tuần tự của leader Aegis
    console.log('\n[Aegis-Affiliate] Đang khởi chạy quy trình tự động...');
    
    console.log('\nStep 1: Gọi Scrapy (product-scraper) để quét dữ liệu...');
    const scraperOutput = await scrapeProduct(productUrl);
    console.log(`[Scrapy] Hoàn thành. Trả về sản phẩm: "${scraperOutput.productName}"`);

    console.log('\nStep 2: Giao việc cho Vinci-Writer (copywriter) để sinh nội dung...');
    const copywriterOutput = await generateCopywriting({
      productName: scraperOutput.productName,
      description: scraperOutput.description || scraperOutput.productName,
      price: scraperOutput.price
    });
    console.log(`[Vinci-Writer] Hoàn thành. Đã viết xong kịch bản review.`);

    let mediaOutput;
    let isGpuStarted = false;

    const accessKeyId = process.env.ALIBABA_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIBABA_ACCESS_KEY_SECRET;
    const instanceId = process.env.ALIBABA_INSTANCE_ID;
    const isRealAlibaba = accessKeyId && accessKeySecret && instanceId && 
                          !accessKeyId.startsWith('mock') && 
                          !accessKeySecret.startsWith('mock') && 
                          !instanceId.startsWith('mock');

    if (isRealAlibaba) {
      console.log('\n[Aegis-Affiliate] Phát hiện cấu hình Alibaba Cloud thật. Đang khởi tạo quy trình tự động bật/tắt máy ảo GPU...');
      try {
        console.log('[Aegis-Affiliate] Đang gửi lệnh khởi động máy ảo ECS GPU...');
        const startResult = await controlAlibabaCloud('StartInstance');
        if (!startResult.success) {
          throw new Error(`Không thể khởi động máy chủ GPU: ${startResult.error || startResult.message}`);
        }
        isGpuStarted = true;

        let ipAddress = '';
        console.log('[Aegis-Affiliate] Đang kiểm tra trạng thái máy chủ (polling)...');
        for (let i = 0; i < 60; i++) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const statusResult = await controlAlibabaCloud('DescribeInstanceStatus');
          if (statusResult.success && statusResult.data) {
            const status = statusResult.data.Status;
            console.log(`[Aegis-Affiliate] Trạng thái hiện tại: ${status}`);
            if (status === 'Running') {
              ipAddress = statusResult.data.PublicIp;
              break;
            }
          }
        }

        if (!ipAddress) {
          throw new Error('Máy chủ GPU không khởi động thành công hoặc không nhận được IP Public sau 5 phút.');
        }
        console.log(`[Aegis-Affiliate] Máy chủ GPU đã sẵn sàng. IP: ${ipAddress}`);

        console.log('\nStep 3: Giao việc cho Cinematico-Media (media-producer) để sinh video & voice...');
        const comfyApiUrl = `http://${ipAddress}:8188`;
        const genResult = await generateMedia({
          script: copywriterOutput.script,
          influencerName: "Khánh Linh",
          productImage: scraperOutput.images[0],
          comfyApiUrl: comfyApiUrl,
          veoPrompt: copywriterOutput.veo_prompt
        });

        if (!genResult.success) {
          throw new Error(`Lỗi sinh media: ${genResult.error}`);
        }

        mediaOutput = {
          videoUrl: genResult.videoUrl!,
          voiceUrl: genResult.voiceUrl!,
          lipsyncStatus: "completed"
        };
        console.log(`[Cinematico-Media] Đã sinh xong video với khuôn mặt Influencer đồng nhất & lồng tiếng.`);
      } catch (error: any) {
        console.error(`[Aegis-Affiliate] ❌ Lỗi trong quy trình chạy GPU thật: ${error.message}`);
        throw error;
      } finally {
        if (isGpuStarted) {
          console.log('[Aegis-Affiliate] Đang tự động gửi lệnh tắt máy ảo GPU để tiết kiệm chi phí...');
          await controlAlibabaCloud('StopInstance');
        }
      }
    } else {
      console.log('\n[Aegis-Affiliate] Chạy ở chế độ Giả lập (Simulation Mode)...');
      console.log('\nStep 3: Giao việc cho Cinematico-Media (media-producer) để sinh video & voice...');
      const genResult = await generateMedia({
        script: copywriterOutput.script,
        influencerName: "Khánh Linh",
        productImage: scraperOutput.images[0],
        veoPrompt: copywriterOutput.veo_prompt
      });

      if (!genResult.success) {
        throw new Error(`Lỗi sinh media giả lập: ${genResult.error}`);
      }

      mediaOutput = {
        videoUrl: genResult.videoUrl!,
        voiceUrl: genResult.voiceUrl!,
        lipsyncStatus: "completed"
      };
      console.log(`[Cinematico-Media] Đã sinh xong video với khuôn mặt Influencer đồng nhất & lồng tiếng.`);
    }

    console.log('\nStep 4: Giao việc cho Publi (social-publisher) để xuất bản bài viết...');
    const publishResult = await publishPost({
      videoUrl: mediaOutput.videoUrl,
      caption: copywriterOutput.caption,
      platforms: ['tiktok', 'facebook']
    });
    
    if (!publishResult.success) {
      console.log('[Publi] Một số nền tảng hoặc dịch vụ đang ở chế độ giả lập.');
    }

    console.log('\n=== MULTICA SQUAD AUTOPILOT COMPLETED SUCCESSFUL ===');
  } catch (error) {
    console.error('Lỗi khi điều phối squad:', error);
    process.exit(1);
  }
}

main();
