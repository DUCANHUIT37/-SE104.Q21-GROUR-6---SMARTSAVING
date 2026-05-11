package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.PhieuRut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PhieuRutRepository extends JpaRepository<PhieuRut, Integer> {

    // Chú ý 3: Vẫn là dấu chấm phẩy (;)
    @Query("SELECT p FROM PhieuRut p WHERE p.soTietKiem.id = :soTietKiemId")
    List<PhieuRut> findBySoTietKiemId(@Param("soTietKiemId") Integer soTietKiemId);

    // Chú ý 4: Chốt hạ bằng dấu chấm phẩy (;)
    @Query("SELECT COALESCE(SUM(p.soTienRut), 0) FROM PhieuRut p WHERE p.soTietKiem.loaiTietKiem.id = :loaiId AND p.ngayRut = :ngay")
    BigDecimal tinhTongChiTheoLoaiVaNgay(@Param("loaiId") Integer loaiId, @Param("ngay") LocalDate ngay);
}