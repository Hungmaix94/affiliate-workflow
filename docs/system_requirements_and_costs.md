# Yêu cầu Hệ thống & Ước tính Chi phí Triển khai

Tài liệu này tổng hợp các yêu cầu kỹ thuật, tài nguyên phần cứng, tài khoản API cần chuẩn bị và dự toán chi phí chi tiết trước khi tiến hành triển khai dự án tự động hóa Affiliate Marketing.

---

## I. Yêu cầu Hệ thống & Tài nguyên cần chuẩn bị

### 1. Phần cứng & Hạ tầng GPU
Việc sinh hình ảnh và video AI đồng nhất khuôn mặt/giọng nói yêu cầu năng lực xử lý GPU rất lớn. Có 2 hướng chuẩn bị hạ tầng:

* **Phương án chạy Local (ComfyUI)**:
  - Máy chủ hoặc PC cá nhân sử dụng Card đồ họa NVIDIA tối thiểu **RTX 3090 hoặc RTX 4090** (24GB VRAM) hoặc dòng GPU chuyên dụng (A100, H100) để chạy các mô hình Flux, Wan2.1, LTX-Video mượt mà.
  - RAM hệ thống tối thiểu **32GB**.
  - Ổ cứng SSD NVMe còn trống từ **100GB - 200GB** để chứa trọng số mô hình (model weights).
* **Phương án chạy Cloud (Khuyên dùng khi bắt đầu)**:
  - Máy tính lập trình chỉ cần cấu hình văn phòng bình thường.
  - Sử dụng API Key hoặc máy ảo của các dịch vụ GPU Cloud như **Alibaba Cloud GPU ECS**, **RunPod**, **Fal.ai**, **Replicate**, hoặc **Vast.ai** để sinh media.

### 2. Tài khoản API & Khóa kết nối (Credentials)
* **AI Core**:
  - `GEMINI_API_KEY` (hoặc `OPENAI_API_KEY`) phục vụ cho việc viết kịch bản, caption tiếp thị và điều phối Squad Agent.
* **Giọng nói (TTS)**:
  - Tài khoản API của các dịch vụ TTS tiếng Việt như **FPT AI, Zalo AI, Viettel AI**, hoặc **ElevenLabs** (nếu muốn clone giọng chất lượng cao).
* **Lưu trữ (Storage)**:
  - S3-compatible cloud storage (như **Cloudflare R2** hoặc **AWS S3**) để làm nơi chứa tạm thời video/hình ảnh trước khi đăng tải lên mạng xã hội.

### 3. Tài khoản Nhà phát triển & Nền tảng (Social & E-commerce)
* **Tài khoản nhà phát triển mạng xã hội**:
  - **Meta Developer App**: Để lấy API Token kết nối Facebook API và Instagram Content Publishing API.
  - **TikTok Developer App**: Để sử dụng Video Upload API.
* **Tài khoản liên kết E-commerce**:
  - Tài khoản **Shopee Affiliate Program** và **Lazada Affiliate Program** để lấy API key tạo link tracking.
  - Tài khoản **TikTok Shop Partner** (nếu cần tự động tạo/đồng bộ sản phẩm lên shop).
* **Proxy (dành cho Scraper)**:
  - Cần chuẩn bị danh sách **Residential Proxies** (Proxy dân cư, ví dụ từ Bright Data hoặc Webshare) để tránh bị chặn IP bởi cơ chế chống bot của Shopee/Lazada khi quét dữ liệu sản phẩm.

### 4. Môi trường phần mềm cài đặt
- **Node.js** v20+.
- **PostgreSQL Database** (sử dụng dịch vụ Cloud Neon hoặc instance local).
- **FFmpeg** được cài đặt và cấu hình trong PATH hệ thống (dùng để ghép voice, video và chạy phụ đề tự động).

---

## II. Dự toán Chi phí Triển khai Chi tiết

### Phương án 1: Sử dụng hoàn toàn Cloud API (Pay-as-you-go)
*Phương án tối ưu nhất cho giai đoạn thử nghiệm (1-2 tháng đầu) vì không mất chi phí mua phần cứng lớn.*

| Thành phần | Dịch vụ đề xuất | Chi phí ước tính | Chi phí trên mỗi Video (30-45 giây) |
| :--- | :--- | :--- | :--- |
| **LLM (Kịch bản & Điều phối)** | Gemini 2.0 Flash / OpenAI GPT-4o-mini | $0.075 - $0.15 / 1 triệu tokens | **~$0.001 (25đ)** |
| **Giọng nói (TTS)** | FPT AI / Zalo AI | 100.000đ - 200.000đ / 1 triệu ký tự | **~$50đ - 100đ** (khoảng 500 ký tự) |
| **Sinh Ảnh (Khuôn mặt Influencer)** | Flux.1 (Replicate / Fal.ai) | $0.003 - $0.03 / ảnh | **~$0.02 (500đ)** |
| **Sinh Video AI (Bối cảnh/Review)** | LTX-Video / Wan2.1 (Fal.ai / Replicate) | $0.05 - $0.15 / clip 5 giây | **~$0.30 - $0.50 (7.500đ - 12.500đ)** (ghép từ 3-4 clip nhỏ) |
| **Khớp khẩu hình (Lipsync)** | LivePortrait / Wav2Lip | ~$0.01 - $0.03 / lượt | **~$0.02 (500đ)** |
| **Proxy (Tránh bot sàn TMĐT)** | Webshare / Bright Data | $3 - $10 / 1 GB dữ liệu | **~$0.01 (250đ)** |
| **Hosting & Database** | Vercel & Neon PostgreSQL | Gói Free/Hobby | **$0** |

> 📌 **Ước tính**:
> * Chi phí sinh mỗi video hoàn chỉnh: **~9.000đ - 14.000đ / video**.
> * Nếu sản xuất đều đặn **10 video/ngày**: Chi phí khoảng **90.000đ - 140.000đ / ngày**.

---

### Phương án 2: Sử dụng Local GPU hoặc Thuê Server GPU riêng
*Phương án tối ưu nhất về lâu dài khi bắt đầu chạy chiến dịch hàng loạt với số lượng lớn (tiết kiệm chi phí vận hành).*

#### A. Đầu tư thiết bị vật lý (Mua máy)
* **Cấu hình PC khuyên dùng**: GPU NVIDIA RTX 4090 (24GB VRAM) + RAM 32GB/64GB + SSD 1TB NVMe.
* **Chi phí đầu tư ban đầu**: Khoảng **45.000.000đ - 55.000.000đ**.
* **Ưu điểm**: Chi phí sinh ảnh, video và giọng nói sau khi mua máy là **gần như bằng 0** (chỉ tốn tiền điện). Phù hợp nếu chạy số lượng lớn >100 video/ngày.

#### B. Thuê GPU Cloud theo giờ (Giải pháp trung gian)
* **Dịch vụ**: RunPod, Alibaba Cloud GPU ECS (chế độ Economical Mode), hoặc Vast.ai (RTX 4090 / A10 / V100).
* **Chi phí**: Khoảng **$0.50 - $0.80 / giờ** (~12.500đ - 20.000đ / giờ).
* **Cách tiết kiệm**: Viết script tự động bật server GPU lúc 8:00 sáng -> sinh toàn bộ 50 video cho cả ngày -> tắt server GPU lúc 9:00 sáng (Alibaba Cloud hoặc RunPod sẽ dừng tính phí GPU/RAM/CPU khi tắt).
* **Tổng chi phí**: Chỉ mất **1 giờ thuê GPU mỗi ngày (~20.000đ/ngày)** để tạo ra lượng video không giới hạn.

---

## III. Khuyến nghị Kế hoạch Triển khai theo giai đoạn

1. **Giai đoạn 1: Phát triển & Thử nghiệm (Tháng 1)**
   - Sử dụng **Cloud API** (Gemini API + FPT AI + Replicate/Fal.ai).
   - Chi phí dự kiến cho lập trình và test thử nghiệm: **~500.000đ - 1.000.000đ** (chỉ trả tiền trên lượt chạy thực tế).
2. **Giai đoạn 2: Vận hành Quy mô vừa (Tháng 2 - 3)**
   - Tích hợp thuê **GPU Cloud (RunPod/Vast.ai)** theo giờ để chạy ComfyUI API riêng. Tự động bật/tắt server để tối ưu hóa chi phí.
   - Chi phí dự kiến: **~600.000đ - 1.000.000đ / tháng** cho toàn bộ hệ thống sản xuất video hàng ngày.
3. **Giai đoạn 3: Vận hành Quy mô lớn (Khi có nguồn thu ổn định)**
   - Mua **PC GPU RTX 4090** riêng để chạy 24/7.
   - Chi phí: **~50.000.000đ đầu tư cố định**, chi phí vận hành hàng tháng dưới **500.000đ** (tiền điện & LLM).
