package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * TAIKHOAN – lưu thông tin đăng nhập hệ thống.
 * Chỉ nhân viên (giao_dich_vien, quan_tri_vien, giam_doc) mới có tài khoản.
 * Khách hàng KHÔNG đăng nhập.
 */
@Entity
@Table(name = "TaiKhoan")
@Data
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    /** Mật khẩu đã mã hoá bcrypt, KHÔNG lưu plaintext */
    @Column(name = "mat_khau_hash", nullable = false, length = 255)
    private String matKhauHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "quyen_han", nullable = false)
    private QuyenHanEnum quyenHan;

    /** Liên kết tới bản ghi NguoiDung tương ứng */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id", nullable = false)
    private NguoiDung nguoiDung;

    /** 1 = đang hoạt động, 0 = đã vô hiệu hoá */
    @Column(name = "kich_hoat", nullable = false)
    private Boolean kichHoat = true;

    @Column(name = "tao_luc", nullable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();

    public enum QuyenHanEnum {
        giao_dich_vien, quan_tri_vien, giam_doc, khach_hang
    }
}