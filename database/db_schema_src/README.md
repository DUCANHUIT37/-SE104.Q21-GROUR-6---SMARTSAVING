# 💰 SmartSaving

### Nền tảng quản lý sổ tiết kiệm cá nhân hiện đại

[![ReactJS](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> Theo dõi, quản lý và tối ưu hóa các khoản tiết kiệm cá nhân — đơn giản, bảo mật, hiệu quả.
---


## 🌟 Giới thiệu

**SmartSaving** là một nền tảng web quản lý sổ tiết kiệm hiện đại, được xây dựng nhằm giúp người dùng **theo dõi, quản lý và tối ưu hóa** các khoản tiết kiệm cá nhân một cách thông minh.

Dự án lấy cảm hứng từ các hệ thống ngân hàng số và ứng dụng fintech, mang đến cái nhìn rõ ràng về dòng tiền và kế hoạch tài chính — phù hợp cho việc học tập, phát triển cá nhân hoặc làm nền tảng cho các hệ thống tài chính thực tế.

---

## ✨ Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| 🔐 **Xác thực bảo mật** | Đăng ký / đăng nhập với JWT Authentication |
| 📒 **Quản lý sổ tiết kiệm** | Tạo và quản lý nhiều sổ tiết kiệm cùng lúc |
| 📊 **Dashboard tổng quan** | Theo dõi tổng số dư, lãi suất, kỳ hạn và ngày đáo hạn |
| 💸 **Giao dịch linh hoạt** | Gửi tiền và rút tiền dễ dàng |
| 🕒 **Lịch sử giao dịch** | Xem chi tiết toàn bộ lịch sử giao dịch |
| 🔍 **Tìm kiếm & Lọc** | Tìm kiếm, lọc và quản lý sổ tiết kiệm nhanh chóng |
| 👤 **Quản lý hồ sơ** | Cập nhật thông tin cá nhân |
| 📱 **Responsive UI** | Giao diện tương thích mọi thiết bị |

---

## 🛠 Tech Stack

### Frontend
| Công nghệ | Vai trò |
|-----------|---------|
| [ReactJS](https://reactjs.org/) | Xây dựng UI theo component |
| [Vite](https://vitejs.dev/) | Build tool nhanh, nhẹ |
| [TailwindCSS](https://tailwindcss.com/) / [Bootstrap](https://getbootstrap.com/) | Styling & responsive layout |
| [Axios](https://axios-http.com/) | HTTP client — gọi REST API |
| [React Router DOM](https://reactrouter.com/) | Điều hướng trang (SPA routing) |

### Backend
| Công nghệ | Vai trò |
|-----------|---------|
| [Spring Boot](https://spring.io/projects/spring-boot) | Framework backend chính |
| [Spring Security](https://spring.io/projects/spring-security) | Xác thực & phân quyền |
| [JPA / Hibernate](https://hibernate.org/) | ORM — tương tác database |
| [MySQL](https://www.mysql.com/) / [PostgreSQL](https://www.postgresql.org/) | Hệ quản trị CSDL quan hệ |
| [JWT](https://jwt.io/) | Xác thực người dùng stateless |
| [Lombok](https://projectlombok.org/) | Giảm boilerplate code |
| [Maven](https://maven.apache.org/) / [Gradle](https://gradle.org/) | Quản lý dependencies |

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
│             MySQL / PostgreSQL                       │
│   Users | SavingsBooks | Transactions | Rates        │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
smartsaving/
├── 📂 frontend/                  # ReactJS App
│   ├── public/
│   ├── src/
│   │   ├── assets/               # Hình ảnh, icons
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Các trang chính
│   │   │   ├── Dashboard/
│   │   │   ├── SavingsBook/
│   │   │   ├── Transactions/
│   │   │   ├── Profile/
│   │   │   └── Auth/
│   │   ├── services/             # API calls (Axios)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Helper functions
│   │   ├── routes/               # React Router config
│   │   └── App.jsx
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── 📂 backend/                   # Spring Boot App
│   ├── src/main/java/
│   │   └── com/smartsaving/
│   │       ├── controller/       # REST Controllers
│   │       ├── service/          # Business Logic
│   │       ├── repository/       # JPA Repositories
│   │       ├── model/            # Entity classes
│   │       ├── dto/              # Data Transfer Objects
│   │       ├── security/         # JWT & Spring Security
│   │       └── config/           # App Configuration
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── 📂 database/
│   └── schema.sql                # Script khởi tạo DB
│
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
| `GET` | `/savings` | Lấy danh sách sổ tiết kiệm |
| `GET` | `/savings/{id}` | Chi tiết một sổ tiết kiệm |
| `POST` | `/savings` | Tạo sổ tiết kiệm mới |
| `PUT` | `/savings/{id}` | Cập nhật sổ tiết kiệm |
| `DELETE` | `/savings/{id}` | Xóa sổ tiết kiệm |

### Transactions
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/savings/{id}/deposit` | Gửi tiền |
| `POST` | `/savings/{id}/withdraw` | Rút tiền |
| `GET` | `/savings/{id}/transactions` | Lịch sử giao dịch |

### Interest Rates
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/interest-rates` | Bảng lãi suất hiện hành |

> 📌 API Docs đầy đủ (Swagger/Postman): *(Cập nhật sau)*

---

## 🚀 Deployment

### Frontend → [Vercel](https://vercel.com) / [Netlify](https://netlify.com)

```bash
# Build production
cd frontend
npm run build

# Vercel CLI
vercel deploy
```

### Backend → [Render](https://render.com) / [Railway](https://railway.app) / VPS

```bash
# Build JAR
cd backend
mvn clean package -DskipTests

# Chạy JAR
java -jar target/smartsaving-*.jar
```

### Biến môi trường production cần thiết

| Biến | Mô tả |
|------|-------|
| `SPRING_DATASOURCE_URL` | JDBC URL đến database production |
| `SPRING_DATASOURCE_USERNAME` | Username database |
| `SPRING_DATASOURCE_PASSWORD` | Password database |
| `APP_JWT_SECRET` | JWT secret key (tối thiểu 256-bit) |
| `VITE_API_BASE_URL` | URL backend deployed |

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
