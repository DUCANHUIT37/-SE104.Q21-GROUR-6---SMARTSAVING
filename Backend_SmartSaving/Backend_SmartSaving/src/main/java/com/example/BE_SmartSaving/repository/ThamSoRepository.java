package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.ThamSo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ThamSoRepository extends JpaRepository<ThamSo, Integer> {
    Optional<ThamSo> findByKhoa(String khoa);
}