package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.service.ThamSoAdminService;
import com.example.BE_SmartSaving.service.ThamSoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Quản lý tham số hệ thống (QĐ6 – chỉ Admin).
 * Base URL: /api/thamso
 */
@RestController
@RequestMapping("/api/thamso")
@CrossOrigin("*")
public class ThamSoController {

    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private ThamSoAdminService thamSoAdminService;

    /** Lấy toàn bộ tham số – dùng cho màn hình Cài Đặt */
    @GetMapping
    public ResponseEntity<?> layTatCa() {
        return ResponseEntity.ok(thamSoService.layTatCaThamSo());
    }

    @GetMapping("/{khoa}")
    public ResponseEntity<?> layTheoKhoa(@PathVariable String khoa) {
        try {
            return ResponseEntity.ok(thamSoService.layTheoKhoa(khoa));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Admin cập nhật giá trị tham số.
     * Body: { "giaTriMoi": "500000", "lyDo": "Điều chỉnh theo quy định mới" }
     * Header: X-Admin-Id: {nguoiDungId} (tuỳ chọn)
     */
    @PutMapping("/{khoa}")
    public ResponseEntity<?> capNhat(@PathVariable String khoa,
                                     @RequestBody Map<String, String> body,
                                     @RequestHeader(value = "X-Admin-Id", required = false)
                                     Integer adminId) {
        try {
            String giaTriMoi = body.get("giaTriMoi");
            String lyDo = body.get("lyDo");
            return ResponseEntity.ok(
                    thamSoAdminService.capNhatThamSo(khoa, giaTriMoi, adminId, lyDo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Xem lịch sử thay đổi của 1 tham số */
    @GetMapping("/{khoa}/lich-su")
    public ResponseEntity<?> layLichSu(@PathVariable String khoa) {
        try {
            return ResponseEntity.ok(thamSoAdminService.layLichSuThayDoi(khoa));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}