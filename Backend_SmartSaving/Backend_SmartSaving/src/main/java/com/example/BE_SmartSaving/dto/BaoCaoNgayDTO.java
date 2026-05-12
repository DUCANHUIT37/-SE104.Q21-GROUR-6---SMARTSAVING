package com.example.BE_SmartSaving.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * BM5.1 – Báo Cáo Doanh Số Hoạt Động Ngày.
 * Mỗi dòng là 1 loại tiết kiệm.
 */
@Data
public class BaoCaoNgayDTO {
    private String tenLoaiTietKiem;
    private BigDecimal tongThu;    // Tổng tiền nạp vào (mở sổ + gởi thêm)
    private BigDecimal tongChi;    // Tổng tiền rút ra
    private BigDecimal chenhLech;  // tongThu - tongChi
}