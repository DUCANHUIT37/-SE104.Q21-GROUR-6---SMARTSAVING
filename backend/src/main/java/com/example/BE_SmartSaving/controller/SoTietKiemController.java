package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.SoTietKiemDTO;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

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
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> layTatCaGiaoDich() {
        return ResponseEntity.ok(ApiResponse.success(lichSuGiaoDichService.layTatCaGiaoDich()));
    }

    /** Mở sổ tiết kiệm mới (BM1, QĐ1) – Admin + Giao Dịch Viên */
    @PostMapping("/mo-so")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
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
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> layDanhSach() {
        List<SoTietKiemDTO> list = soTietKiemService.layTatCaSo();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Xuất danh sách sổ tiết kiệm ra file Excel (.xlsx) */
    @GetMapping("/export/excel")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<byte[]> exportToExcel() {
        List<SoTietKiemDTO> list = soTietKiemService.layTatCaSo();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Danh Sách Sổ Tiết Kiệm");

            // Header Style (Bold, Center, Pale Blue Background, Thin Borders)
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);

            // Row Style (General Text, Thin Borders)
            CellStyle rowStyle = workbook.createCellStyle();
            rowStyle.setBorderBottom(BorderStyle.THIN);
            rowStyle.setBorderTop(BorderStyle.THIN);
            rowStyle.setBorderLeft(BorderStyle.THIN);
            rowStyle.setBorderRight(BorderStyle.THIN);

            // Number/Currency Style (Thousands Separator, Thin Borders)
            CellStyle numberStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            numberStyle.setDataFormat(format.getFormat("#,##0"));
            numberStyle.setBorderBottom(BorderStyle.THIN);
            numberStyle.setBorderTop(BorderStyle.THIN);
            numberStyle.setBorderLeft(BorderStyle.THIN);
            numberStyle.setBorderRight(BorderStyle.THIN);

            // Headers
            String[] headers = {"Mã Sổ", "Tên Khách Hàng", "CMND/CCCD", "Số Dư (VNĐ)", "Kỳ Hạn", "Lãi Suất (%)", "Ngày Mở Sổ", "Ngày Đáo Hạn", "Trạng Thái"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 1;
            for (SoTietKiemDTO dto : list) {
                Row row = sheet.createRow(rowIdx++);
                
                Cell c0 = row.createCell(0); c0.setCellValue(dto.getMaSo()); c0.setCellStyle(rowStyle);
                Cell c1 = row.createCell(1); c1.setCellValue(dto.getKhachHangTen() != null ? dto.getKhachHangTen() : ""); c1.setCellStyle(rowStyle);
                Cell c2 = row.createCell(2); c2.setCellValue(dto.getKhachHangCmnd() != null ? dto.getKhachHangCmnd() : ""); c2.setCellStyle(rowStyle);
                
                // Áp dụng định dạng tiền tệ (Thousands separator) cho cột Số Dư (VNĐ)
                Cell c3 = row.createCell(3); 
                c3.setCellValue(dto.getSoDuHienTai() != null ? dto.getSoDuHienTai().doubleValue() : 0); 
                c3.setCellStyle(numberStyle);
                
                Cell c4 = row.createCell(4); c4.setCellValue(dto.getLoaiTietKiemTen() != null ? dto.getLoaiTietKiemTen() : ""); c4.setCellStyle(rowStyle);
                
                // Áp dụng định dạng số cho cột Lãi suất
                Cell c5 = row.createCell(5); 
                c5.setCellValue(dto.getLaiSuatMoSo() != null ? dto.getLaiSuatMoSo().doubleValue() : 0); 
                c5.setCellStyle(numberStyle);
                
                Cell c6 = row.createCell(6); c6.setCellValue(dto.getNgayMo() != null ? dto.getNgayMo().toString() : ""); c6.setCellStyle(rowStyle);
                Cell c7 = row.createCell(7); c7.setCellValue(dto.getNgayDaoHan() != null ? dto.getNgayDaoHan().toString() : ""); c7.setCellStyle(rowStyle);
                
                String trangThaiStr = "Đang hoạt động";
                if ("da_tat_toan".equals(dto.getTrangThai())) trangThaiStr = "Đã tất toán";
                Cell c8 = row.createCell(8); c8.setCellValue(trangThaiStr); c8.setCellStyle(rowStyle);
            }

            // Auto-fit columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            
            HttpHeaders resHeaders = new HttpHeaders();
            resHeaders.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            resHeaders.setContentDispositionFormData("attachment", "danh_sach_so_tiet_kiem.xlsx");

            return ResponseEntity.ok()
                    .headers(resHeaders)
                    .body(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xuất file Excel", e);
        }
    }

    /** Tìm kiếm theo mã sổ, tên KH hoặc CMND (BM4) */
    @GetMapping("/tim-kiem")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> timKiem(@RequestParam String q) {
        List<SoTietKiemDTO> list = soTietKiemService.timKiem(q);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Chi tiết 1 sổ */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
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
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien') or (hasRole('ROLE_khach_hang') and #khachHangId == authentication.principal.nguoiDungId)")
    public ResponseEntity<ApiResponse<List<SoTietKiemDTO>>> layTheoKhachHang(@PathVariable Integer khachHangId) {
        List<SoTietKiemDTO> list = soTietKiemService.laySoTheoKhachHang(khachHangId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** Gởi thêm tiền (BM2, QĐ2) – Admin + Giao Dịch Viên */
    @PutMapping("/gui-them/{id}")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> guiThemTien(@PathVariable Integer id,
                                                       @RequestParam BigDecimal soTien) {
        try {
            Object result = phieuGoiService.thucHienGuiTien(id, soTien);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Tính toán rút tiền DRY-RUN — không ghi DB, chỉ trả về kết quả ước tính */
    @GetMapping("/{id}/tinh-toan-rut")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> tinhToanRut(@PathVariable Integer id) {
        try {
            var result = phieuRutService.tinhToanRutThuan(id);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Rút tiền (BM3, QĐ3) – Admin + Giao Dịch Viên */
    @PostMapping("/rut-tien/{id}")
    @PreAuthorize("hasAnyRole('ROLE_quan_tri_vien', 'ROLE_giao_dich_vien')")
    public ResponseEntity<ApiResponse<?>> rutTien(@PathVariable Integer id,
                                                   @RequestParam BigDecimal soTien) {
        try {
            Object result = phieuRutService.thucHienRutTien(id, soTien);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }

    /** Xoá sổ – chỉ được xoá sổ đã tất toán. Chỉ Admin */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_quan_tri_vien')")
    public ResponseEntity<ApiResponse<String>> xoaSo(@PathVariable Integer id) {
        try {
            soTietKiemService.xoaSo(id);
            return ResponseEntity.ok(ApiResponse.success("Đã xoá sổ tiết kiệm thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
    }
}