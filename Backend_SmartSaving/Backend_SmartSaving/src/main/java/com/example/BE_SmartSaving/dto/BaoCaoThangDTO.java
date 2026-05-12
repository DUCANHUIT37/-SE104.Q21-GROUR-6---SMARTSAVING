package com.example.BE_SmartSaving.dto;

import lombok.Data;
import java.time.LocalDate;

/**
 * BM5.2 – Báo Cáo Mở/Đóng Sổ Tháng.
 * Mỗi dòng là 1 ngày trong tháng, cho 1 loại tiết kiệm.
 */
@Data
public class BaoCaoThangDTO {
    private String tenLoaiTietKiem;
    private LocalDate ngay;
    private long soSoMo;
    private long soSoDong;
    private long chenhLech;  // soSoMo - soSoDong
}