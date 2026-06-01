package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.NguoiDungDTO;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.service.NguoiDungService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    /** Lấy toàn bộ danh sách người dùng – chỉ Admin */
    @GetMapping
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<List<NguoiDungDTO>>> layTatCa() {
        List<NguoiDungDTO> list = nguoiDungService.layTatCa();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Lấy danh sách khách hàng – Admin + Giao Dịch Viên */
    @GetMapping("/khach-hang")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<List<NguoiDungDTO>>> layKhachHang() {
        List<NguoiDungDTO> list = nguoiDungService.layKhachHang();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Lấy theo ID – chỉ Admin */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> layTheoId(@PathVariable Integer id) {
        try {
            NguoiDungDTO dto = nguoiDungService.layTheoId(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy người dùng với ID: " + id));
        }
    }

    /**
     * Tra cứu theo CMND – Admin + Giao Dịch Viên (dùng khi mở sổ mới).
     * GET /api/nguoidung/cmnd/{cmnd}
     */
    @GetMapping("/cmnd/{cmnd}")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> layTheoCmnd(@PathVariable String cmnd) {
        try {
            NguoiDungDTO dto = nguoiDungService.layTheoCmnd(cmnd);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "Không tìm thấy người dùng với CMND: " + cmnd));
        }
    }

    /** Tìm kiếm theo tên – Admin + Giao Dịch Viên */
    @GetMapping("/tim-kiem")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<List<NguoiDungDTO>>> timKiem(@RequestParam String hoTen) {
        List<NguoiDungDTO> list = nguoiDungService.timKiemTheoTen(hoTen);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Tạo mới người dùng (khách hàng hoặc nhân viên) – chỉ Admin */
    @PostMapping
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> taoMoi(@RequestBody NguoiDung nguoiDung) {
        try {
            NguoiDungDTO dto = nguoiDungService.taoMoi(nguoiDung);
            return ResponseEntity.status(201).body(ApiResponse.created(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /**
     * Tra cứu hoặc tạo mới khách hàng theo CMND – Admin + Giao Dịch Viên.
     * POST /api/nguoidung/tra-cuu-hoac-tao
     */
    @PostMapping("/tra-cuu-hoac-tao")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> timHoacTao(@RequestBody NguoiDung thongTin) {
        try {
            NguoiDungDTO dto = nguoiDungService.timHoacTaoKhachHang(thongTin);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Cập nhật thông tin người dùng – chỉ Admin */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> capNhat(@PathVariable Integer id,
                                                    @RequestBody NguoiDung thongTin) {
        try {
            NguoiDungDTO dto = nguoiDungService.capNhat(id, thongTin);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Khoá/Mở khoá tài khoản người dùng – chỉ Admin */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> toggleStatus(@PathVariable Integer id) {
        try {
            NguoiDungDTO dto = nguoiDungService.toggleKichHoat(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** 
     * Thăng cấp một Khách Hàng thành Giao Dịch Viên – chỉ Admin 
     */
    @PutMapping("/{id}/promote-to-teller")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> thangCapGiaoDichVien(@PathVariable Integer id) {
        try {
            NguoiDungDTO dto = nguoiDungService.thangCapThanhGiaoDichVien(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** 
     * Hạ cấp một Giao Dịch Viên thành Khách Hàng – chỉ Admin 
     */
    @PutMapping("/{id}/demote-to-user")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> haQuyenGiaoDichVien(@PathVariable Integer id) {
        try {
            NguoiDungDTO dto = nguoiDungService.haQuyenThanhKhachHang(id);
            return ResponseEntity.ok(ApiResponse.success(dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Xoá tài khoản – chỉ Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<?>> xoaTaiKhoan(@PathVariable Integer id) {
        try {
            nguoiDungService.xoaTaiKhoan(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}