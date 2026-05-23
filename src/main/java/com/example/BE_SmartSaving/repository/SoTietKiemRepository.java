package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.SoTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SoTietKiemRepository extends JpaRepository<SoTietKiem, Integer> {

    Optional<SoTietKiem> findByMaSo(String maSo);

    List<SoTietKiem> findByKhachHangId(Integer khachHangId);

    List<SoTietKiem> findByTrangThai(SoTietKiem.TrangThaiEnum trangThai);

    /** BM4 – tìm kiếm động theo mã sổ, tên KH, hoặc CMND */
    @Query("SELECT s FROM SoTietKiem s " +
            "JOIN s.khachHang kh " +
            "WHERE (:tuKhoa IS NULL OR " +
            "       LOWER(s.maSo) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) OR " +
            "       LOWER(kh.hoTen) LIKE LOWER(CONCAT('%', :tuKhoa, '%')) OR " +
            "       kh.cmnd LIKE CONCAT('%', :tuKhoa, '%'))")
    List<SoTietKiem> timKiem(@Param("tuKhoa") String tuKhoa);

    /** Đếm số sổ mở theo loại và ngày (dùng cho BM5.2) */
    @Query("SELECT COUNT(s) FROM SoTietKiem s " +
            "WHERE s.loaiTietKiem.id = :loaiId " +
            "AND FUNCTION('DATE', s.ngayMo) = :ngay")
    Long demSoMoTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                               @Param("ngay") java.time.LocalDate ngay);

    /** Đếm số sổ đóng theo loại và ngày (trangThai = da_tat_toan) */
    @Query("SELECT COUNT(p) FROM PhieuRut p " +
            "WHERE p.soTietKiem.loaiTietKiem.id = :loaiId " +
            "AND p.ngayRut = :ngay " +
            "AND p.tatToan = true")
    Long demSoDongTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                                 @Param("ngay") java.time.LocalDate ngay);

    @Query("SELECT COALESCE(SUM(s.soDuHienTai), 0) FROM SoTietKiem s")
    java.math.BigDecimal sumSoDuHienTai();
}