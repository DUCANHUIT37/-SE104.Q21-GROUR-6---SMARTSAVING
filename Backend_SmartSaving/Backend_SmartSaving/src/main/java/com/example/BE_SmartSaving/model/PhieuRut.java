package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PHIEURUT – lưu lịch sử các lần rút tiền (BM3).
 * Gồm cả tiền lãi tính được và lãi suất thực tế áp dụng (QĐ3).
 */
@Entity
@Table(name = "PhieuRut")
@Data
public class PhieuRut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", nullable = false, unique = true, length = 50)
    private String maPhieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_tiet_kiem_id", nullable = false)
    private SoTietKiem soTietKiem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id")
    private NguoiDung nhanVien;

    /** Số tiền rút (gốc, chưa cộng lãi) */
    @Column(name = "so_tien_rut", nullable = false)
    private BigDecimal soTienRut;

    /**
     * Tiền lãi = SoDu × laiSuatApDung × soNgay / 365.
     * Nếu rút trước hạn: dùng lãi suất không kỳ hạn (QĐ3).
     */
    @Column(name = "tien_lai_tinh", nullable = false)
    private BigDecimal tienLaiTinh = BigDecimal.ZERO;

    /** Lãi suất thực tế áp dụng (snapshot tại thời điểm rút) */
    @Column(name = "lai_suat_ap_dung", nullable = false, precision = 6, scale = 4)
    private BigDecimal laiSuatApDung;

    @Column(name = "ngay_rut", nullable = false)
    private LocalDate ngayRut;

    /**
     * true = rút hết, sổ tự động đóng (da_tat_toan).
     * false = rút một phần (chỉ áp dụng loại không kỳ hạn).
     */
    @Column(name = "tat_toan", nullable = false)
    private Boolean tatToan = false;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();
}