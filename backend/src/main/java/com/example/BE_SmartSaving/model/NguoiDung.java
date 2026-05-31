package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "NguoiDung")
@Data
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "cmnd", nullable = false, unique = true, length = 20)
    private String cmnd;

    @Column(name = "dia_chi", nullable = false, length = 255)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_nguoi_dung", nullable = false)
    private LoaiNguoiDungEnum loaiNguoiDung = LoaiNguoiDungEnum.khach_hang;

    @Column(name = "tao_luc", nullable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();

    @Transient
    private String email;

    @Transient
    private String matKhau;

    public enum LoaiNguoiDungEnum {
        khach_hang, giao_dich_vien, quan_tri_vien, giam_doc;

        @com.fasterxml.jackson.annotation.JsonCreator
        public static LoaiNguoiDungEnum fromValue(String value) {
            if (value == null) return null;
            return switch (value.toLowerCase()) {
                case "nhan_vien", "giao_dich_vien", "teller" -> giao_dich_vien;
                case "khach_hang", "user" -> khach_hang;
                case "quan_tri_vien", "admin" -> quan_tri_vien;
                case "giam_doc" -> giam_doc;
                default -> throw new IllegalArgumentException("Unknown role: " + value);
            };
        }
    }
}