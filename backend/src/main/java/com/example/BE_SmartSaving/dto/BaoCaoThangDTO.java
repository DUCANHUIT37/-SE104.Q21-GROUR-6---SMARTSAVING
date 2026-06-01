package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDate;

/**
 * BM5.2 – Báo Cáo Mở/Đóng Sổ Tháng.
 * Mỗi dòng là 1 ngày trong tháng, cho 1 loại tiết kiệm.
 */
@Data
public class BaoCaoThangDTO {
    @JsonProperty("tenLoaiTietKiem")
    private String tenLoaiTietKiem;

    @JsonProperty("ngay")
    private String ngay;

    @JsonProperty("soSoMo")
    private long soSoMo;

    @JsonProperty("soSoDong")
    private long soSoDong;

    @JsonProperty("chenhLech")
    private long chenhLech;  // soSoMo - soSoDong
}