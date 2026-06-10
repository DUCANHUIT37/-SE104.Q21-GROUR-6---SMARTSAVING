-- ============================================================
--  HỆ THỐNG QUẢN LÝ SỔ TIẾT KIỆM - SmartSavings
--  Database: MySQL 8.0+
--  Encoding: UTF-8
-- ============================================================
CREATE DATABASE smart_savings CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_savings;

-- ============================================================
-- 1. NGUOI_DUNG
--   Lưu thông tin tất cả người dùng: khách hàng + nhân viên + admin
-- ============================================================
CREATE TABLE NguoiDung (
                           id                INT             NOT NULL AUTO_INCREMENT,
                           ho_ten            VARCHAR(100)    NOT NULL,
                           cmnd              VARCHAR(20)     NOT NULL,
                           dia_chi           VARCHAR(255)    NOT NULL,
                           so_dien_thoai     VARCHAR(20)     NULL,
                           loai_nguoi_dung   ENUM('khach_hang', 'giao_dich_vien', 'quan_tri_vien') NOT NULL DEFAULT 'khach_hang',
                           tao_luc           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           PRIMARY KEY (id),
                           UNIQUE KEY uq_nguoidung_cmnd (cmnd)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. TAI_KHOAN
--   Thông tin đăng nhập hệ thống (chỉ nhân viên / admin)
-- ============================================================
CREATE TABLE TaiKhoan (
                          id                INT             NOT NULL AUTO_INCREMENT,
                          email             VARCHAR(150)    NOT NULL,
                          mat_khau_hash     VARCHAR(255)    NOT NULL,
                          quyen_han         ENUM('giao_dich_vien', 'quan_tri_vien') NOT NULL DEFAULT 'giao_dich_vien',
                          nguoi_dung_id     INT             NOT NULL,
                          kich_hoat         TINYINT(1)      NOT NULL DEFAULT 1,
                          tao_luc           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          PRIMARY KEY (id),
                          UNIQUE KEY uq_taikhoan_email (email),
                          CONSTRAINT fk_taikhoan_nguoidung FOREIGN KEY (nguoi_dung_id) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. LOAI_TIET_KIEM
--   Cấu hình động theo QĐ1 + QĐ6:
--   Admin có thể thêm/sửa loại, lãi suất, tiền tối thiểu
-- ============================================================
CREATE TABLE LoaiTietKiem (
                              id                        INT             NOT NULL AUTO_INCREMENT,
                              ten_loai                  VARCHAR(100)    NOT NULL,
                              ky_han_thang              INT             NOT NULL DEFAULT 0 COMMENT '0 = không kỳ hạn',
                              lai_suat_nam              DECIMAL(6,4)    NOT NULL COMMENT 'Lãi suất %/năm, vd: 0.0050 = 0.5%',
                              so_tien_gui_toi_thieu     DECIMAL(18,0)   NOT NULL DEFAULT 1000000 COMMENT 'Tiền gửi ban đầu tối thiểu (QĐ1)',
                              dang_ap_dung              TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '0 = vô hiệu, không cho mở sổ mới',
                              tao_boi                   INT             NULL,
                              cap_nhat_boi              INT             NULL,
                              tao_luc                   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              cap_nhat_luc              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                              PRIMARY KEY (id),
                              CONSTRAINT fk_loaitk_taoboi FOREIGN KEY (tao_boi) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE SET NULL,
                              CONSTRAINT fk_loaitk_capnhatboi FOREIGN KEY (cap_nhat_boi) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. SO_TIET_KIEM
--   Bảng trung tâm - mỗi dòng là 1 sổ tiết kiệm (BM1)
-- ============================================================
CREATE TABLE SoTietKiem (
                            id                    INT             NOT NULL AUTO_INCREMENT,
                            ma_so                 VARCHAR(50)     NOT NULL,
                            khach_hang_id         INT             NOT NULL,
                            loai_tiet_kiem_id     INT             NOT NULL,
                            nhan_vien_tao_id      INT             NOT NULL,
                            so_tien_ban_dau       DECIMAL(18,0)   NOT NULL,
                            so_du_hien_tai        DECIMAL(18,0)   NOT NULL,
                            lai_suat_mo_so        DECIMAL(6,4)    NOT NULL COMMENT 'Snapshot lãi suất lúc mở sổ - không đổi dù admin chỉnh QĐ sau',
                            ngay_mo               DATE            NOT NULL,
                            ngay_dao_han          DATE            NULL COMMENT 'NULL nếu không kỳ hạn',
                            trang_thai            ENUM('dang_hoat_dong', 'da_tat_toan') NOT NULL DEFAULT 'dang_hoat_dong',
                            tao_luc               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            PRIMARY KEY (id),
                            UNIQUE KEY uq_sotk_maso (ma_so),
                            CONSTRAINT fk_sotk_khachhang FOREIGN KEY (khach_hang_id) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                            CONSTRAINT fk_sotk_loaitk FOREIGN KEY (loai_tiet_kiem_id) REFERENCES LoaiTietKiem(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                            CONSTRAINT fk_sotk_nhanvientao FOREIGN KEY (nhan_vien_tao_id) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PHIEU_GOI
--   Phiếu gửi tiền thêm vào sổ (BM2 + QĐ2)
--   Chỉ gửi thêm khi đến kỳ hạn, tối thiểu 100.000đ
-- ============================================================
CREATE TABLE PhieuGoi (
                          id                INT             NOT NULL AUTO_INCREMENT,
                          ma_phieu          VARCHAR(50)     NOT NULL,
                          so_tiet_kiem_id   INT             NOT NULL,
                          nhan_vien_id      INT             NOT NULL,
                          so_tien_goi       DECIMAL(18,0)   NOT NULL COMMENT 'Tối thiểu 100.000đ theo QĐ2',
                          ngay_goi          DATE            NOT NULL,
                          ghi_chu           VARCHAR(500)    NULL,
                          tao_luc           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          PRIMARY KEY (id),
                          UNIQUE KEY uq_phieugoi_maphieu (ma_phieu),
                          CONSTRAINT fk_phieugoi_sotk FOREIGN KEY (so_tiet_kiem_id) REFERENCES SoTietKiem(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                          CONSTRAINT fk_phieugoi_nhanvien FOREIGN KEY (nhan_vien_id) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                          CONSTRAINT chk_phieugoi_sotien CHECK (so_tien_goi >= 100000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PHIEU_RUT
--   Phiếu rút tiền (BM3 + QĐ3)
--   Lưu lại lãi suất áp dụng thực tế (có thể khác lãi suất gốc
--   nếu rút trước hạn → dùng lãi suất không kỳ hạn)
-- ============================================================
CREATE TABLE PhieuRut (
                          id                INT             NOT NULL AUTO_INCREMENT,
                          ma_phieu          VARCHAR(50)     NOT NULL,
                          so_tiet_kiem_id   INT             NOT NULL,
                          nhan_vien_id      INT             NOT NULL,
                          so_tien_rut       DECIMAL(18,0)   NOT NULL,
                          tien_lai_tinh     DECIMAL(18,0)   NOT NULL DEFAULT 0 COMMENT 'Tiền lãi = số dư × lãi suất áp dụng (QĐ3)',
                          lai_suat_ap_dung  DECIMAL(6,4)    NOT NULL COMMENT 'Nếu rút trước hạn → dùng lãi suất không kỳ hạn',
                          ngay_rut          DATE            NOT NULL,
                          tat_toan          TINYINT(1)      NOT NULL DEFAULT 0 COMMENT '1 = rút hết, sổ tự đóng (QĐ3)',
                          ghi_chu           VARCHAR(500)    NULL,
                          tao_luc           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          PRIMARY KEY (id),
                          UNIQUE KEY uq_phieurut_maphieu (ma_phieu),
                          CONSTRAINT fk_phieulrut_sotk FOREIGN KEY (so_tiet_kiem_id) REFERENCES SoTietKiem(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                          CONSTRAINT fk_phieulrut_nhanvien FOREIGN KEY (nhan_vien_id) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. LICH_SU_GIAO_DICH
--   Audit trail mọi biến động số dư - phục vụ màn hình
--   Lịch Sử Giao Dịch trong UI
-- ============================================================
CREATE TABLE LichSuGiaoDich (
                                id                INT             NOT NULL AUTO_INCREMENT,
                                ma_giao_dich      VARCHAR(50)     NOT NULL,
                                so_tiet_kiem_id   INT             NOT NULL,
                                loai_giao_dich    ENUM('mo_so', 'goi_them', 'rut_tien', 'tat_toan', 'tinh_lai') NOT NULL,
                                so_tien           DECIMAL(18,0)   NOT NULL COMMENT 'Dương = tiền vào, âm = tiền ra',
                                so_du_truoc       DECIMAL(18,0)   NOT NULL,
                                so_du_sau         DECIMAL(18,0)   NOT NULL,
                                ghi_chu           VARCHAR(500)    NULL,
                                thoi_gian         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                PRIMARY KEY (id),
                                UNIQUE KEY uq_lsgd_magiaodich (ma_giao_dich),
                                CONSTRAINT fk_lsgd_sotk FOREIGN KEY (so_tiet_kiem_id) REFERENCES SoTietKiem(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. THAM_SO
--   Tham số hệ thống dạng key-value theo QĐ6
--   Backend đọc từ đây thay vì hardcode trong code
-- ============================================================
CREATE TABLE ThamSo (
                         id                INT             NOT NULL AUTO_INCREMENT,
                         khoa              VARCHAR(100)    NOT NULL,
                         gia_tri           VARCHAR(255)    NOT NULL,
                         kieu_du_lieu      ENUM('integer', 'decimal', 'string', 'boolean') NOT NULL DEFAULT 'string',
                         mo_ta             VARCHAR(500)    NULL,
                         cap_nhat_boi      INT             NULL,
                         cap_nhat_luc      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                         PRIMARY KEY (id),
                         UNIQUE KEY uq_thamso_khoa (khoa),
                         CONSTRAINT fk_thamso_capnhatboi FOREIGN KEY (cap_nhat_boi) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. LICH_SU_THAM_SO
--   Ghi lại mỗi lần admin thay đổi tham số hệ thống (QĐ6)
-- ============================================================
CREATE TABLE LichSuThamSo (
                               id                INT             NOT NULL AUTO_INCREMENT,
                               tham_so_id        INT             NOT NULL,
                               gia_tri_cu        VARCHAR(255)    NOT NULL,
                               gia_tri_moi       VARCHAR(255)    NOT NULL,
                               cap_nhat_boi      INT             NULL,
                               ly_do             VARCHAR(500)    NULL,
                               thoi_gian         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (id),
                               CONSTRAINT fk_lsts_thamso FOREIGN KEY (tham_so_id) REFERENCES ThamSo(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                               CONSTRAINT fk_lsts_capnhatboi FOREIGN KEY (cap_nhat_boi) REFERENCES NguoiDung(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Loại tiết kiệm ban đầu (theo QĐ1 + UI)
INSERT INTO LoaiTietKiem (ten_loai, ky_han_thang, lai_suat_nam, so_tien_gui_toi_thieu, dang_ap_dung) VALUES
                                                                                                         ('Không kỳ hạn',   0,  0.0015, 1000000, 1),
                                                                                                         ('Kỳ hạn 3 tháng', 3,  0.0500, 1000000, 1),
                                                                                                         ('Kỳ hạn 6 tháng', 6,  0.0550, 1000000, 1);
                                                                                                        

-- Quy định hệ thống (theo QĐ1, QĐ2, QĐ3, QĐ6)
INSERT INTO ThamSo (khoa, gia_tri, kieu_du_lieu, mo_ta) VALUES
                                                             ('so_tien_gui_toi_thieu',      '1000000', 'integer', 'Số tiền gửi ban đầu tối thiểu khi mở sổ (đồng) - QĐ1'),
                                                             ('so_tien_gui_them_toi_thieu', '100000',  'integer', 'Số tiền gửi thêm tối thiểu mỗi lần - QĐ2'),
                                                             ('thoi_gian_gui_toi_thieu_ngay','15',     'integer', 'Số ngày gửi tối thiểu trước khi được rút (không kỳ hạn) - QĐ3');

-- Tài khoản admin mặc định
INSERT INTO NguoiDung (ho_ten, cmnd, dia_chi, so_dien_thoai, loai_nguoi_dung) VALUES
    ('Quản Trị Viên', '000000000000', 'Hệ thống', NULL, 'quan_tri_vien');

INSERT INTO TaiKhoan (email, mat_khau_hash, quyen_han, nguoi_dung_id) VALUES
    ('admin@smartsavings.com', '$2a$10$g9Cdf6SxUUgJeidE..QKEuXjOZe7FELDZ4oH5nN.cYM7O69Qfx05.', 'quan_tri_vien', 1);