package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import com.example.BE_SmartSaving.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * QĐ3 – Quy tắc rút tiền:
 *
 * Không kỳ hạn (kyHanThang = 0):
 *   - Gởi > 15 ngày mới được rút.
 *   - Được rút số tiền ≤ số dư hiện có (rút một phần).
 *   - Lãi = SoDu × laiSuatNam × soNgay / 365.
 *
 * Có kỳ hạn (kyHanThang > 0):
 *   - Phải rút HẾT (tất toán toàn bộ).
 *   - Nếu rút ĐÚNG HẠN hoặc SAU HẠN:
 *       Lãi = SoDu × laiSuatMoSo × soNgay / 365.
 *   - Nếu rút TRƯỚC HẠN:
 *       Lãi = SoDu × laiSuatKhongKyHan × soNgay / 365.
 *   - Sổ tự động đóng sau khi tất toán.
 */
@Service
public class PhieuRutService {

    @Autowired
    private PhieuRutRepository phieuRutRepository;

    // Dùng SoTietKiemRepository trực tiếp để tránh dependency cycle với SoTietKiemService
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;

    @Autowired
    private LoaiTietKiemService loaiTietKiemService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;
    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Transactional
    public PhieuRut thucHienRutTien(Integer soTietKiemId, BigDecimal soTienRut) {
        // Lấy Entity trực tiếp từ Repository (không qua SoTietKiemService vì nay trả DTO)
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        if (stk.getTrangThai() == SoTietKiem.TrangThaiEnum.da_tat_toan) {
            throw new RuntimeException("Sổ đã đóng, không thể rút tiền!");
        }

        // Lấy LoaiTietKiem Entity (dùng layTheoIdEntity để lấy Entity thật, không DTO)
        LoaiTietKiem loai = loaiTietKiemService.layTheoIdEntity(stk.getLoaiTietKiem().getId());
        LocalDate homNay = LocalDate.now();
        long soNgayGui = ChronoUnit.DAYS.between(stk.getNgayMo(), homNay);
        BigDecimal soDuHienTai = stk.getSoDuHienTai();

        BigDecimal laiSuatApDung;
        boolean tatToan;
        BigDecimal soTienRutThucTe;

        int soNgayToiThieu = thamSoService.layThoiGianGuiToiThieu();
        if (soNgayGui < soNgayToiThieu) {
            throw new RuntimeException("Chưa đủ " + soNgayToiThieu + " ngày để rút tiền! (Đã gởi " + soNgayGui + " ngày)");
        }

        if (loai.getKyHanThang() == 0) {
            // ── Không kỳ hạn ─────────────────────────────────────────────
            if (soTienRut.compareTo(soDuHienTai) > 0) {
                throw new RuntimeException("Số dư không đủ! Số dư hiện tại: " + soDuHienTai);
            }
            laiSuatApDung = loai.getLaiSuatNam();
            soTienRutThucTe = soTienRut;
            tatToan = soTienRut.compareTo(soDuHienTai) == 0;

        } else {
            // ── Có kỳ hạn (3 tháng, 6 tháng...) ──────────────────────────
            soTienRutThucTe = soDuHienTai;
            tatToan = true;

            boolean daQuaHan = stk.getNgayDaoHan() != null
                    && !homNay.isBefore(stk.getNgayDaoHan());

            if (daQuaHan) {
                // Đúng hạn hoặc sau hạn → dùng lãi suất hợp đồng
                laiSuatApDung = stk.getLaiSuatMoSo();
            } else {
                // Rút trước hạn → dùng lãi suất không kỳ hạn (QĐ3)
                laiSuatApDung = loaiTietKiemService.layKhongKyHan().getLaiSuatNam();
            }
        }

        // Tính tiền lãi: Lãi = SoDu × laiSuat × soNgay / 365
        BigDecimal tienLai = soDuHienTai
                .multiply(laiSuatApDung)
                .multiply(BigDecimal.valueOf(soNgayGui))
                .divide(BigDecimal.valueOf(365), 0, RoundingMode.HALF_UP);

        // Cập nhật số dư sổ
        BigDecimal soDuTruoc = stk.getSoDuHienTai();
        BigDecimal soDuSau = soDuHienTai.subtract(soTienRutThucTe);
        stk.setSoDuHienTai(soDuSau);
        if (tatToan) {
            stk.setTrangThai(SoTietKiem.TrangThaiEnum.da_tat_toan);
        }
        soTietKiemRepository.save(stk);

        // Tạo phiếu rút
        String email = SecurityUtils.getCurrentUserEmail();
        NguoiDung nhanVien = null;
        if (email != null) {
            TaiKhoan tk = taiKhoanRepository.findByEmail(email).orElse(null);
            if (tk != null) {
                nhanVien = tk.getNguoiDung();
            }
        }
        if (nhanVien == null) {
            throw new RuntimeException("Không xác định được nhân viên thực hiện (vui lòng đăng nhập).");
        }

        PhieuRut pr = new PhieuRut();
        pr.setMaPhieu("PR" + homNay.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + System.currentTimeMillis() % 10000);
        pr.setSoTietKiem(stk);
        pr.setNhanVien(nhanVien);
        pr.setSoTienRut(soTienRutThucTe);
        pr.setTienLaiTinh(tienLai);
        pr.setLaiSuatApDung(laiSuatApDung);
        pr.setNgayRut(homNay);
        pr.setTatToan(tatToan);
        pr.setGhiChu(tatToan ? "Tất toán sổ" : "Rút một phần");
        PhieuRut saved = phieuRutRepository.save(pr);

        // Ghi audit trail
        LichSuGiaoDich.LoaiGiaoDichEnum loaiGD = tatToan
                ? LichSuGiaoDich.LoaiGiaoDichEnum.tat_toan
                : LichSuGiaoDich.LoaiGiaoDichEnum.rut_tien;
        lichSuGiaoDichService.ghi(stk,
                loaiGD,
                soTienRutThucTe.negate(), // tiền ra → âm
                soDuTruoc,
                soDuSau,
                "Rút tiền – Phiếu " + saved.getMaPhieu()
                        + " | Lãi: " + tienLai
                        + " | LS: " + laiSuatApDung);

        return saved;
    }

    /**
     * Tính toán rút tiền (DRY-RUN) — không ghi DB, chỉ trả về kết quả tính toán.
     * Dùng cho frontend hiển thị preview trước khi Teller xác nhận.
     * Endpoint: GET /api/sotietkiem/{id}/tinh-toan-rut
     */
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public com.example.BE_SmartSaving.dto.TinhToanRutDTO tinhToanRutThuan(Integer soTietKiemId) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        if (stk.getTrangThai() == SoTietKiem.TrangThaiEnum.da_tat_toan) {
            return com.example.BE_SmartSaving.dto.TinhToanRutDTO.builder()
                    .soTietKiemId(soTietKiemId)
                    .coTheRut(false)
                    .lyDoKhongDuocRut("Sổ đã tất toán, không thể rút tiền!")
                    .build();
        }

        LoaiTietKiem loai = loaiTietKiemService.layTheoIdEntity(stk.getLoaiTietKiem().getId());
        LocalDate homNay = LocalDate.now();
        long soNgayGui = ChronoUnit.DAYS.between(stk.getNgayMo(), homNay);
        BigDecimal soDuHienTai = stk.getSoDuHienTai();

        BigDecimal laiSuatApDung;
        boolean rutTruocHan = false;
        boolean coTheRut = true;
        String lyDo = null;

        int soNgayToiThieu = thamSoService.layThoiGianGuiToiThieu();
        if (soNgayGui < soNgayToiThieu) {
            coTheRut = false;
            lyDo = "Chưa đủ " + soNgayToiThieu + " ngày để rút tiền! (Đã gởi " + soNgayGui + " ngày)";
        }

        if (loai.getKyHanThang() == 0) {
            // Không kỳ hạn
            laiSuatApDung = loai.getLaiSuatNam();
        } else {
            // Có kỳ hạn
            boolean daQuaHan = stk.getNgayDaoHan() != null && !homNay.isBefore(stk.getNgayDaoHan());
            if (daQuaHan) {
                laiSuatApDung = stk.getLaiSuatMoSo();
            } else {
                laiSuatApDung = loaiTietKiemService.layKhongKyHan().getLaiSuatNam();
                rutTruocHan = true;
            }
        }

        // Tính tiền lãi
        BigDecimal tienLai = soDuHienTai
                .multiply(laiSuatApDung)
                .multiply(BigDecimal.valueOf(soNgayGui))
                .divide(BigDecimal.valueOf(365), 0, java.math.RoundingMode.HALF_UP);

        BigDecimal tongThucNhan = soDuHienTai.add(tienLai);

        return com.example.BE_SmartSaving.dto.TinhToanRutDTO.builder()
                .soTietKiemId(soTietKiemId)
                .soTienGoc(soDuHienTai)
                .soNgayGui(soNgayGui)
                .laiSuatApDung(laiSuatApDung)
                .rutTruocHan(rutTruocHan)
                .tienLai(tienLai)
                .tongThucNhan(tongThucNhan)
                .coTheRut(coTheRut)
                .lyDoKhongDuocRut(lyDo)
                .ngayDaoHan(stk.getNgayDaoHan() != null ? stk.getNgayDaoHan().toString() : null)
                .loaiKyHan(loai.getTenLoai())
                .build();
    }
}