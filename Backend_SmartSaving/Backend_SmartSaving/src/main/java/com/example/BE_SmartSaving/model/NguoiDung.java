package com.example.BE_SmartSaving.model;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity // Đánh dấu đây là một bảng trong Database
@Table(name = "NguoiDung") // Tên bảng phải khớp y chang trong MySQL
@Data // Tự động tạo Getter, Setter (nhờ thư viện Lombok)
public class NguoiDung {

    @Id // Đánh dấu đây là Khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng ID
    private Integer id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "cmnd", nullable = false, unique = true, length = 20)
    private String cmnd;

    @Column(name = "dia_chi", nullable = false)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 20)
    private String soDienThoai;

    @Column(name = "loai_nguoi_dung", nullable = false)
    private String loaiNguoiDung;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();
}
