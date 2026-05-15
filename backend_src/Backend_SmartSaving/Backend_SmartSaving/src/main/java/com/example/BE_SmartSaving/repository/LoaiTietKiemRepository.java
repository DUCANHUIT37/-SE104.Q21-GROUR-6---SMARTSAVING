package com.example.BE_SmartSaving.repository;

import com.example.BE_SmartSaving.model.LoaiTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoaiTietKiemRepository extends JpaRepository<LoaiTietKiem, Integer> {

    /** Chỉ lấy các loại còn được dùng (dangApDung = true) */
    List<LoaiTietKiem> findByDangApDungTrue();

    /** Lấy loại có kỳ hạn = 0 (không kỳ hạn) để tính lãi suất phạt rút sớm */
    java.util.Optional<LoaiTietKiem> findFirstByKyHanThang(Integer kyHanThang);
}