package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.BaoCaoNgayDTO;
import com.example.BE_SmartSaving.dto.BaoCaoThangDTO;
import com.example.BE_SmartSaving.dto.LichSuGiaoDichDTO;
import com.example.BE_SmartSaving.service.BaoCaoService;
import com.example.BE_SmartSaving.service.LichSuGiaoDichService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Báo cáo kế toán (BM5.1, BM5.2).
 * Base URL: /api/baocao
 */
@RestController
@RequestMapping("/api/baocao")
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
    public ResponseEntity<ApiResponse<?>> baoCaoNgay(@RequestParam String ngay) {
        try {
            LocalDate ngayBaoCao = LocalDate.parse(ngay);
            List<BaoCaoNgayDTO> data = baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Lỗi lấy báo cáo ngày: " + e.getMessage()));
        }
    }

    /**
     * BM5.2 – Báo cáo mở/đóng sổ trong tháng.
     * GET /api/baocao/thang?thang=2026-05
     * GET /api/baocao/thang?thang=2026-05&loaiId=1  (lọc theo loại)
     */
    @GetMapping("/thang")
    public ResponseEntity<ApiResponse<?>> baoCaoThang(@RequestParam String thang,
                                                        @RequestParam(required = false) Integer loaiId) {
        try {
            YearMonth yearMonth = YearMonth.parse(thang);
            List<BaoCaoThangDTO> data = baoCaoService.lapBaoCaoMoDongSoThang(yearMonth, loaiId);
            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Lỗi lấy báo cáo tháng: " + e.getMessage()));
        }
    }

    /**
     * Lịch sử giao dịch chi tiết của 1 sổ – audit trail đầy đủ.
     * GET /api/baocao/lich-su/{soTietKiemId}
     */
    @GetMapping("/lich-su/{soTietKiemId}")
    public ResponseEntity<ApiResponse<List<LichSuGiaoDichDTO>>> lichSuGiaoDich(@PathVariable Integer soTietKiemId) {
        List<LichSuGiaoDichDTO> data = lichSuGiaoDichService.layTheoSo(soTietKiemId);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}