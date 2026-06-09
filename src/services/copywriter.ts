import { execFileSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

interface CopywritingInput {
  productName: string;
  description: string;
  price: string;
}

export interface CopywritingOutput {
  caption: string;
  script: string;
  veo_prompt: string;
}

export async function generateCopywriting(input: CopywritingInput): Promise<CopywritingOutput> {
  console.log(`[Vinci-Writer] Đang soạn nội dung tiếp thị cho sản phẩm: "${input.productName}"`);

  const prompt = `Hãy đóng vai một KOC/Vlogger người Việt 24 tuổi cực kỳ gần gũi, dí dỏm. Hãy viết bài viết quảng bá sản phẩm theo phong cách tự nhiên (review trải nghiệm thực tế, không tạo cảm giác bán hàng).
Sản phẩm: ${input.productName}
Mô tả chi tiết: ${input.description}
Giá sản phẩm: ${input.price}

Yêu cầu nội dung:
1. KHÔNG được dùng các từ quảng cáo công nghiệp như: siêu phẩm, chất lượng vượt trội, cam kết 100%, hàng đầu, chính hãng giá rẻ nhất.
2. Viết 1 kịch bản video review (script) dài 30-45 giây:
   - Hook: Mở đầu bằng một tình huống thực tế đời thường hoặc một nỗi đau nhỏ liên quan đến sản phẩm để tạo sự đồng cảm.
   - Body: Trải nghiệm thực tế của bản thân qua các giác quan (mùi, vị, cảm giác sử dụng) thay vì liệt kê thông số.
   - Nhược điểm thực tế: Nhắc tới 1 khuyết điểm vô hại của sản phẩm để tăng tính tin cậy (Ví dụ: hộp hơi đơn giản, hoặc ăn ngon quá nhanh hết).
   - CTA: Tự nhiên, rủ rê người xem cùng bàn luận hoặc xem link dưới comment.
3. Viết 1 caption đăng kèm video với hook thu hút, các icon sinh động và hashtags tự nhiên.
4. Tạo 1 prompt tiếng Anh chi tiết (veo_prompt) để dùng cho công cụ tạo ảnh/video Google Veo 3. Prompt này phải mô tả một khung cảnh thực tế đời thường kiểu tự quay (UGC aesthetic - ví dụ: smartphone vlog camera, cận cảnh sản phẩm trên bàn làm việc/bàn ăn, ánh sáng tự nhiên ấm áp, bối cảnh thực tế không phải phông trắng studio).

Trả về DUY NHẤT một chuỗi JSON có cấu trúc chính xác như sau, không kèm theo bất kỳ văn bản giải thích hay markdown codeblock nào:
{
  "caption": "nội dung caption...",
  "script": "nội dung kịch bản...",
  "veo_prompt": "prompt tiếng Anh sinh hình ảnh/video UGC cho Veo 3..."
}`;

  try {
    console.log(`[Vinci-Writer] Đang gửi yêu cầu sinh nội dung qua agy CLI...`);
    const stdout = execFileSync('agy', ['--print', prompt], { encoding: 'utf8' });
    let text = stdout.trim();

    // Loại bỏ markdown code blocks nếu có
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    }

    const parsed = JSON.parse(text);
    if (parsed.caption && parsed.script && parsed.veo_prompt) {
      console.log(`[Vinci-Writer] ✅ Đã sinh nội dung tiếp thị thành công từ agy CLI.`);
      return {
        caption: parsed.caption,
        script: parsed.script,
        veo_prompt: parsed.veo_prompt
      };
    } else {
      throw new Error('Dữ liệu trả về thiếu trường caption, script hoặc veo_prompt');
    }
  } catch (error: any) {
    console.warn(`[Vinci-Writer] ⚠️ Thất bại khi sinh nội dung qua agy CLI (${error.message}). Tự động sử dụng bộ sinh Template Fallback.`);
  }

  // Fallback template-based copy generation
  return generateTemplateCopywriting(input);
}

function generateTemplateCopywriting(input: CopywritingInput): CopywritingOutput {
  const { productName, price, description } = input;
  
  // Trích xuất một số ý từ mô tả
  const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
  
  const caption = `🤔 Có bao giờ bạn nhìn xung quanh căn phòng hay outfit của mình và tự hỏi: "Hình như đang thiếu cái gì đó?"\n\n` +
    `👉 Đó chính là lúc bạn cần em ${productName} này rồi! Đây là món đồ nhỏ gọn giúp mọi thứ trở nên có gu và phong cách hơn hẳn.\n` +
    `✨ Trải nghiệm thực tế: ${shortDesc}\n` +
    `💬 Link mua em này mình gom trong bio nha, ai dùng thử rồi thì để lại cảm nhận ở comment xem giống mình không nhé! 👇\n\n` +
    `#koc #reviewchanthuc #reviewngan #goctrangtri #virtualinfluencer`;

  const script = `Chào mọi người nha! Có bao giờ bạn cảm thấy góc học tập hay outfit của mình cứ bị trống trải, thiếu thiếu một điểm nhấn không? ` +
    `Mình cũng từng như vậy cho tới khi tự rước em ${productName} này về. Em này có mức giá khá dễ chịu chỉ tầm ${price}. ` +
    `Điểm mình cực ưng là ${shortDesc.replace(/\n/g, ' ')}. ` +
    `Điểm trừ nhẹ chắc là lúc mới nhận về vỏ hộp hơi tối giản xíu, nhưng chất lượng bên trong thì không chê vào đâu được. ` +
    `Link mua mình để trong bio nha, bạn nào cần thì ghé xem thử nhé!`;

  const veo_prompt = `A close-up vertical smartphone vlog style shot of ${productName} sitting on a warm wooden table. Cozy home room in the background, soft morning sunlight, realistic texture, shallow depth of field, raw UGC aesthetic.`;

  return { caption, script, veo_prompt };
}

// Chạy thử độc lập
const args = process.argv.slice(2);
if (args.includes('--run')) {
  generateCopywriting({
    productName: "Bánh Sừng Bò Pháp Nhân Socola",
    description: "Bánh làm từ bột mì nguyên cám Pháp, bơ lạt nguyên chất và nhân socola chip ngọt ngào tan chảy.",
    price: "120.000 VND"
  }).then(res => {
    console.log('\n[Copywriter Output]:', JSON.stringify(res, null, 2));
  });
}
