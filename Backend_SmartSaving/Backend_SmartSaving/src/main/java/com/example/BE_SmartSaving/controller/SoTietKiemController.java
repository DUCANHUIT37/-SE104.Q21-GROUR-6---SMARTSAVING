package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Quản lý sổ tiết kiệm – nghiệp vụ chính.
 * Base URL: /api/sotietkiem
 */
@RestController
@RequestMapping("/api/sotietkiem")
@CrossOrigin("*")
public class SoTietKiemController {

    @Autowired
    private SoTietKiemService soTietKiemService;
    @Autowired
    private PhieuRutService phieuRutService;
    @Autowired
    private PhieuGoiService phieuGoiService;

    /** Mở sổ tiết kiệm mới (BM1, QĐ1) */
    @PostMapping("/mo-so")
    public ResponseEntity<?> moSo(@RequestBody SoTietKiem soTietKiem) {
        try {
            return ResponseEntity.ok(soTietKiemService.moSoTietKiem(soTietKiem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Lấy danh sách tất cả sổ (BM4) */
    @GetMapping
    public ResponseEntity<?> layDanhSach() {
        return ResponseEntity.ok(soTietKiemService.layTatCaSo());
    }

    /** Tìm kiếm theo mã sổ, tên KH hoặc CMND (BM4) */
    @GetMapping("/tim-kiem")
    public ResponseEntity<?> timKiem(@RequestParam String q) {
        return ResponseEntity.ok(soTietKiemService.timKiem(q));
    }

    /** Chi tiết 1 sổ */
    @GetMapping("/{id}")
    public ResponseEntity<?> layTheoId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(soTietKiemService.laySoTheoId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Lấy tất cả sổ của 1 khách hàng */
    @GetMapping("/khach-hang/{khachHangId}")
    public ResponseEntity<?> layTheoKhachHang(@PathVariable Integer khachHangId) {
        return ResponseEntity.ok(soTietKiemService.laySoTheoKhachHang(khachHangId));
    }

    /** Gởi thêm tiền (BM2, QĐ2) */
    @PutMapping("/gui-them/{id}")
    public ResponseEntity<?> guiThemTien(@PathVariable Integer id,
                                         @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuGoiService.thucHienGuiTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Rút tiền (BM3, QĐ3) */
    @PostMapping("/rut-tien/{id}")
    public ResponseEntity<?> rutTien(@PathVariable Integer id,
                                     @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuRutService.thucHienRutTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Xoá sổ – chỉ được xoá sổ đã tất toán.
     * Sổ đang hoạt động KHÔNG được xoá (quy định an toàn dữ liệu).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaSo(@PathVariable Integer id) {
        try {
            soTietKiemService.xoaSo(id);
            return ResponseEntity.ok("Đã xoá sổ tiết kiệm thành công!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}