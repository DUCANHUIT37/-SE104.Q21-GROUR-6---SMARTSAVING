package com.example.BE_SmartSaving.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * SOTIETKIEM – bảng trung tâm, mỗi dòng là 1 sổ tiết kiệm.
 */
@Entity
@Table(name = "SoTietKiem")
@Data
public class SoTietKiem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    /** Mã hiển thị cho người dùng, ví dụ: STK20260512001 */
    @Column(name = "ma_so", nullable = false, unique = true, length = 50)
    private String maSo;

    /** Chủ sổ – khách hàng */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_hang_id", nullable = false)
    private NguoiDung khachHang;

    /** Loại kỳ hạn đã chọn */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loai_tiet_kiem_id", nullable = false)
    private LoaiTietKiem loaiTietKiem;

    /** Giao dịch viên mở sổ */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_tao_id", nullable = false)
    private NguoiDung nhanVienTao;

    /** Số tiền gởi ban đầu (≥ soTienGuiToiThieu của loại tương ứng) */
    @Column(name = "so_tien_ban_dau", nullable = false)
    private BigDecimal soTienBanDau;

    /** Số dư hiện tại (tự cập nhật sau mỗi giao dịch) */
    @Column(name = "so_du_hien_tai", nullable = false)
    private BigDecimal soDuHienTai;

    /**
     * Snapshot lãi suất tại thời điểm mở sổ.
     * Không thay đổi dù admin sau này chỉnh lãi suất.
     */
    @Column(name = "lai_suat_mo_so", nullable = false, precision = 6, scale = 4)
    private BigDecimal laiSuatMoSo;

    @Column(name = "ngay_mo", nullable = false)
    private LocalDate ngayMo;

    /** NULL nếu loại không kỳ hạn */
    @Column(name = "ngay_dao_han")
    private LocalDate ngayDaoHan;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiEnum trangThai = TrangThaiEnum.dang_hoat_dong;

    @Column(name = "tao_luc", nullable = false, updatable = false)
    private LocalDateTime taoLuc = LocalDateTime.now();

    public enum TrangThaiEnum {
        dang_hoat_dong, da_tat_toan
    }
}