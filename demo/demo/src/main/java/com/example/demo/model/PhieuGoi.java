package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "PhieuGoi")
@Data
public class PhieuGoi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String maPhieu;

    @ManyToOne
    @JoinColumn(name = "so_tiet_kiem_id")
    private SoTietKiem soTietKiem;

    private BigDecimal soTienGoi; // Phải >= 100.000đ theo QĐ2 [cite: 2106]
    private LocalDate ngayGoi;
}