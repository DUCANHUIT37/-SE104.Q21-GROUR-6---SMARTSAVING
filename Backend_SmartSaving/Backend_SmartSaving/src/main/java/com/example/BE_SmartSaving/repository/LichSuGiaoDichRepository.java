package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.LichSuGiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuGiaoDichRepository extends JpaRepository<LichSuGiaoDich, Integer> {

    List<LichSuGiaoDich> findBySoTietKiemIdOrderByThoiGianDesc(Integer soTietKiemId);

    List<LichSuGiaoDich> findBySoTietKiemId(Integer soTietKiemId);
}