package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.LichSuThamSo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuThamSoRepository extends JpaRepository<LichSuThamSo, Integer> {

    List<LichSuThamSo> findByThamSoIdOrderByThoiGianDesc(Integer thamSoId);
}