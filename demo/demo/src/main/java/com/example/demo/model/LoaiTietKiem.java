package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "LoaiTietKiem")
@Data
public class LoaiTietKiem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String tenLoai;
    private Integer kyHanThang;
    private BigDecimal laiSuatNam;
    private BigDecimal soTienGuiToiThieu;
    private Integer dangApDung; // 1 là đang dùng, 0 là vô hiệu

    @Column(updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();
}