package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * THAMSO – tham số hệ thống dạng key-value.
 * Seed data mặc định:
 *   so_tien_gui_toi_thieu       = "1000000"
 *   so_tien_gui_them_toi_thieu  = "100000"
 *   thoi_gian_gui_toi_thieu_ngay = "15"
 */
@Entity
@Table(name = "ThamSo")
@Data
public class ThamSo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "khoa", nullable = false, unique = true, length = 100)
    private String khoa;

    @Column(name = "gia_tri", nullable = false, length = 255)
    private String giaTri;

    @Enumerated(EnumType.STRING)
    @Column(name = "kieu_du_lieu", nullable = false)
    private KieuDuLieuEnum kieuDuLieu = KieuDuLieuEnum.string;

    @Column(name = "mo_ta", length = 500)
    private String moTa;

    /** Admin cập nhật gần nhất (FK → NguoiDung, có thể null) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cap_nhat_boi")
    private NguoiDung capNhatBoi;

    @Column(name = "cap_nhat_luc", nullable = false)
    private LocalDateTime capNhatLuc = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.capNhatLuc = LocalDateTime.now();
    }

    public enum KieuDuLieuEnum {
        integer, decimal, string, bool
    }
}