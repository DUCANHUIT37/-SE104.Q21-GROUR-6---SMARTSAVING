package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;

/**
 * BM5.1 – Báo Cáo Doanh Số Hoạt Động Ngày.
 * Mỗi dòng là 1 loại tiết kiệm.
 */
@Data
public class BaoCaoNgayDTO {
    @JsonProperty("tenLoaiTietKiem")
    private String tenLoaiTietKiem;

    @JsonProperty("tongThu")
    private BigDecimal tongThu;    // Tổng tiền nạp vào (mở sổ + gởi thêm)

    @JsonProperty("tongChi")
    private BigDecimal tongChi;    // Tổng tiền rút ra

    @JsonProperty("chenhLech")
    private BigDecimal chenhLech;  // tongThu - tongChi
}