# Hướng dẫn lấy thông tin Credentials trên Alibaba Cloud

Tài liệu này hướng dẫn chi tiết từng bước cách lấy `ALIBABA_ACCESS_KEY_ID`, `ALIBABA_ACCESS_KEY_SECRET` và `ALIBABA_INSTANCE_ID` từ tài khoản Alibaba Cloud của bạn để cấu hình vào hệ thống điều khiển tự động.

---

## Bước 1: Tạo Access Key (AccessKey ID & AccessKey Secret)
Để đảm bảo an toàn bảo mật, bạn **không nên** dùng Access Key của tài khoản chính (root account), hãy tạo một tài khoản con (RAM User) chuyên dụng cho Agent:

1. Đăng nhập vào [Alibaba Cloud Console](https://home.console.aliyun.com/).
2. Trên thanh tìm kiếm ở đầu trang, gõ **RAM** (Resource Access Management) và truy cập vào dịch vụ RAM.
3. Ở menu bên trái, chọn **Identities** -> **Users**.
4. Bấm nút **Create User**.
5. Nhập thông tin:
   - **Logon Name**: Ví dụ `affiliate-agent`
   - **Display Name**: Ví dụ `Affiliate Agent Controller`
   - **Access Mode**: Tích chọn **OpenAPI Access** (bắt buộc chọn cái này để gọi bằng code API).
6. Bấm **OK**. Hệ thống sẽ hiển thị bảng thông tin gồm:
   - **AccessKey ID** (Ví dụ: `LTAI5t9xxxxxxxxxxxxxx`)
   - **AccessKey Secret** (Ví dụ: `wN21xxxxxxxxxxxxxxxxxxxxxxxx`)
   > ⚠️ **Quan trọng**: Hãy copy và lưu hai mã này ngay lập tức (hoặc bấm **Download CSV**). Alibaba Cloud chỉ hiển thị AccessKey Secret duy nhất một lần tại bước này.

---

## Bước 2: Phân quyền cho RAM User vừa tạo
RAM User mặc định sẽ không có quyền hạn gì. Bạn cần cấp quyền quản lý máy ảo ECS (Elastic Compute Service) cho tài khoản con này:

1. Vẫn tại trang quản lý RAM User vừa tạo, bấm vào tên User `affiliate-agent`.
2. Bấm vào tab **Permissions** -> bấm **Add Permissions**.
3. Tại ô tìm kiếm quyền hạn, gõ **AliyunECSFullAccess** (quyền quản lý toàn bộ máy ảo ECS).
4. Chọn quyền này và bấm **Grant Permission** -> bấm **Complete**.

---

## Bước 3: Lấy Instance ID của máy chủ GPU (ALIBABA_INSTANCE_ID)
Đây là mã định danh duy nhất của máy chủ GPU bạn đã tạo trên Alibaba Cloud:

1. Trên thanh tìm kiếm ở đầu trang Console, gõ **ECS** (Elastic Compute Service) và truy cập vào dịch vụ.
2. Ở menu bên trái, chọn **Instances & Images** -> **Instances**.
3. Chọn đúng **Region** (vùng đất) nơi bạn đã tạo máy ảo GPU ở góc trên cùng bên trái (Ví dụ: *Singapore*, *Kuala Lumpur*,...).
4. Tìm đến máy ảo GPU của bạn trong danh sách.
5. Sao chép chuỗi ký tự tại cột **Instance ID** (thường bắt đầu bằng chữ `i-`, ví dụ: `i-t4n2k12bc5ec38abdf`).

---

## Tóm tắt Cấu hình vào tệp `.env`
Sau khi có đủ thông tin, bạn mở tệp [.env](file:///home/phamhung/Work/Outsource/affiliate-workflow/.env) trong dự án và điền vào các vị trí tương ứng:

```env
ALIBABA_ACCESS_KEY_ID=LTAI5t9xxxxxxxxxxxxxx
ALIBABA_ACCESS_KEY_SECRET=wN21xxxxxxxxxxxxxxxxxxxxxxxx
ALIBABA_INSTANCE_ID=i-t4n2k12bc5ec38abdf
ALIBABA_REGION_ID=ap-southeast-1  # Thay bằng mã vùng của bạn (Singapore là ap-southeast-1)
```
