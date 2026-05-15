package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * LICHSUGIAODICH – audit trail ghi lại MỌI biến động số dư.
 * Phục vụ: màn hình Lịch Sử Giao Dịch + tính toán báo cáo BM5.1, BM5.2.
 *
 * LoaiGiaoDich:
 *   mo_so   – khi mở sổ (tiền dương)
 *   goi_them – khi gởi thêm tiền (tiền dương)
 *   rut_tien – khi rút một phần (tiền âm)
 *   tat_toan – khi rút hết và đóng sổ (tiền âm)
 *   tinh_lai – khi tất toán lãi định kỳ (tiền dương)
 */
@Entity
@Table(name = "LichSuGiaoDich")
@Data
public class LichSuGiaoDich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_giao_dich", nullable = false, unique = true, length = 50)
    private String maGiaoDich;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_tiet_kiem_id", nullable = false)
    private SoTietKiem soTietKiem;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_giao_dich", nullable = false)
    private LoaiGiaoDichEnum loaiGiaoDich;

    /**
     * Dương = tiền vào (mo_so, goi_them, tinh_lai).
     * Âm   = tiền ra  (rut_tien, tat_toan).
     */
    @Column(name = "so_tien", nullable = false)
    private BigDecimal soTien;

    @Column(name = "so_du_truoc", nullable = false)
    private BigDecimal soDuTruoc;

    @Column(name = "so_du_sau", nullable = false)
    private BigDecimal soDuSau;

    @Column(name = "ghi_chu", length = 500)
    private String ghiChu;

    @Column(name = "thoi_gian", nullable = false, updatable = false)
    private LocalDateTime thoiGian = LocalDateTime.now();

    public enum LoaiGiaoDichEnum {
        mo_so, goi_them, rut_tien, tat_toan, tinh_lai
    }
}