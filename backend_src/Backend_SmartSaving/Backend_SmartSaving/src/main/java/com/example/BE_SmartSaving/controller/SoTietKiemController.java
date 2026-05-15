package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.SoTietKiemDTO;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Quản lý sổ tiết kiệm – nghiệp vụ chính.
 * Base URL: /api/sotietkiem
 * CORS được xử lý tập trung ở CorsConfig.java
 */
@RestController
@RequestMapping("/api/sotietkiem")
public class SoTietKiemController {

    @Autowired
    private SoTietKiemService soTietKiemService;
    @Autowired
    private PhieuRutService phieuRutService;
    @Autowired
    private PhieuGoiService phieuGoiService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;

    /** Lấy toàn bộ lịch sử giao dịch (phiếu gửi/rút) */
    @GetMapping("/giao-dich")
    public ResponseEntity<ApiResponse<?>> layTatCaGiaoDich() {
        return ResponseEntity.ok(ApiResponse.success(lichSuGiaoDichService.layTatCaGiaoDich()));
    }

    /** Mở sổ tiết kiệm mới (BM1, QĐ1) */
    @PostMapping("/mo-so")
    public ResponseEntity<ApiResponse<?>> moSo(@RequestBody SoTietKiem soTietKiem) {
        try {
            SoTietKiemDTO result = soTietKiemService.moSoTietKiem(soTietKiem);
            return ResponseEntity.status(201).body(ApiResponse.created(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Lấy danh sách tất cả sổ (BM4) */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> layDanhSach() {
        List<SoTietKiemDTO> list = soTietKiemService.layTatCaSo();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Tìm kiếm theo mã sổ, tên KH hoặc CMND (BM4) */
    @GetMapping("/tim-kiem")
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> timKiem(@RequestParam String q) {
        List<SoTietKiemDTO> list = soTietKiemService.timKiem(q);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Chi tiết 1 sổ */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> layTheoId(@PathVariable Integer id) {
        try {
            SoTietKiemDTO dto = soTietKiemService.laySoTheoId(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy sổ tiết kiệm với ID: " + id));
        }
    }

    /** Lấy tất cả sổ của 1 khách hàng */
    @GetMapping("/khach-hang/{khachHangId}")
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> layTheoKhachHang(@PathVariable Integer khachHangId) {
        List<SoTietKiemDTO> list = soTietKiemService.laySoTheoKhachHang(khachHangId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Gởi thêm tiền (BM2, QĐ2) */
    @PutMapping("/gui-them/{id}")
    public ResponseEntity<ApiResponse<?>> guiThemTien(@PathVariable Integer id,
                                                       @RequestParam BigDecimal soTien) {
        try {
            Object result = phieuGoiService.thucHienGuiTien(id, soTien);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Rút tiền (BM3, QĐ3) */
    @PostMapping("/rut-tien/{id}")
    public ResponseEntity<ApiResponse<?>> rutTien(@PathVariable Integer id,
                                                   @RequestParam BigDecimal soTien) {
        try {
            Object result = phieuRutService.thucHienRutTien(id, soTien);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Xoá sổ – chỉ được xoá sổ đã tất toán. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> xoaSo(@PathVariable Integer id) {
        try {
            soTietKiemService.xoaSo(id);
            return ResponseEntity.ok(ApiResponse.success("Đã xoá sổ tiết kiệm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}