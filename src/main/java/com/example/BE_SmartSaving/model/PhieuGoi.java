package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PHIEUGOI – lưu lịch sử các lần gởi thêm tiền vào sổ (BM2).
 */
@Entity
@Table(name = "PhieuGoi")
@Data
public class PhieuGoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", nullable = false, unique = true, length = 50)
    private String maPhieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_tiet_kiem_id", nullable = false)
    private SoTietKiem soTietKiem;

    /** Giao dịch viên thực hiện */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NguoiDung nhanVien;

    /** Số tiền gởi thêm (≥ 100.000 đ theo QĐ2) */
    @Column(name = "so_tien_goi", nullable = false)
    private BigDecimal soTienGoi;

    @Column(name = "ngay_goi", nullable = false)
    private LocalDate ngayGoi;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();
}