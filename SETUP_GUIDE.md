# 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Hệ Thống SmartSaving

Dự án SmartSaving hiện tại bao gồm 3 phần chính:
- **Frontend** (ReactJS, Vite)
- **Backend** (Spring Boot)
- **Database** (PostgreSQL/MySQL)

Để hệ thống chạy mượt mà trên mọi thiết bị (clone về là chạy được), chúng tôi khuyến nghị sử dụng **Docker**. Dưới đây là hướng dẫn chi tiết từ A-Z.

---

## Cách 1: Khởi chạy nhanh gọn với Docker (Khuyên dùng)

Với Docker, bạn không cần cài đặt Node.js hay Java JDK gì cả. Mọi thứ đã được đóng gói sẵn.

### Yêu cầu tiên quyết:
- Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Các bước thực hiện:

1. **Clone mã nguồn về máy local:**
   ```bash
   git clone https://github.com/DUCANHUIT37/-SE104.Q21-GROUR-6---SMARTSAVING.git
   cd -SE104.Q21-GROUR-6---SMARTSAVING
   ```

2. **Cấu hình biến môi trường bảo mật (BẮT BUỘC):**
   Backend cần thông tin để kết nối với cơ sở dữ liệu. 
   - Đi tới thư mục `backend/`.
   - Copy file `.env.example` và đổi tên thành `.env`.
   - Mở file `.env` bằng Notepad/VSCode và điền thông tin mật khẩu thật vào biến `DB_PASSWORD`.
   *(Lưu ý: Không bao giờ được commit file `.env` thật lên Github).*

3. **Khởi chạy hệ thống bằng 1 lệnh duy nhất:**
   - Quay trở lại **thư mục gốc** của dự án (nơi có file `docker-compose.yml`).
   - Mở Terminal và chạy lệnh:
   ```bash
   docker-compose up -d --build
   ```
   *Lệnh này sẽ tự động tải các dependencies, biên dịch Java (Maven), tải Node.js packages và khởi chạy server.*

4. **Kiểm tra kết quả:**
   - **Frontend:** Truy cập `http://localhost:5173`
   - **Backend API:** Sẵn sàng tại `http://localhost:8080/api`

*(Để tắt hệ thống, chạy lệnh: `docker-compose down`)*

---

## Cách 2: Khởi chạy thủ công (Dành cho Developer)

Nếu bạn muốn code và chỉnh sửa trực tiếp, bạn cần khởi chạy frontend và backend tách biệt ở chế độ Development.

### Yêu cầu tiên quyết:
- **Node.js** (v18.x trở lên).
- **Java JDK 17**.

### Bước 1: Khởi chạy Backend (Spring Boot)
1. Mở Terminal thứ nhất, di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cấu hình `.env`: Copy `.env.example` thành `.env` và điền `DB_PASSWORD`.
3. Chạy lệnh:
   - Trên Windows: `.\mvnw.cmd clean spring-boot:run`
   - Trên Mac/Linux: `./mvnw clean spring-boot:run`
*(Hệ thống sẽ chạy ở port 8080).*

### Bước 2: Khởi chạy Frontend (ReactJS/Vite)
1. Mở Terminal thứ hai, di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy:
   ```bash
   npm run dev
   ```
*(Frontend sẽ hiển thị ở `http://localhost:5173`).*

---

## 🛠 Xử lý một số lỗi thường gặp

1. **Lỗi `ClassNotFoundException` ở Backend:**
   - Hiện tượng: Chạy `spring-boot:run` báo lỗi không tìm thấy class `SmartSaving`.
   - Cách sửa: Chạy kèm từ khóa `clean` để Maven xóa cache cũ: `.\mvnw.cmd clean spring-boot:run`.

2. **Lỗi `Connection Refused` với Database:**
   - Hiện tượng: Backend không khởi động được, văng lỗi Timeout / Connection Refused.
   - Cách sửa: Kiểm tra lại file `backend/.env`. Đảm bảo file tên đúng là `.env` (không có đuôi `.txt`) và mật khẩu `DB_PASSWORD` đã chính xác.

3. **Frontend gọi API bị lỗi CORS:**
   - Hệ thống đã được cấu hình mở CORS nội mạng. Đảm bảo frontend đang gọi đúng IP của backend.

---
*Mọi thắc mắc trong quá trình setup, vui lòng xem tại phần Issues của Github hoặc báo lại cho trưởng nhóm.*
