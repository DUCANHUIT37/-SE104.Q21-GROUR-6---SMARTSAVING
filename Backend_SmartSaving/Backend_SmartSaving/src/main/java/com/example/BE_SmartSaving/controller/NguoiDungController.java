package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.service.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Quản lý thông tin người dùng (khách hàng + nhân viên).
 * Base URL: /api/nguoidung
 */
@RestController
@RequestMapping("/api/nguoidung")
@CrossOrigin("*")
public class NguoiDungController {

    @Autowired
    private NguoiDungService nguoiDungService;

    /** Lấy toàn bộ danh sách người dùng */
    @GetMapping
    public ResponseEntity<?> layTatCa() {
        return ResponseEntity.ok(nguoiDungService.layTatCa());
    }

    /** Lấy theo ID */
    @GetMapping("/{id}")
    public ResponseEntity<?> layTheoId(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(nguoiDungService.layTheoId(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Tra cứu theo CMND – dùng khi giao dịch viên nhập CMND để điền tự động.
     * GET /api/nguoidung/cmnd/{cmnd}
     */
    @GetMapping("/cmnd/{cmnd}")
    public ResponseEntity<?> layTheoCmnd(@PathVariable String cmnd) {
        try {
            return ResponseEntity.ok(nguoiDungService.layTheoCmnd(cmnd));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Tìm kiếm theo tên */
    @GetMapping("/tim-kiem")
    public ResponseEntity<?> timKiem(@RequestParam String hoTen) {
        return ResponseEntity.ok(nguoiDungService.timKiemTheoTen(hoTen));
    }

    /** Tạo mới người dùng (khách hàng hoặc nhân viên) */
    @PostMapping
    public ResponseEntity<?> taoMoi(@RequestBody NguoiDung nguoiDung) {
        try {
            return ResponseEntity.ok(nguoiDungService.taoMoi(nguoiDung));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Tra cứu hoặc tạo mới khách hàng theo CMND.
     * POST /api/nguoidung/tra-cuu-hoac-tao
     * Dùng trong luồng Mở Sổ Mới.
     */
    @PostMapping("/tra-cuu-hoac-tao")
    public ResponseEntity<?> timHoacTao(@RequestBody NguoiDung thongTin) {
        try {
            return ResponseEntity.ok(nguoiDungService.timHoacTaoKhachHang(thongTin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /** Cập nhật thông tin người dùng */
    @PutMapping("/{id}")
    public ResponseEntity<?> capNhat(@PathVariable Integer id,
                                     @RequestBody NguoiDung thongTin) {
        try {
            return ResponseEntity.ok(nguoiDungService.capNhat(id, thongTin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}