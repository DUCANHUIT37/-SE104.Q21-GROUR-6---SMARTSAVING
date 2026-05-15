package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.PhieuRut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PhieuRutRepository extends JpaRepository<PhieuRut, Integer> {

    List<PhieuRut> findBySoTietKiemId(Integer soTietKiemId);

    List<PhieuRut> findBySoTietKiemIdOrderByNgayRutDesc(Integer soTietKiemId);

    /**
     * Tổng tiền rút theo loại tiết kiệm và ngày.
     * Dùng cho báo cáo BM5.1: TổngChi = tiền rút ra.
     */
    @Query("SELECT COALESCE(SUM(pr.soTienRut), 0) FROM PhieuRut pr " +
            "WHERE pr.soTietKiem.loaiTietKiem.id = :loaiId " +
            "AND pr.ngayRut = :ngay")
    BigDecimal tinhTongChiTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                                         @Param("ngay") LocalDate ngay);

    /**
     * Đếm số sổ đóng (tất toán) theo loại và ngày – dùng cho BM5.2.
     */
    @Query("SELECT COUNT(pr) FROM PhieuRut pr " +
            "WHERE pr.soTietKiem.loaiTietKiem.id = :loaiId " +
            "AND pr.ngayRut = :ngay AND pr.tatToan = true")
    Long demSoDongTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                                 @Param("ngay") LocalDate ngay);
}