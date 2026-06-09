# Các Giải pháp Mã nguồn mở (Open-Source) hỗ trợ Hệ thống

Để xây dựng hệ thống tự động hóa Affiliate Marketing bằng AI mà không phụ thuộc vào các dịch vụ SaaS thương mại đắt đỏ, bạn có thể tận dụng và tích hợp các công cụ mã nguồn mở (Open-Source) chất lượng cao dưới đây cho từng cấu phần của dự án.

---

## 1. Thành phần 1: Điều phối AI Agent & Lập lịch công việc (Orchestration & Scheduling)

Trong dự án này, chúng ta sử dụng **Multica AI Autopilot** làm bộ điều phối và lập lịch trung tâm:

*   **Multica AI (Autopilot / Squad)** (Đề xuất chính cho dự án):
    *   *Mục đích*: Điều phối các Agent chạy tự động theo vai trò được cấu hình qua `.multica/squad.yml` và lập lịch chạy định kỳ qua `.multica/autopilot.json`.
    *   *Ứng dụng*: Chạy chiến dịch hàng ngày lúc 8:00 AM để quét sản phẩm -> tạo kịch bản -> gọi sinh video -> đăng bài lên mạng xã hội.
*   **Các giải pháp tham chiếu khác**:
    *   **CrewAI** (Python): Phù hợp nếu muốn viết logic điều phối bằng code Python thuần cho các AI Agent.
    *   **n8n** (Node-based Workflow): Phù hợp nếu muốn quản lý các bước tích hợp thông qua giao diện kéo-thả trực quan.

---

## 2. Thành phần 2: Sinh kịch bản & Biên tập Video tự động (AI Video Gen)

*   **Pixelle-Video** (AIDC-AI - Alibaba) (Khuyên dùng):
    *   *Mục đích*: Engine sinh video ngắn tự động hoàn toàn mã nguồn mở từ Alibaba Intelligent Digital Commerce AI.
    *   *Tính năng*: Tự động hóa toàn bộ quy trình đầu-cuối (End-to-End): từ sinh kịch bản (LLM) -> tạo ảnh/video (qua ComfyUI) -> tạo giọng nói TTS -> biên tập & render video ngắn hoàn chỉnh. Hỗ trợ chạy Web UI trên Streamlit hoặc gọi qua API.
    *   *Link*: [Pixelle-Video Github](https://github.com/AIDC-AI/Pixelle-Video)
*   **ShortGPT** (Python):
    *   *Mục đích*: Framework sinh video ngắn tự động, tự ghép stock footage, lồng tiếng và thêm phụ đề chạy chữ.
    *   *Link*: [ShortGPT Github](https://github.com/RayVentura/ShortGPT)
*   **ComfyUI** (Node-based UI):
    *   *Mục đích*: Công cụ sinh ảnh/video AI mạnh mẽ nhất. Cho phép sử dụng các mô hình Stable Diffusion/Flux kết hợp **IP-Adapter / InstantID** để sinh hình ảnh Virtual Influencer có khuôn mặt đồng nhất 100% qua tất cả các bài viết.
    *   *Link*: [ComfyUI Github](https://github.com/comfyanonymous/ComfyUI)
*   **LivePortrait** (Animation) & **Wav2Lip** (Lipsync):
    *   *Mục đích*: Diễn hoạt khuôn mặt Influencer từ ảnh tĩnh và khớp khẩu hình môi đồng bộ với giọng nói TTS.

---

## 3. Thành phần 3: Sinh giọng nói tiếng Việt tự nhiên (Open TTS)

*   **F5-TTS**:
    *   *Mục đích*: Hệ thống sinh giọng nói (TTS) nhanh và chất lượng cao. Hỗ trợ học giọng mẫu chỉ với đoạn âm thanh 3 giây (Zero-shot Voice Cloning). Cực kỳ thích hợp để sinh giọng Việt đồng nhất cho Virtual Influencer.
    *   *Link*: [F5-TTS Github](https://github.com/SW1729/F5-TTS)
*   **CosyVoice**:
    *   *Mục đích*: Mô hình sinh giọng nói chất lượng phòng thu từ Alibaba, hỗ trợ clone giọng nói và kiểm soát cảm xúc tốt.

---

## 4. Thành phần 4: Tự động đăng tải mạng xã hội (Social Posting)

*   **Mixpost** (PHP/Laravel - Self-hosted):
    *   *Mục đích*: Phần mềm tự quản lý và lên lịch bài đăng mạng xã hội (thay thế cho Ayrshare hoặc Buffer).
    *   *Tính năng*: Cung cấp giao diện Web và APIs kết nối trực tiếp đến API chính thức của TikTok, Facebook, Instagram để tự động lên lịch đăng bài và video.
    *   *Link*: [Mixpost Github](https://github.com/inovector/mixpost)

---

## 💡 Đề xuất Kiến trúc Tích hợp mã nguồn mở cho dự án

Sự kết hợp tối ưu nhất sử dụng Multica AI và Pixelle-Video để xây dựng hệ thống hoàn chỉnh:

```
[Shopee Scraper (Playwright)]
             │
             ▼
[Multica AI Autopilot] (Điều phối & lập lịch chạy bằng squad.yml / autopilot.json)
             │
             ▼
┌──────────────────────────────────────────────┐
│  AI Media Generation Engine (Pixelle-Video)  │
│  - Tạo kịch bản: Gemini / DeepSeek           │
│  - Tạo mặt Influencer: ComfyUI (Flux/SDXL)   │
│  - Tạo giọng đọc: F5-TTS (Giọng Việt)        │
│  - Diễn hoạt & Khớp khẩu hình: LivePortrait  │
└──────────────────────────────────────────────┘
             │
             ▼
[Mixpost API] (Tự động hóa đăng bài lên TikTok/Reels)
```
