package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO trả về kết quả tính toán rút tiền (dry-run, không ghi DB).
 * Dùng cho endpoint GET /api/sotietkiem/{id}/tinh-toan-rut
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TinhToanRutDTO {

    @JsonProperty("soTietKiemId")
    private Integer soTietKiemId;

    @JsonProperty("soTienGoc")
    private BigDecimal soTienGoc;           // SoDuHienTai tại thời điểm tính

    @JsonProperty("soNgayGui")
    private long soNgayGui;                 // Số ngày đã gởi

    @JsonProperty("laiSuatApDung")
    private BigDecimal laiSuatApDung;       // Lãi suất thực tế sẽ áp dụng (có thể KKH nếu trước hạn)

    @JsonProperty("rutTruocHan")
    private boolean rutTruocHan;            // true = rút trước ngày đáo hạn, lãi KKH áp dụng

    @JsonProperty("tienLai")
    private BigDecimal tienLai;             // Tiền lãi tích lũy = soTienGoc × laiSuat × soNgay / 365

    @JsonProperty("tongThucNhan")
    private BigDecimal tongThucNhan;        // soTienGoc + tienLai

    @JsonProperty("coTheRut")
    private boolean coTheRut;              // false nếu chưa đủ điều kiện (ví dụ: KKH < 15 ngày)

    @JsonProperty("lyDoKhongDuocRut")
    private String lyDoKhongDuocRut;        // Lý do không thể rút (null nếu coTheRut = true)

    @JsonProperty("ngayDaoHan")
    private String ngayDaoHan;             // Ngày đáo hạn (null nếu KKH)

    @JsonProperty("loaiKyHan")
    private String loaiKyHan;              // Tên loại tiết kiệm
}
