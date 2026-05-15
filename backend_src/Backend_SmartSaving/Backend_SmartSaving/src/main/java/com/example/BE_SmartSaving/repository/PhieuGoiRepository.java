package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.PhieuGoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PhieuGoiRepository extends JpaRepository<PhieuGoi, Integer> {

    List<PhieuGoi> findBySoTietKiemId(Integer soTietKiemId);

    List<PhieuGoi> findBySoTietKiemIdOrderByNgayGoiDesc(Integer soTietKiemId);

    /**
     * Tổng tiền gởi thêm theo loại tiết kiệm và ngày.
     * Dùng cho báo cáo BM5.1: TổngThu = tiền gởi vào.
     */
    @Query("SELECT COALESCE(SUM(pg.soTienGoi), 0) FROM PhieuGoi pg " +
            "WHERE pg.soTietKiem.loaiTietKiem.id = :loaiId " +
            "AND pg.ngayGoi = :ngay")
    BigDecimal tinhTongThuTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                                         @Param("ngay") LocalDate ngay);

    /**
     * Tổng tiền gởi lần đầu (mo_so) theo loại và ngày.
     * Kết hợp với tinhTongThuTheoLoaiVaNgay để có TổngThu đầy đủ.
     */
    @Query("SELECT COALESCE(SUM(s.soTienBanDau), 0) FROM SoTietKiem s " +
            "WHERE s.loaiTietKiem.id = :loaiId " +
            "AND s.ngayMo = :ngay")
    BigDecimal tinhTongMoSoTheoLoaiVaNgay(@Param("loaiId") Integer loaiId,
                                          @Param("ngay") LocalDate ngay);
}