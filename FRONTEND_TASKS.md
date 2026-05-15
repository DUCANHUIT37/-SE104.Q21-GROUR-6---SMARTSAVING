# 🌟 SmartSaving - Frontend Development Tasks

Danh sách công việc và hướng dẫn làm việc dành cho team Frontend dự án **SmartSaving**.

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy

Để bắt đầu làm việc với dự án, hãy đảm bảo bạn đã cài đặt đủ môi trường và làm theo các bước sau.

### Yêu cầu môi trường (Prerequisites)
- **Node.js**: Khuyên dùng phiên bản **v18.x** trở lên.
- **Trình quản lý gói**: `npm` hoặc `yarn`.

### Các bước cài đặt (Installation)
1. **Clone repository về máy local:**
   ```bash
   git clone https://github.com/DUCANHUIT37/-SE104.Q21-GROUR-6---SMARTSAVING.git
   cd -SE104.Q21-GROUR-6---SMARTSAVING
   ```

2. **Cài đặt thư viện gốc:**
   ```bash
   npm install
   ```

3. **Các thư viện bổ sung (Dependencies) chính đang sử dụng:**
   - `react-router-dom`: Quản lý luồng điều hướng và chuyển trang.
   - `tailwindcss`: Framework CSS Utility-first dùng để dựng UI nhanh chóng.
   - `lucide-react`: Bộ icon chuẩn UI/UX hiện đại.
   - `recharts`: Thư viện vẽ biểu đồ cho phần Dashboard và Báo cáo.
   - `react-hot-toast`: Hiển thị thông báo (toast) đẹp mắt.
   - `date-fns`: Xử lý và định dạng ngày tháng.

4. **Lưu ý về file môi trường (.env):**
   - Hiện tại dự án đang sử dụng Mock Data (Fake Database), nhưng khi có API thực tế, hãy copy file `.env.example` thành `.env` để cấu hình các đường dẫn API ảo/thật cần thiết.

### Lệnh khởi chạy (Run)
Mở terminal và chạy lệnh sau để khởi động môi trường dev local:
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:5173`.

---

## 📌 Quy trình làm việc (Workflow)

Để đảm bảo source code gọn gàng và không bị conflict, toàn team vui lòng tuân thủ quy trình sau:
1. **Nhận việc:** Khi bắt đầu làm một Module, hãy điền tên mình (ví dụ: `[@YourName]`) vào cạnh task trong phần **To-Do** bên dưới.
2. **Cập nhật trạng thái:** Khi hoàn thành, đổi `[ ]` thành `[x]` và ghi chú mã Commit bên cạnh để team dễ theo dõi.
3. **Commit theo tính năng:** Chia nhỏ commit theo từng màn hình/tính năng nhỏ (Ví dụ: `feat: add empty state to passbooks table`). KHÔNG commit một file khổng lồ.

---

## ⚠️ Lưu ý UI/UX quan trọng

Khi phát triển các màn hình tiếp theo, hãy luôn nhớ:
- **Thuật ngữ ngân hàng:** Luôn sử dụng từ **"Số Dư Hiện Tại"** thay vì "Tiền Gốc" để đảm bảo tính chuyên nghiệp của nghiệp vụ tài chính.
- **Xử lý Empty State:** Bất kỳ bảng hay danh sách nào không có dữ liệu đều phải có UI hiển thị trạng thái trống (Empty State) kèm icon thân thiện, KHÔNG được để bảng trắng trơn.
- **Nguồn dữ liệu:** Hiện tại chúng ta đang sử dụng dữ liệu giả lập từ `src/data/fakeDb.js`. Hãy `import` các biến từ đây để render thay vì gọi API thực cho đến khi Backend hoàn thiện.

---

## ✅ Các công việc ĐÃ hoàn thành (Done)

- `[x]` **Setup Dự án nền tảng:** Tích hợp Vite, ReactJS và cấu hình Tailwind CSS.
- `[x]` **Kiến trúc Routing:** Cấu hình `react-router-dom`, RootLayout, và cơ chế Protected Routes (Phân quyền cơ bản).
- `[x]` **Giao diện cốt lõi:** Hoàn thiện Sidebar Menu có thể thu phóng, Header Navigation.
- `[x]` **Module Tổng quan (Dashboard):** Dựng UI các thẻ thống kê tổng quan và biểu đồ Area Chart.
- `[x]` **Module Mở Sổ Mới:** Dựng Layout 3 cột hiện đại, form nhập liệu có Sidebar tóm tắt tính lãi suất real-time.
- `[x]` **Module Danh Sách Sổ (Passbooks):**
  - `[x]` Xây dựng cấu trúc bảng hiển thị dữ liệu sổ.
  - `[x]` Tích hợp Modal Action hợp nhất (Xử lý Gửi thêm / Rút tiền) với cảnh báo đáo hạn.
  - `[x]` Rút gọn hiển thị Mã Số, gộp cột Khách Hàng.
  - `[x]` **Nâng cấp UI/UX:** Cột Số Thứ Tự (STT), thuật ngữ "Số Dư Hiện Tại", và UI phân trang.
  - `[x]` **Tính năng Sorting:** Thuật toán sắp xếp 3-trạng thái (Asc->Desc->None) kèm Icon mũi tên cho các Header cột.
- `[x]` **Module Lịch sử & Giao dịch:** Hoàn thành UI bảng Lịch sử (rút gọn ID, màu sắc theo loại GD, thông tin lãi suất).

---

## 🚧 Các công việc CẦN LÀM (To-Do)

### Module Tổng quan (Dashboard)
- `[ ]` Tích hợp logic tính toán tự động từ `fakeDb.js` để dữ liệu biểu đồ tự thay đổi khi có giao dịch mới thay vì fix cứng.

### Module Mở sổ mới
- `[ ]` Cập nhật ràng buộc: Số tiền tối thiểu mở sổ phải >= 1.000.000đ (dựa vào cấu hình tham số).

### Module Lịch sử & Giao dịch
- `[ ]` Hoàn thiện tính năng Filter theo Date Range Picker (Từ ngày - Đến ngày).

### Module Báo cáo kế toán
- `[ ]` Dựng UI màn hình Báo Cáo Doanh Số Hoạt Động Theo Ngày (Bảng dữ liệu theo ngày/tháng).
- `[ ]` Xây dựng bảng chi tiết doanh số (Tổng thu, Tổng chi, Chênh lệch).
- `[ ]` Dựng UI màn hình Báo Cáo Mở / Đóng Sổ Theo Tháng.
- `[ ]` Thêm tính năng xuất biểu mẫu Báo cáo ra Excel/PDF.

### Module Cài đặt tham số
- `[ ]` Dựng giao diện danh sách Các loại Tiết Kiệm hiện có.
- `[ ]` Xây dựng Form Thêm/Sửa/Xóa cấu hình Loại Tiết Kiệm (Form thay đổi lãi suất).
- `[ ]` Xây dựng Form cấu hình Tham Số Hệ Thống (Tiền gửi tối thiểu 1tr, Thời gian gởi tối thiểu).
