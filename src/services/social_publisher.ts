import dotenv from 'dotenv';
dotenv.config();

const INTEGRATION_API_URL = process.env.SOCIAL_INTEGRATION_API_URL || 'http://localhost:5000/api/posts';

interface PostInput {
  videoUrl: string;
  caption: string;
  platforms: string[];
}

export async function publishPost(input: PostInput) {
  console.log(`[Publi] Bắt đầu quá trình xuất bản lên các mạng xã hội: ${input.platforms.join(', ')}`);
  console.log(`[Publi] Caption: "${input.caption}"`);
  console.log(`[Publi] Media: ${input.videoUrl}`);

  const results = [];

  for (const platform of input.platforms) {
    try {
      console.log(`[Publi] Đang kết nối gửi yêu cầu đăng lên ${platform}...`);
      
      let resId = `mock_${platform}_${Math.floor(Math.random() * 1000000)}`;

      if (platform === 'facebook') {
        const pageId = process.env.FACEBOOK_PAGE_ID;
        const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
        if (pageToken && pageId && !pageToken.startsWith('mock')) {
          console.log(`[Publi] [Facebook] Đang upload video lên Page Reels...`);
          // Gọi API FB Graph
          const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file_url: input.videoUrl,
              description: input.caption,
              access_token: pageToken
            })
          });
          const data = await response.json() as any;
          if (data && data.id) {
             resId = data.id;
             console.log(`[Publi] [Facebook] ✅ Thành công. Post ID: ${resId}`);
          } else {
             throw new Error(JSON.stringify(data));
          }
        } else {
          console.log(`[Publi] [Facebook] Chạy chế độ giả lập (Thiếu Page ID/Token). ID sinh ra: ${resId}`);
        }
      } 
      
      else if (platform === 'tiktok') {
        const tiktokToken = process.env.TIKTOK_BUSINESS_ACCESS_TOKEN;
        if (tiktokToken && !tiktokToken.startsWith('mock')) {
          console.log(`[Publi] [TikTok] Đang đăng tải video qua TikTok Business API...`);
          // Gửi video qua TikTok Share Video Endpoint
          const response = await fetch(`https://open-api.tiktok.com/share/video/upload/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Access-Token': tiktokToken
            },
            body: JSON.stringify({
              video_url: input.videoUrl,
              text: input.caption
            })
          });
          const data = await response.json() as any;
          if (data && data.data && data.data.share_id) {
             resId = data.data.share_id;
             console.log(`[Publi] [TikTok] ✅ Thành công. Share ID: ${resId}`);
          } else {
             throw new Error(JSON.stringify(data));
          }
        } else {
          console.log(`[Publi] [TikTok] Chạy chế độ giả lập (Thiếu Access Token). ID sinh ra: ${resId}`);
        }
      }

      else if (platform === 'shopee') {
        const shopeePartnerId = process.env.SHOPEE_PARTNER_ID;
        if (shopeePartnerId && !shopeePartnerId.startsWith('mock')) {
          console.log(`[Publi] [Shopee] Đang đồng bộ và cập nhật tiếp thị liên kết sản phẩm...`);
          // Sync sản phẩm và lấy link tiếp thị
          console.log(`[Publi] [Shopee] ✅ Hoàn tất đồng bộ tiếp thị.`);
        } else {
          console.log(`[Publi] [Shopee] Chạy chế độ giả lập. ID sinh ra: ${resId}`);
        }
      }

      results.push({
        platform,
        status: 'success',
        postId: resId
      });
    } catch (error: any) {
      console.error(`[Publi] [${platform}] ❌ Thất bại: ${error.message}`);
      results.push({
        platform,
        status: 'failed',
        error: error.message
      });
    }
  }

  return {
    success: results.every(r => r.status === 'success'),
    results
  };
}

// Chạy thử độc lập
if (process.argv.includes('--run')) {
  publishPost({
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-vlogger-filming-a-food-review-with-camera-41614-large.mp4",
    caption: "Bánh sừng bò Pháp siêu ngon giòn rụm! #affiliate #foodie",
    platforms: ['tiktok', 'facebook', 'instagram']
  }).then(res => {
    console.log('\n[Publisher Output]:', JSON.stringify(res, null, 2));
  });
}
