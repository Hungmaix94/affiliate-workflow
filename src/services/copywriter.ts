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

  const prompt = `Hãy đóng vai một KOC/Vlogger nam người Việt khoảng 24 tuổi, phong cách bình dân, bụi bặm, dí dỏm, rất bắt trend trên mạng xã hội. Hãy viết bài viết quảng bá sản phẩm theo phong cách review trải nghiệm thực tế, cực kỳ chân thực, không tạo cảm giác bán hàng/quảng cáo.
Sản phẩm: ${input.productName}
Mô tả chi tiết: ${input.description}
Giá sản phẩm: ${input.price}

Yêu cầu nội dung:
1. KHÔNG được dùng các từ quảng cáo công nghiệp như: siêu phẩm, chất lượng vượt trội, cam kết 100%, hàng đầu, chính hãng giá rẻ nhất.
2. Cách xưng hô & Ngôn từ phải cực kỳ Hottrend:
   - Xưng hô với người xem bằng các từ lóng thịnh hành như: "các con vợ", "các ông anh", "các ní", "anh em".
   - Tự xưng là "tôi" hoặc "ông em" hoặc "thằng em".
   - Sử dụng các từ lóng trẻ trung, dí dỏm của giới trẻ Việt Nam (ví dụ: "nhàn tênh", "ngầu lòi", "êm ru", "phèn", "lúa", "chữa lành", "uy tín", "hết nước chấm", "đỉnh nóc kịch trần").
3. Viết 1 kịch bản video review (script) dài 1.5 - 2 phút (tầm 180 - 250 từ) chi tiết và cuốn hút:
   - Hook: Mở đầu bằng một tình huống thực tế đời thường hoặc một nỗi đau nhỏ liên quan đến sản phẩm để tạo sự đồng cảm.
   - Body: Trải nghiệm thực tế của bản thân qua các giác quan (mùi, vị, cảm giác sử dụng) thay vì liệt kê thông số.
   - Nhược điểm thực tế: Nhắc tới 1 khuyết điểm vô hại của sản phẩm để tăng tính tin cậy (Ví dụ: hộp hơi đơn giản, hoặc ăn ngon quá nhanh hết).
   - CTA: Tự nhiên, rủ rê người xem cùng bàn luận hoặc xem link dưới comment.
4. Viết 1 caption đăng kèm video với hook thu hút, các xưng hô hottrend tương tự, các icon sinh động và hashtags tự nhiên.
5. Tạo 1 prompt tiếng Anh cực kỳ chi tiết (veo_prompt) để dùng cho công cụ tạo ảnh/video Google Veo 3. Prompt phải được tối ưu hóa cho chất lượng hình ảnh cao nhất bằng cách mô tả chi tiết: đặc điểm vật lý sản phẩm (màu sắc, hình dạng, chất liệu), cấu hình ánh sáng tự nhiên và điện ảnh (ví dụ: cinematic soft morning light, volumetric ray tracing, warm side light), góc máy và cài đặt camera chuyên nghiệp (ví dụ: vertical macro close-up shot, shallow depth of field, sharp focus, 35mm lens, 8k resolution, photorealistic, UGC vlog style, authentic textures), và bối cảnh phòng ở tự nhiên sống động (ví dụ: cosy wooden table, softly blurred background, no white studio backgrounds).

Trả về DUY NHẤT một chuỗi JSON có cấu trúc chính xác như sau, không kèm theo bất kỳ văn bản giải thích hay markdown codeblock nào:
{
  "caption": "nội dung caption...",
  "script": "nội dung kịch bản...",
  "veo_prompt": "prompt tiếng Anh sinh hình ảnh/video UGC cho Veo 3..."
}`;

  try {
    console.log(`[Vinci-Writer] Đang gửi yêu cầu sinh nội dung qua agy CLI...`);
    const stdout = execFileSync('agy', ['--dangerously-skip-permissions', '--print', prompt], { encoding: 'utf8' });
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

  const script = `Chào mọi người nha! Có bao giờ bạn nhìn xung quanh căn phòng hay bộ đồ của mình rồi tự hỏi hình như đang thiếu cái gì đó không? Mình cũng từng phân vân rất nhiều cho tới khi quyết định rước em ${productName} này về. Với mức giá cực kỳ dễ chịu chỉ tầm ${price}, em nó thực sự là một món đầu tư rất xứng đáng. Trải nghiệm thực tế của mình là ${shortDesc.replace(/\n/g, ' ')}. Điểm cộng lớn nhất chính là cảm giác sử dụng rất thực tế, đầm tay và tiện dụng. Tuy nhiên, để công bằng thì em nó cũng có một khuyết điểm nhỏ là vỏ hộp lúc mới nhận về nhìn hơi tối giản một chút, nhưng bù lại chất lượng bên trong thì cực kỳ tuyệt vời và không chê vào đâu được. Nhìn chung là bỏ ra số tiền này mà giải quyết được bao nhiêu việc thì quá hời luôn. Link mua em này mình gom trong bio nha, bạn nào cần thì ghé xem thử nhé. Ai dùng rồi thì comment bên dưới cho mình biết cảm nhận nha!`;

  const veo_prompt = `An extremely detailed close-up vertical shot of ${productName}, showcasing authentic textures and fine details. The product is placed on a rustic wooden table with soft, natural morning sunlight streaming from the side, creating warm tones. Background is a cozy, modern living room softly blurred, shallow depth of field, shot on a 35mm lens, photorealistic 8k, professional UGC product photography, cinematic lighting.`;

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
