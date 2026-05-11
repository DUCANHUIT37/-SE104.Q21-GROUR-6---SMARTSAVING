package com.example.BE_SmartSaving.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BaoCaoNgayDTO {
    private String tenLoaiTietKiem;
    private BigDecimal tongThu;    // Tổng tiền nạp vào
    private BigDecimal tongChi;    // Tổng tiền rút ra
    private BigDecimal chenhLech;  // Bằng Thu trừ Chi
}