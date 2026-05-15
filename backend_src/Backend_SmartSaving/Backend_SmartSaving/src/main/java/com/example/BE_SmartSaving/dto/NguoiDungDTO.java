package com.example.BE_SmartSaving.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho Người Dùng (Khách Hàng + Nhân Viên).
 * Khớp với schema: { id, hoTen, cmnd, diaChi, soDienThoai, quyenHan, kichHoat }
 * trong taiKhoanData và khachHangData của fakeDb.js.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDungDTO {

    private Integer id;

    @JsonProperty("hoTen")
    private String hoTen;

    @JsonProperty("cmnd")
    private String cmnd;

    @JsonProperty("diaChi")
    private String diaChi;

    @JsonProperty("soDienThoai")
    private String soDienThoai;

    /**
     * Ánh xạ loaiNguoiDung enum → quyenHan string cho Frontend.
     * quan_tri_vien → ADMIN | giao_dich_vien → TELLER | khach_hang → USER
     */
    @JsonProperty("quyenHan")
    private String quyenHan;

    @JsonProperty("kichHoat")
    private Boolean kichHoat;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("taoLuc")
    private LocalDateTime taoLuc;
}
