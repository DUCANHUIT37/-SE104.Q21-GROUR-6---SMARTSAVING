package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {

    Optional<TaiKhoan> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<TaiKhoan> findByNguoiDungId(Integer nguoiDungId);
}