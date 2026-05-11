package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.PhieuGoi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PhieuGoiRepository extends JpaRepository<PhieuGoi, Integer> {

    // Chú ý 1: Kết thúc bằng dấu chấm phẩy (;), tuyệt đối KHÔNG có ngoặc nhọn
    @Query("SELECT p FROM PhieuGoi p WHERE p.soTietKiem.id = :soTietKiemId")
    List<PhieuGoi> findBySoTietKiemId(@Param("soTietKiemId") Integer soTietKiemId);

    // Chú ý 2: Kết thúc bằng dấu chấm phẩy (;)
    @Query("SELECT COALESCE(SUM(p.soTienGoi), 0) FROM PhieuGoi p WHERE p.soTietKiem.loaiTietKiem.id = :loaiId AND p.ngayGoi = :ngay")
    BigDecimal tinhTongThuTheoLoaiVaNgay(@Param("loaiId") Integer loaiId, @Param("ngay") LocalDate ngay);
}