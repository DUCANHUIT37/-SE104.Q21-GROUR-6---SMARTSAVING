# 💰 SmartSaving

### Nền tảng quản lý sổ tiết kiệm cá nhân hiện đại

[![ReactJS](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> Theo dõi, quản lý và tối ưu hóa các khoản tiết kiệm cá nhân — đơn giản, bảo mật, hiệu quả.
---


## 🌟 Giới thiệu

**SmartSaving** là một nền tảng web quản lý sổ tiết kiệm hiện đại, được xây dựng nhằm giúp người dùng **theo dõi, quản lý và tối ưu hóa** các khoản tiết kiệm cá nhân một cách thông minh.

Dự án lấy cảm hứng từ các hệ thống ngân hàng số và ứng dụng fintech, mang đến cái nhìn rõ ràng về dòng tiền và kế hoạch tài chính — phù hợp cho việc học tập, phát triển cá nhân hoặc làm nền tảng cho các hệ thống tài chính thực tế. Hiện tại dự án hỗ trợ triển khai đồng bộ bằng Docker.

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực bảo mật** | Đăng ký / đăng nhập với JWT Authentication & BCrypt |
| 📒 **Quản lý sổ tiết kiệm** | Tạo và quản lý nhiều sổ tiết kiệm cùng lúc |
| 📊 **Dashboard tổng quan** | Theo dõi tổng số dư, lãi suất, kỳ hạn và ngày đáo hạn |
| 💸 **Giao dịch linh hoạt** | Gửi tiền và rút tiền dễ dàng, xử lý nghiệp vụ rút trước hạn |
| 🕒 **Lịch sử giao dịch** | Xem chi tiết toàn bộ lịch sử nạp/rút tiền |
| ⚙️ **Cấu hình hệ thống** | Admin có quyền điều chỉnh lãi suất, hạn mức gửi |
| 🔍 **Tìm kiếm & Lọc** | Tìm kiếm, lọc và quản lý sổ tiết kiệm nhanh chóng |
| 📱 **Responsive UI** | Giao diện tương thích mọi thiết bị |

---

## 🛠 Tech Stack

### Frontend
| Công nghệ | Vai trò |
|-----------|---------|
| [ReactJS](https://reactjs.org/) | Xây dựng UI theo component |
| [Vite](https://vitejs.dev/) | Build tool nhanh, nhẹ |
| [TailwindCSS](https://tailwindcss.com/) | Styling & responsive layout |
| [Axios](https://axios-http.com/) | HTTP client — gọi REST API, hỗ trợ interceptor |
| [React Router DOM](https://reactrouter.com/) | Điều hướng trang (SPA routing) |

### Backend
| Công nghệ | Vai trò |
|-----------|---------|
| [Spring Boot](https://spring.io/projects/spring-boot) | Framework backend chính |
| [Spring Security](https://spring.io/projects/spring-security) | Xác thực & phân quyền JWT |
| [JPA / Hibernate](https://hibernate.org/) | ORM — tương tác database |
| [PostgreSQL](https://www.postgresql.org/) / Supabase | Hệ quản trị CSDL lưu trữ dữ liệu chính |
| [Docker](https://www.docker.com/) | Containerization để triển khai đồng bộ |
| [Maven](https://maven.apache.org/) | Quản lý dependencies |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT SIDE                       │
│              ReactJS + Vite (port 5173)              │
│         [Pages] → [Components] → [Axios]            │
└────────────────────┬────────────────────────────────┘
                     │ REST API (HTTP/HTTPS)
                     ▼
┌─────────────────────────────────────────────────────┐
│                   SERVER SIDE                        │
│            Spring Boot (port 8080)                   │
│   [Controller] → [Service] → [Repository/JPA]       │
│              Spring Security + JWT                   │
└────────────────────┬────────────────────────────────┘
                     │ JPA / Hibernate
                     ▼
┌─────────────────────────────────────────────────────┐
│                   DATABASE                           │
│             PostgreSQL (Supabase)                    │
│   Users | SavingsBooks | Transactions | Rates        │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Khởi chạy dự án (Local)

Hệ thống được tự động hoá thiết lập bằng Docker.

**Bước 1:** Clone và tạo file cấu hình
```bash
git clone https://github.com/DUCANHUIT37/-SE104.Q21-GROUR-6---SMARTSAVING.git
cd -SE104.Q21-GROUR-6---SMARTSAVING
# Copy backend/.env.example sang backend/.env và cấu hình URL Database
```

**Bước 2:** Chạy bằng Docker Compose
```bash
docker-compose up -d --build
```
> Frontend chạy tại: `http://localhost:5173`
> Backend chạy tại: `http://localhost:8080`

*(Xem hướng dẫn chi tiết và cách chạy thủ công không cần Docker tại: [SETUP_GUIDE.md](./SETUP_GUIDE.md))*

---

## 📁 Cấu trúc thư mục

```
smartsaving/
├── 📂 frontend/                  # ReactJS App
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Các trang chính
│   │   ├── services/             # API calls (Axios, api.js)
│   │   ├── contexts/             # React Context (AuthContext)
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
│
├── 📂 backend/                   # Spring Boot App
│   ├── src/main/java/com/example/BE_SmartSaving/
│   │   ├── controller/           # REST Controllers
│   │   ├── service/              # Business Logic
│   │   ├── repository/           # JPA Repositories
│   │   ├── model/                # Entity classes
│   │   ├── security/             # JWT & Security config
│   │   └── dto/                  # Data Transfer Objects
│   ├── .env.example
│   ├── Dockerfile
│   └── pom.xml
│
├── 📂 database/                  # Script & Schema SQL
│   └── database.sql              # Script CSDL mới nhất với BCrypt password
│
├── docker-compose.yml            # File chạy toàn dự án với Docker
└── README.md
```

---

> 📌 ER Diagram chi tiết: *(Cập nhật sau)*

---

## 🔌 API Overview

Base URL: `http://localhost:8080/api`

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/auth/register` | Đăng ký tài khoản mới |
| `POST` | `/auth/login` | Đăng nhập, nhận JWT token |

### Savings Books
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/sotietkiem/nguoidung/{id}` | Lấy danh sách sổ tiết kiệm |
| `GET` | `/sotietkiem/{id}` | Chi tiết một sổ tiết kiệm |
| `POST` | `/sotietkiem/mo-so` | Mở sổ tiết kiệm mới |
| `POST` | `/sotietkiem/tat-toan/{id}` | Đóng sổ/tất toán |

### Transactions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/phieugoi/goi-tien` | Gửi thêm tiền vào sổ |
| `POST` | `/phieurut/rut-tien` | Rút tiền ra khỏi sổ |
| `GET` | `/lichsugiaodich/sotietkiem/{id}` | Lịch sử giao dịch của sổ |

### Interest Rates
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/loaitietkiem` | Lấy danh sách kỳ hạn và bảng lãi suất |

> 📌 API Docs đầy đủ (Swagger/Postman): *(Cập nhật sau)*

---

## 🚀 Deployment (Production)

### Frontend → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)

```bash
# Build production
cd frontend
npm run build

# Vercel CLI
vercel deploy
```

### Backend → VPS bằng Docker
Trên VPS Ubuntu/Linux, bạn chỉ cần nạp biến môi trường và chạy:
```bash
docker-compose up -d --build backend
```

### Biến môi trường production cần thiết

| Biến | Mô tả |
|------|-------|
| `DB_URL` | JDBC URL đến database Supabase PostgreSQL |
| `DB_USERNAME` | Username Supabase |
| `DB_PASSWORD` | Password Supabase |
| `JWT_SECRET` | JWT secret key (tối thiểu 256-bit) |
| `VITE_API_BASE_URL` | URL backend deployed (vd: `https://api.domain.com/api`) |

---

## 🔗 Các liên kết

| Nội dung | Link |
|----------|------|
| 📊 ER Diagram | *(Cập nhật sau)* |
| 📖 API Docs | *(Cập nhật sau)* |
| 🌐 Demo Live | *(Đang phát triển)* |

---

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Để đóng góp:

1. **Fork** repository này
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m 'feat: thêm tính năng XYZ'`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Mở **Pull Request**

Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi đóng góp.

---

<div align="center">

Made with ❤️ by SmartSaving Team

⭐ Cảm ơn mọi người đã ghé thăm chiếc dự án này!

</div>
