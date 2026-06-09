import { execFileSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

interface CopywritingInput {
  productName: string;
  description: string;
  price: string;
}

export async function generateCopywriting(input: CopywritingInput): Promise<{ caption: string; script: string }> {
  console.log(`[Vinci-Writer] Đang soạn nội dung tiếp thị cho sản phẩm: "${input.productName}"`);

  const prompt = `Hãy viết caption bán hàng ngắn gọn thu hút và kịch bản video review 30-45 giây (Hook -> Painpoint -> Solution -> CTA) cho sản phẩm sau bằng Tiếng Việt.
Tên sản phẩm: ${input.productName}
Mô tả: ${input.description}
Giá bán: ${input.price}

Trả về DUY NHẤT một chuỗi JSON có cấu trúc chính xác như sau, không kèm theo bất kỳ văn bản giải thích hay markdown codeblock nào:
{
  "caption": "nội dung caption...",
  "script": "nội dung kịch bản..."
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
    if (parsed.caption && parsed.script) {
      console.log(`[Vinci-Writer] ✅ Đã sinh nội dung tiếp thị thành công từ agy CLI.`);
      return {
        caption: parsed.caption,
        script: parsed.script
      };
    } else {
      throw new Error('Dữ liệu trả về thiếu trường caption hoặc script');
    }
  } catch (error: any) {
    console.warn(`[Vinci-Writer] ⚠️ Thất bại khi sinh nội dung qua agy CLI (${error.message}). Tự động sử dụng bộ sinh Template Fallback.`);
  }

  // Fallback template-based copy generation
  return generateTemplateCopywriting(input);
}

function generateTemplateCopywriting(input: CopywritingInput) {
  const { productName, price, description } = input;
  
  // Trích xuất một số ý từ mô tả
  const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
  
  const caption = `🔥 SIÊU PHẨM MỚI TOANH: ${productName}! 🔥\n\n` +
    `👉 Chỉ với ${price}, bạn đã sở hữu ngay sản phẩm chất lượng vượt trội.\n` +
    `✨ Mô tả: ${shortDesc}\n` +
    `💬 Xem ngay link ở phần bình luận bên dưới để nhận ưu đãi độc quyền hôm nay nhé! 👇\n\n` +
    `#affiliate #reviewanngon #hotdeal #muangay #virtualinfluencer`;

  const script = `Chào mọi người nha! Hôm nay mình sẽ review cho các bạn một sản phẩm siêu hot dạo gần đây, đó chính là chiếc ${productName}. ` +
    `Với mức giá cực kỳ phải chăng chỉ ${price}, em này thực sự là một món hời. ` +
    `Điểm cộng lớn nhất là ${shortDesc.replace(/\n/g, ' ')}. ` +
    `Bạn nào muốn mua thì nhấp ngay vào giỏ hàng hoặc link bên dưới để nhận ưu đãi tốt nhất hôm nay nha!`;

  return { caption, script };
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
