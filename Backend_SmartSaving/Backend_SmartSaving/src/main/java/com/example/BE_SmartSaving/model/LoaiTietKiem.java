package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * LOAITIETKIEM – danh mục các loại tiết kiệm.
 * Seed data:
 *   (1) Không kỳ hạn  – kyHanThang=0,  laiSuatNam=0.0050
 *   (2) 3 tháng       – kyHanThang=3,  laiSuatNam=0.0500
 *   (3) 6 tháng       – kyHanThang=6,  laiSuatNam=0.0550
 */
@Entity
@Table(name = "LoaiTietKiem")
@Data
public class LoaiTietKiem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_loai", nullable = false, length = 100)
    private String tenLoai;

    /** 0 = không kỳ hạn; 3 = 3 tháng; 6 = 6 tháng; 12 = 12 tháng */
    @Column(name = "ky_han_thang", nullable = false)
    private Integer kyHanThang = 0;

    /** Lãi suất %/năm, ví dụ: 0.0050 = 0,5%/năm */
    @Column(name = "lai_suat_nam", nullable = false, precision = 6, scale = 4)
    private BigDecimal laiSuatNam;

    /** Tiền gởi tối thiểu khi mở sổ (QĐ1) – mặc định 1.000.000 đ */
    @Column(name = "so_tien_gui_toi_thieu", nullable = false)
    private BigDecimal soTienGuiToiThieu = new BigDecimal("1000000");

    /** true = còn cho mở sổ mới; false = đã vô hiệu hoá */
    @Column(name = "dang_ap_dung", nullable = false)
    private Boolean dangApDung = true;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();

    @Column(name = "cap_nhat_luc")
    private LocalDateTime capNhatLuc = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.capNhatLuc = LocalDateTime.now();
    }
}