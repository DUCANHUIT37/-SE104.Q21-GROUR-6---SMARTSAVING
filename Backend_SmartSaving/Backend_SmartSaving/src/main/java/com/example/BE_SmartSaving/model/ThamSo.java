package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ThamSo")
@Data
public class ThamSo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "khoa", nullable = false, unique = true, length = 100)
    private String khoa; // Ví dụ: "so_tien_gui_toi_thieu"

    @Column(name = "gia_tri", nullable = false)
    private String giaTri; // Ví dụ: "1000000"

    @Column(name = "kieu_du_lieu", nullable = false)
    private String kieuDuLieu = "string"; // integer, decimal, string, boolean

    @Column(name = "mo_ta", length = 500)
    private String moTa;

    // Khóa ngoại liên kết tới người dùng (Admin) thực hiện cập nhật
    @ManyToOne
    @JoinColumn(name = "cap_nhat_boi")
    private NguoiDung capNhatBoi;

    @Column(name = "cap_nhat_luc", nullable = false)
    @UpdateTimestamp // Tự động cập nhật thời gian khi dòng dữ liệu này bị sửa
    private LocalDateTime capNhatLuc = LocalDateTime.now();
}