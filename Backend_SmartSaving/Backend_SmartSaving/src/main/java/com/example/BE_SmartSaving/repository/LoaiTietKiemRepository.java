package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.LoaiTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiTietKiemRepository extends JpaRepository<LoaiTietKiem, Integer> {
}