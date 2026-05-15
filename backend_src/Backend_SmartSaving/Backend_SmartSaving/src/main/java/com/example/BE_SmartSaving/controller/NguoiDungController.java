package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.NguoiDungDTO;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.service.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Quản lý thông tin người dùng (khách hàng + nhân viên).
 * Base URL: /api/nguoidung
 */
@RestController
@RequestMapping("/api/nguoidung")
public class NguoiDungController {

    @Autowired
    private NguoiDungService nguoiDungService;

    /** Lấy toàn bộ danh sách người dùng */
    @GetMapping
    public ResponseEntity<ApiResponse<List<NguoiDungDTO>>> layTatCa() {
        List<NguoiDungDTO> list = nguoiDungService.layTatCa();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Lấy theo ID */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> layTheoId(@PathVariable Integer id) {
        try {
            NguoiDungDTO dto = nguoiDungService.layTheoId(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy người dùng với ID: " + id));
        }
    }

    /**
     * Tra cứu theo CMND – dùng khi giao dịch viên nhập CMND để điền tự động.
     * GET /api/nguoidung/cmnd/{cmnd}
     */
    @GetMapping("/cmnd/{cmnd}")
    public ResponseEntity<ApiResponse<?>> layTheoCmnd(@PathVariable String cmnd) {
        try {
            NguoiDungDTO dto = nguoiDungService.layTheoCmnd(cmnd);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy người dùng với CMND: " + cmnd));
        }
    }

    /** Tìm kiếm theo tên */
    @GetMapping("/tim-kiem")
    public ResponseEntity<ApiResponse<List<NguoiDungDTO>>> timKiem(@RequestParam String hoTen) {
        List<NguoiDungDTO> list = nguoiDungService.timKiemTheoTen(hoTen);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Tạo mới người dùng (khách hàng hoặc nhân viên) */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> taoMoi(@RequestBody NguoiDung nguoiDung) {
        try {
            NguoiDungDTO dto = nguoiDungService.taoMoi(nguoiDung);
            return ResponseEntity.status(201).body(ApiResponse.created(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Tra cứu hoặc tạo mới khách hàng theo CMND.
     * POST /api/nguoidung/tra-cuu-hoac-tao
     * Dùng trong luồng Mở Sổ Mới.
     */
    @PostMapping("/tra-cuu-hoac-tao")
    public ResponseEntity<ApiResponse<?>> timHoacTao(@RequestBody NguoiDung thongTin) {
        try {
            NguoiDungDTO dto = nguoiDungService.timHoacTaoKhachHang(thongTin);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Cập nhật thông tin người dùng */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> capNhat(@PathVariable Integer id,
                                                    @RequestBody NguoiDung thongTin) {
        try {
            NguoiDungDTO dto = nguoiDungService.capNhat(id, thongTin);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}