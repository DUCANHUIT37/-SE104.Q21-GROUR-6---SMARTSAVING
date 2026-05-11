package com.example.demo.repository;

import com.example.demo.model.SoTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SoTietKiemRepository extends JpaRepository<SoTietKiem, Integer> {
    Optional<SoTietKiem> findByMaSo(String maSo); // Tìm sổ theo mã số để rút/gửi tiền
}