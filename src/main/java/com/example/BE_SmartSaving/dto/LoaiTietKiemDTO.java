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
 * DTO cho Loại Tiết Kiệm – khớp schema loaiTietKiemData trong fakeDb.js:
 * { id, tenLoai, kyHanThang, laiSuatNam, soTienGuiToiThieu, dangApDung }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoaiTietKiemDTO {

    private Integer id;

    @JsonProperty("tenLoai")
    private String tenLoai;

    @JsonProperty("kyHanThang")
    private Integer kyHanThang;

    @JsonProperty("laiSuatNam")
    private BigDecimal laiSuatNam;

    @JsonProperty("soTienGuiToiThieu")
    private BigDecimal soTienGuiToiThieu;

    @JsonProperty("dangApDung")
    private Boolean dangApDung;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("taoLuc")
    private LocalDateTime taoLuc;
}
