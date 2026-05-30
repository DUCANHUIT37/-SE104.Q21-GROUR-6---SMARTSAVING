package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.service.ThamSoAdminService;
import com.example.BE_SmartSaving.service.ThamSoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Quản lý tham số hệ thống (QĐ6 – chỉ Admin).
 * Base URL: /api/thamso
 */
@RestController
@RequestMapping("/api/thamso")
public class ThamSoController {

    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private ThamSoAdminService thamSoAdminService;

    /** Lấy toàn bộ tham số – dùng cho màn hình Cài Đặt */
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> layTatCa() {
        Object data = thamSoService.layTatCaThamSo();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{khoa}")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> layTheoKhoa(@PathVariable String khoa) {
        try {
            Object data = thamSoService.layTheoKhoa(khoa);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy tham số: " + khoa));
        }
    }

    /**
     * Admin cập nhật giá trị tham số.
     * Body: { "giaTriMoi": "500000", "lyDo": "Điều chỉnh theo quy định mới" }
     * Header: X-Admin-Id: {nguoiDungId} (tuỳ chọn)
     */
    @PutMapping("/{khoa}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> capNhat(@PathVariable String khoa,
                                                    @RequestBody Map<String, String> body,
                                                    @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId) {
        try {
            String giaTriMoi = body.get("giaTriMoi");
            String lyDo = body.get("lyDo");
            Object result = thamSoAdminService.capNhatThamSo(khoa, giaTriMoi, adminId, lyDo);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Xem lịch sử thay đổi của 1 tham số */
    @GetMapping("/{khoa}/lich-su")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> layLichSu(@PathVariable String khoa) {
        try {
            Object data = thamSoAdminService.layLichSuThayDoi(khoa);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}