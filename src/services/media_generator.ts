import dotenv from 'dotenv';
dotenv.config();

const COMFY_API_URL = process.env.COMFY_API_URL || 'http://127.0.0.1:8188';

interface MediaGenInput {
  script: string;
  influencerName: string;
  productImage?: string;
  comfyApiUrl?: string;
  veoPrompt?: string;
  voice?: string;
}

export async function generateMedia(input: MediaGenInput) {
  console.log(`[Cinematico-Media] Đang chuẩn bị sinh nội dung hình ảnh & video cho Influencer: ${input.influencerName}`);
  console.log(`[Cinematico-Media] Kịch bản: "${input.script}"`);

  const apiUrl = input.comfyApiUrl || COMFY_API_URL;

  try {
    const fs = await import('fs');
    const path = await import('path');
    const { execSync } = await import('child_process');
    const assetsDir = path.join(process.cwd(), 'assets');

    // 1. Gửi prompt sinh video/B-roll qua veo_generator.py
    console.log(`[Cinematico-Media] Bước 1: Đang gửi kịch bản đến veo_generator.py...`);
    let videoUrl = "assets/temp_broll.png";
    try {
      const veoPrompt = input.veoPrompt || `An extremely detailed close-up shot of the product, showcasing textures and design details, resting on a rustic wooden table with warm, natural side lighting, shallow depth of field, shot on a 35mm lens, photorealistic 8k, professional UGC aesthetic, softly blurred home room background. Context: ${input.script.substring(0, 100)}`;
      console.log(`[Cinematico-Media] Sử dụng prompt Veo 3: "${veoPrompt}"`);
      execSync(`python3 src/services/veo_generator.py "${veoPrompt.replace(/"/g, '\\"')}" "${videoUrl}"`);
      console.log(`[Cinematico-Media] Video B-Roll đã được sinh tại: ${videoUrl}`);
    } catch (err: any) {
      console.warn(`[Cinematico-Media] Cảnh báo chạy veo_generator.py thất bại: ${err.message}. Sử dụng mock video.`);
      videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-vlogger-filming-a-food-review-with-camera-41614-large.mp4";
    }

    // 2. Thu thập danh sách hình ảnh để quay vòng chuyển cảnh
    const imageList: string[] = [];
    
    const facePath = path.join(assetsDir, 'influencer_face.png');
    if (fs.existsSync(facePath)) imageList.push(facePath);
    
    if (fs.existsSync(path.join(process.cwd(), videoUrl))) {
      imageList.push(path.join(process.cwd(), videoUrl));
    } else if (fs.existsSync(path.join(assetsDir, 'temp_broll.png'))) {
      imageList.push(path.join(assetsDir, 'temp_broll.png'));
    }

    if (input.productImage && fs.existsSync(input.productImage)) {
      imageList.push(input.productImage);
    }

    const broll1 = path.join(assetsDir, 'drill_review_broll.png');
    const broll2 = path.join(assetsDir, 'drill_closeup_dial.png');
    const broll3 = path.join(assetsDir, 'drill_action_wood.png');
    if (fs.existsSync(broll1)) imageList.push(broll1);
    if (fs.existsSync(broll2)) imageList.push(broll2);
    if (fs.existsSync(broll3)) imageList.push(broll3);

    const tqPath = path.join(assetsDir, 'influencer_three_quarters.png');
    if (fs.existsSync(tqPath)) imageList.push(tqPath);

    // 3. Thực hiện render video với chuyển cảnh, zoompan và phụ đề tự động timed bằng python compiler
    console.log(`[Cinematico-Media] Bước 2: Đang gọi bộ biên dịch video_renderer.py...`);
    const finalVideoUrl = "assets/temp_broll.mp4";
    const scriptTempFile = path.join(assetsDir, "temp_script.txt");
    
    fs.writeFileSync(scriptTempFile, input.script, 'utf-8');
    const imagesArg = imageList.join(',');
    
    const voiceArg = input.voice ? `--voice "${input.voice}"` : '';
    execSync(`python3 src/services/video_renderer.py --script "${scriptTempFile}" --output "${finalVideoUrl}" --images "${imagesArg}" ${voiceArg}`);
    console.log(`[Cinematico-Media] ✅ Video hoàn chỉnh đã được tạo thành công tại: ${finalVideoUrl}`);

    return {
      success: true,
      videoUrl: finalVideoUrl,
      voiceUrl: "assets/temp_voice_0.wav", // Fallback voice path for backwards compatibility
      influencer: input.influencerName,
      caption: `Review từ ${input.influencerName}: ${input.script}`
    };
  } catch (error: any) {
    console.error(`[Cinematico-Media] Lỗi khi sinh media: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Chạy thử độc lập
if (process.argv.includes('--run')) {
  generateMedia({
    script: "Bánh sừng bò Pháp siêu thơm ngon giòn rụm cả nhà ơi, nhấp vào giỏ hàng ngay nhé!",
    influencerName: "Khánh Linh"
  }).then(res => {
    console.log('\n[MediaGen Output]:', JSON.stringify(res, null, 2));
  });
}
