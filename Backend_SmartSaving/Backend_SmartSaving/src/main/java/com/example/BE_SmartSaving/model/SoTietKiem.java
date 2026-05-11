package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "SoTietKiem")
@Data
public class SoTietKiem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String maSo;

    @ManyToOne
    @JoinColumn(name = "khach_hang_id")
    private NguoiDung khachHang;

    @ManyToOne
    @JoinColumn(name = "loai_tiet_kiem_id")
    private LoaiTietKiem loaiTietKiem;

    private BigDecimal soTienBanDau;
    private BigDecimal soDuHienTai;
    private BigDecimal laiSuatMoSo; // Snapshot lúc mở sổ [cite: 2101]

    private LocalDate ngayMo;
    private LocalDate ngayDaoHan;

    private String trangThai; // dang_hoat_dong, da_tat_toan

    private LocalDateTime taoLuc = LocalDateTime.now();
}