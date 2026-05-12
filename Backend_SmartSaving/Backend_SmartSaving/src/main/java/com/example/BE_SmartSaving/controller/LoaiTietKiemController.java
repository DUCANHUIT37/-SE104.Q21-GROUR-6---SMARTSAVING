package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.service.LoaiTietKiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Quản lý danh mục loại tiết kiệm.
 * Base URL: /api/loaitietkiem
 */
@RestController
@RequestMapping("/api/loaitietkiem")
@CrossOrigin("*")
public class LoaiTietKiemController {

    @Autowired
    private LoaiTietKiemService loaiTietKiemService;

    /** Lấy tất cả loại (kể cả đã vô hiệu hoá) – dùng cho màn hình Admin */
    @GetMapping
    public ResponseEntity<?> layTatCa() {
        return ResponseEntity.ok(loaiTietKiemService.layTatCa());
    }

    /** Chỉ trả về loại đang áp dụng – dùng cho dropdown Mở Sổ Mới */
    @GetMapping("/dang-ap-dung")
    public ResponseEntity<?> layDangApDung() {
        return ResponseEntity.ok(loaiTietKiemService.layDangApDung());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layTheoId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(loaiTietKiemService.layTheoId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Admin tạo loại kỳ hạn mới (QĐ6) */
    @PostMapping
    public ResponseEntity<?> taoMoi(@RequestBody LoaiTietKiem loai) {
        try {
            return ResponseEntity.ok(loaiTietKiemService.taoMoi(loai));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin cập nhật lãi suất (QĐ6) */
    @PutMapping("/{id}/lai-suat")
    public ResponseEntity<?> capNhatLaiSuat(@PathVariable Integer id,
                                            @RequestParam BigDecimal laiSuat) {
        try {
            return ResponseEntity.ok(loaiTietKiemService.capNhatLaiSuat(id, laiSuat));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Admin kích hoạt / vô hiệu hoá loại kỳ hạn (QĐ6) */
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleTrangThai(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(loaiTietKiemService.toggleTrangThai(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}