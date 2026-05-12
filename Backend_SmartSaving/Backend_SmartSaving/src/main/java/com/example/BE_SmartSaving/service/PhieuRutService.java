package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
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
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;
    @Autowired
    private LoaiTietKiemService loaiTietKiemService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;
    @Autowired
    private ThamSoService thamSoService;

    @Transactional
    public PhieuRut thucHienRutTien(Integer soTietKiemId, BigDecimal soTienRut) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        if (stk.getTrangThai() == SoTietKiem.TrangThaiEnum.da_tat_toan) {
            throw new RuntimeException("Sổ đã đóng, không thể rút tiền!");
        }

        LoaiTietKiem loai = stk.getLoaiTietKiem();
        LocalDate homNay = LocalDate.now();
        long soNgayGui = ChronoUnit.DAYS.between(stk.getNgayMo(), homNay);
        BigDecimal soDuHienTai = stk.getSoDuHienTai();

        BigDecimal laiSuatApDung;
        boolean tatToan;
        BigDecimal soTienRutThucTe;

        if (loai.getKyHanThang() == 0) {
            // ── Không kỳ hạn ─────────────────────────────────────────────
            int soNgayToiThieu = thamSoService.layThoiGianGuiToiThieu();
            if (soNgayGui < soNgayToiThieu) {
                throw new RuntimeException(
                        "Chưa đủ " + soNgayToiThieu + " ngày để rút tiền!");
            }
            if (soTienRut.compareTo(soDuHienTai) > 0) {
                throw new RuntimeException("Số dư không đủ! Số dư hiện tại: " + soDuHienTai);
            }
            laiSuatApDung = loai.getLaiSuatNam();
            soTienRutThucTe = soTienRut;
            tatToan = soTienRut.compareTo(soDuHienTai) == 0;

        } else {
            // ── Có kỳ hạn (3 tháng, 6 tháng...) ──────────────────────────
            // Bắt buộc rút hết toàn bộ
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
        PhieuRut pr = new PhieuRut();
        pr.setMaPhieu("PR" + homNay.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + System.currentTimeMillis() % 10000);
        pr.setSoTietKiem(stk);
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
}