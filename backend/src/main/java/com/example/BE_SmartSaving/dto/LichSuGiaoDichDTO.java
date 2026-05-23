package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho Lịch Sử Giao Dịch – khớp schema lichSuGiaoDichData trong fakeDb.js:
 * { id, maGiaoDich, soTietKiemId, loaiGiaoDich, soTien, soDuTruoc, soDuSau, ghiChu, thoiGian }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LichSuGiaoDichDTO {

    private Integer id;

    @JsonProperty("maGiaoDich")
    private String maGiaoDich;

    @JsonProperty("soTietKiemId")
    private Integer soTietKiemId;

    @JsonProperty("soTietKiemMaSo")
    private String soTietKiemMaSo;

    @JsonProperty("loaiGiaoDich")
    private String loaiGiaoDich;

    @JsonProperty("soTien")
    private BigDecimal soTien;

    @JsonProperty("soDuTruoc")
    private BigDecimal soDuTruoc;

    @JsonProperty("soDuSau")
    private BigDecimal soDuSau;

    @JsonProperty("ghiChu")
    private String ghiChu;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("thoiGian")
    private LocalDateTime thoiGian;
}
