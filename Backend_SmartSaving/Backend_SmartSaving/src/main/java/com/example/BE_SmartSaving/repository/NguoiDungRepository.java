package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {

    Optional<NguoiDung> findByCmnd(String cmnd);

    boolean existsByCmnd(String cmnd);

    /** Tìm kiếm theo tên (LIKE, không phân biệt hoa thường) */
    List<NguoiDung> findByHoTenContainingIgnoreCase(String hoTen);

    List<NguoiDung> findByLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum loaiNguoiDung);
}