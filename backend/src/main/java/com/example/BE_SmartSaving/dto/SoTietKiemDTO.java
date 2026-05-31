package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO cho Sổ Tiết Kiệm – chuẩn hóa JSON trả về cho Frontend.
 * Giải quyết: Entity trả về nested objects (khachHang, loaiTietKiem),
 * DTO này flatten ra thành các flat ID để khớp với fakeDb.js schema.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoTietKiemDTO {

    private Integer id;

    @JsonProperty("maSo")
    private String maSo;

    // Flatten nested ManyToOne relations thành ID + tên hiển thị
    @JsonProperty("khachHangId")
    private Integer khachHangId;

    @JsonProperty("khachHangTen")
    private String khachHangTen;

    @JsonProperty("khachHangCmnd")
    private String khachHangCmnd;

    @JsonProperty("loaiTietKiemId")
    private Integer loaiTietKiemId;

    @JsonProperty("loaiTietKiemTen")
    private String loaiTietKiemTen;

    @JsonProperty("kyHanThang")
    private Integer kyHanThang;

    @JsonProperty("soTienBanDau")
    private BigDecimal soTienBanDau;

    @JsonProperty("soDuHienTai")
    private BigDecimal soDuHienTai;

    @JsonProperty("laiSuatMoSo")
    private BigDecimal laiSuatMoSo;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonProperty("ngayMo")
    private LocalDate ngayMo;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    @JsonProperty("ngayDaoHan")
    private LocalDate ngayDaoHan;

    @JsonProperty("trangThai")
    private String trangThai;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("taoLuc")
    private LocalDateTime taoLuc;
}
