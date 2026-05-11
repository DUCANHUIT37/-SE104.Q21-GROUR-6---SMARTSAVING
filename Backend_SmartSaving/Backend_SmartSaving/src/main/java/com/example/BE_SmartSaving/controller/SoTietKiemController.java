package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.*;
import com.example.BE_SmartSaving.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

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
    @Autowired
    private BaoCaoService baoCaoService; // Thằng này để trị lỗi 404 báo cáo
    @Autowired
    private PhieuGoiRepository phieuGoiRepository; // Để lấy lịch sử
    @Autowired
    private PhieuRutRepository phieuRutRepository; // Để lấy lịch sử

    @PostMapping("/mo-so")
    public ResponseEntity<?> moSo(@RequestBody SoTietKiem soTietKiem) {
        try {
            return ResponseEntity.ok(soTietKiemService.moSoTietKiem(soTietKiem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> layDanhSach() {
        return ResponseEntity.ok(soTietKiemService.layTatCaSo());
    }

    @PutMapping("/gui-them/{id}")
    public ResponseEntity<?> guiThemTien(@PathVariable Integer id, @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuGoiService.thucHienGuiTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rut-tien/{id}")
    public ResponseEntity<?> rutTien(@PathVariable Integer id, @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuRutService.thucHienRutTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ĐÂY LÀ KHÚC CHỮA LỖI 404 CỦA EM ---
    @GetMapping("/bao-cao/ngay")
    public ResponseEntity<?> xemBaoCaoNgay(@RequestParam String ngay) {
        try {
            java.time.LocalDate ngayBaoCao = java.time.LocalDate.parse(ngay);
            return ResponseEntity.ok(baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy báo cáo: " + e.getMessage());
        }
    }

    // --- THÊM LỊCH SỬ GIAO DỊCH (CHO ĐỦ README) ---
    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> layLichSuGiaoDich(@PathVariable Integer id) {
        Map<String, Object> lichSu = new HashMap<>();
        lichSu.put("lichSuGuiTien", phieuGoiRepository.findBySoTietKiemId(id));
        lichSu.put("lichSuRutTien", phieuRutRepository.findBySoTietKiemId(id));
        return ResponseEntity.ok(lichSu);
    }

    // --- THÊM XÓA SỔ ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> xoaSoTietKiem(@PathVariable Integer id) {
        try {
            soTietKiemService.xoaSo(id);
            return ResponseEntity.ok("Đã xóa sổ tiết kiệm thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa: " + e.getMessage());
        }
    }
}