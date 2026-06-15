# ==============================================================================
# HƯỚNG DẪN CHẠY COMFYUI TRÊN GOOGLE COLAB
# ==============================================================================
# 1. Truy cập: https://colab.research.google.com/
# 2. Tạo một Notebook mới (New Notebook).
# 3. Kích hoạt GPU: Vào Edit -> Notebook settings -> Chọn T4 GPU -> Save.
# 4. Tạo một code cell mới, copy toàn bộ nội dung file này dán vào cell đó và chạy (Run).
# 5. Đợi khoảng 2-3 phút để cài đặt xong. Sau khi hoàn tất, script sẽ in ra đường dẫn
#    mũi tên trỏ đến URL trycloudflare.com công khai (ví dụ: https://xxx.trycloudflare.com).
# 6. Copy URL đó và dán vào file `.env` của dự án tại biến `COMFY_API_URL` để tích hợp.
# ==============================================================================

# 1. Kiểm tra môi trường GPU
import torch
import sys

print("================================================================================")
print("🔍 ĐANG KIỂM TRA PHẦN CỨNG GPU...")
print("================================================================================")
if not torch.cuda.is_available():
    print("❌ LỖI: Không tìm thấy NVIDIA GPU!")
    print("👉 Hướng dẫn khắc phục: Trên menu Colab, chọn Runtime -> Change runtime type.")
    print("   Tại mục 'Hardware accelerator', chọn 'T4 GPU' (hoặc GPU bất kỳ) rồi nhấn Save.")
    print("   Sau đó chạy lại cell này.")
    sys.exit("Dừng cài đặt do thiếu GPU.")
else:
    print(f"✅ ĐÃ TÌM THẤY GPU: {torch.cuda.get_device_name(0)}")
    print("================================================================================")

# 2. Cài đặt ComfyUI
print("\n🚀 1/5. Đang tải mã nguồn ComfyUI...")
!git clone https://github.com/comfyanonymous/ComfyUI.git
%cd ComfyUI
!pip install -r requirements.txt
!pip install --force-reinstall torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# 3. Cài đặt Custom Nodes (LivePortrait và VideoHelperSuite)
print("\n🚀 2/5. Đang cài đặt các Custom Nodes cho ComfyUI...")
%cd custom_nodes
!git clone https://github.com/Kijai/ComfyUI-LivePortraitKJ.git
!git clone https://github.com/Kosinkadink/ComfyUI-VideoHelperSuite.git
%cd ..

print("\n🚀 3/5. Cài đặt dependencies cho Custom Nodes...")
!pip install -r custom_nodes/ComfyUI-LivePortraitKJ/requirements.txt
!pip install -r custom_nodes/ComfyUI-VideoHelperSuite/requirements.txt
!pip install mediapipe

# 4. Tải Model Weights cho LivePortrait (đã tối ưu sang định dạng .safetensors)
print("\n🚀 4/5. Đang tải model weights cho LivePortrait (từ repository công khai, không cần auth)...")
!mkdir -p models/liveportrait
!wget -q --show-progress -O models/liveportrait/appearance_feature_extractor.safetensors https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/appearance_feature_extractor.safetensors
!wget -q --show-progress -O models/liveportrait/motion_extractor.safetensors https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/motion_extractor.safetensors
!wget -q --show-progress -O models/liveportrait/warping_module.safetensors https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/warping_module.safetensors
!wget -q --show-progress -O models/liveportrait/spade_generator.safetensors https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/spade_generator.safetensors
!wget -q --show-progress -O models/liveportrait/stitching_retargeting_module.safetensors https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/stitching_retargeting_module.safetensors
!wget -q --show-progress -O models/liveportrait/landmark_model.pth https://huggingface.co/Kijai/LivePortrait_safetensors/resolve/main/landmark_model.pth

# 5. Cài đặt Cloudflare Tunnel
print("\n🚀 5/5. Đang cài đặt Cloudflare Tunnel để mở cổng công khai...")
!wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
!dpkg -i cloudflared-linux-amd64.deb

import subprocess
import threading
import time

def run_tunnel():
    process = subprocess.Popen(
        ["cloudflared", "tunnel", "--url", "http://127.0.0.1:8188"], 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        text=True
    )
    for line in iter(process.stdout.readline, ''):
        if "trycloudflare.com" in line:
            print("\n================================================================================")
            print("🔗 COMFYUI PUBLIC API ENDPOINT URL:")
            for word in line.split():
                if "trycloudflare.com" in word:
                    print("👉 " + word.strip())
            print("================================================================================\n")
            break

# Khởi chạy tunnel trong luồng phụ
threading.Thread(target=run_tunnel, daemon=True).start()
time.sleep(3)

# 6. Khởi động ComfyUI
print("\n✨ Đang khởi động ComfyUI...")
!python main.py --listen 127.0.0.1 --port 8188 --enable-cors-header
