package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * LICHSUTHAMSO – ghi lại mỗi lần Admin thay đổi tham số hệ thống.
 * Phục vụ kiểm toán (audit trail cho bảng THAMSO).
 */
@Entity
@Table(name = "LichSuThamSo")
@Data
public class LichSuThamSo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tham_so_id", nullable = false)
    private ThamSo thamSo;

    @Column(name = "gia_tri_cu", nullable = false, length = 255)
    private String giaTriCu;

    @Column(name = "gia_tri_moi", nullable = false, length = 255)
    private String giaTriMoi;

    /** Admin thực hiện thay đổi */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cap_nhat_boi")
    private NguoiDung capNhatBoi;

    @Column(name = "ly_do", length = 500)
    private String lyDo;

    @Column(name = "thoi_gian", nullable = false, updatable = false)
    private LocalDateTime thoiGian = LocalDateTime.now();
}