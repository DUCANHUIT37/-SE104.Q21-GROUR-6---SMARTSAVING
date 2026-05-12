package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.service.BaoCaoService;
import com.example.BE_SmartSaving.service.LichSuGiaoDichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Báo cáo kế toán (BM5.1, BM5.2).
 * Base URL: /api/baocao
 */
@RestController
@RequestMapping("/api/baocao")
@CrossOrigin("*")
public class BaoCaoController {

    @Autowired
    private BaoCaoService baoCaoService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;

    /**
     * BM5.1 – Báo cáo doanh số hoạt động trong ngày.
     * GET /api/baocao/ngay?ngay=2026-05-12
     */
    @GetMapping("/ngay")
    public ResponseEntity<?> baoCaoNgay(@RequestParam String ngay) {
        try {
            LocalDate ngayBaoCao = LocalDate.parse(ngay);
            return ResponseEntity.ok(baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy báo cáo ngày: " + e.getMessage());
        }
    }

    /**
     * BM5.2 – Báo cáo mở/đóng sổ trong tháng.
     * GET /api/baocao/thang?thang=2026-05
     * GET /api/baocao/thang?thang=2026-05&loaiId=1  (lọc theo loại)
     */
    @GetMapping("/thang")
    public ResponseEntity<?> baoCaoThang(@RequestParam String thang,
                                         @RequestParam(required = false) Integer loaiId) {
        try {
            YearMonth yearMonth = YearMonth.parse(thang);
            return ResponseEntity.ok(baoCaoService.lapBaoCaoMoDongSoThang(yearMonth, loaiId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy báo cáo tháng: " + e.getMessage());
        }
    }

    /**
     * Lịch sử giao dịch chi tiết của 1 sổ – audit trail đầy đủ.
     * GET /api/baocao/lich-su/{soTietKiemId}
     */
    @GetMapping("/lich-su/{soTietKiemId}")
    public ResponseEntity<?> lichSuGiaoDich(@PathVariable Integer soTietKiemId) {
        return ResponseEntity.ok(lichSuGiaoDichService.layTheoSo(soTietKiemId));
    }
}