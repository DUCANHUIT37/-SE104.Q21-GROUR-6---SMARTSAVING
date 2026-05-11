package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "PhieuRut")
@Data
public class PhieuRut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", unique = true, nullable = false, length = 50)
    private String maPhieu;

    // Khóa ngoại liên kết tới cuốn sổ tiết kiệm bị rút tiền
    @ManyToOne
    @JoinColumn(name = "so_tiet_kiem_id", nullable = false)
    private SoTietKiem soTietKiem;

    @Column(name = "so_tien_rut", nullable = false)
    private BigDecimal soTienRut;

    @Column(name = "ngay_rut", nullable = false)
    private LocalDate ngayRut;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    @CreationTimestamp // Tự động lấy giờ hệ thống lúc tạo phiếu
    private LocalDateTime taoLuc;
}