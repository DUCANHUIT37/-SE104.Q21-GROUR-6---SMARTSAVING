package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.LoaiTietKiemDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.service.LoaiTietKiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Quản lý danh mục loại tiết kiệm.
 * Base URL: /api/loaitietkiem
 */
@RestController
@RequestMapping("/api/loaitietkiem")
public class LoaiTietKiemController {

    @Autowired
    private LoaiTietKiemService loaiTietKiemService;

    /** Lấy tất cả loại (kể cả đã vô hiệu hoá) – chỉ Admin */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<List<LoaiTietKiemDTO>>> layTatCa() {
        List<LoaiTietKiemDTO> list = loaiTietKiemService.layTatCa();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Chỉ trả về loại đang áp dụng – dùng cho dropdown Mở Sổ Mới */
    @GetMapping("/dang-ap-dung")
    public ResponseEntity<ApiResponse<List<LoaiTietKiemDTO>>> layDangApDung() {
        List<LoaiTietKiemDTO> list = loaiTietKiemService.layDangApDung();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> layTheoId(@PathVariable Integer id) {
        try {
            LoaiTietKiemDTO dto = loaiTietKiemService.layTheoId(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy loại tiết kiệm với ID: " + id));
        }
    }

    /** Admin tạo loại kỳ hạn mới (QĐ6) */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> taoMoi(@RequestBody LoaiTietKiem loai) {
        try {
            LoaiTietKiemDTO dto = loaiTietKiemService.taoMoi(loai);
            return ResponseEntity.status(201).body(ApiResponse.created(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Admin cập nhật lãi suất (QĐ6) */
    @PutMapping("/{id}/lai-suat")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> capNhatLaiSuat(@PathVariable Integer id,
                                                          @RequestParam BigDecimal laiSuat) {
        try {
            LoaiTietKiemDTO dto = loaiTietKiemService.capNhatLaiSuat(id, laiSuat);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Admin kích hoạt / vô hiệu hoá loại kỳ hạn (QĐ6) */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> toggleTrangThai(@PathVariable Integer id) {
        try {
            LoaiTietKiemDTO dto = loaiTietKiemService.toggleTrangThai(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}