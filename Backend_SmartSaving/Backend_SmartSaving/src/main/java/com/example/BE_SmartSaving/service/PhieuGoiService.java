package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PhieuGoiService {

    @Autowired
    private PhieuGoiRepository phieuGoiRepository;
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;
    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;

    @Transactional
    public PhieuGoi thucHienGuiTien(Integer soTietKiemId, BigDecimal soTienGoi) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        // 1. Sổ phải đang hoạt động
        if (stk.getTrangThai() == SoTietKiem.TrangThaiEnum.da_tat_toan) {
            throw new RuntimeException("Sổ đã đóng, không thể gởi thêm tiền!");
        }

        // 2. Kiểm tra số tiền tối thiểu (QĐ2)
        BigDecimal min = thamSoService.laySoTienGuiThemToiThieu();
        if (soTienGoi.compareTo(min) < 0) {
            throw new RuntimeException(
                    "Số tiền gởi thêm tối thiểu phải là " + min + " VNĐ");
        }

        // 3. Kiểm tra điều kiện kỳ hạn (QĐ2)
        //    Không kỳ hạn (kyHanThang = 0): luôn cho gởi
        //    Có kỳ hạn: chỉ nhận gởi khi đến ngày đáo hạn của kỳ hiện tại
        LoaiTietKiem loai = stk.getLoaiTietKiem();
        if (loai.getKyHanThang() > 0) {
            kiemTraDieuKienKyHan(stk, loai);
        }

        // 4. Cập nhật số dư
        BigDecimal soDuTruoc = stk.getSoDuHienTai();
        stk.setSoDuHienTai(soDuTruoc.add(soTienGoi));
        soTietKiemRepository.save(stk);

        // 5. Tạo phiếu gởi
        PhieuGoi pg = new PhieuGoi();
        pg.setMaPhieu("PG" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + System.currentTimeMillis() % 10000);
        pg.setSoTietKiem(stk);
        pg.setSoTienGoi(soTienGoi);
        pg.setNgayGoi(LocalDate.now());
        PhieuGoi saved = phieuGoiRepository.save(pg);

        // 6. Ghi audit trail
        lichSuGiaoDichService.ghi(stk,
                LichSuGiaoDich.LoaiGiaoDichEnum.goi_them,
                soTienGoi,
                soDuTruoc,
                stk.getSoDuHienTai(),
                "Gởi thêm tiền – Phiếu " + saved.getMaPhieu());

        return saved;
    }

    /**
     * Kiểm tra xem hôm nay có phải ngày được phép gởi thêm không.
     * Quy tắc: chỉ gởi vào ngày bắt đầu kỳ mới (sau mỗi kyHanThang tháng kể từ ngayMo).
     * Cho phép gởi trong vòng 1 ngày (dung sai) để tránh strict.
     */
    private void kiemTraDieuKienKyHan(SoTietKiem stk, LoaiTietKiem loai) {
        LocalDate homNay = LocalDate.now();
        LocalDate ngayMo = stk.getNgayMo();
        int kyHan = loai.getKyHanThang();

        // Tính kỳ số mấy hiện tại
        long thangDaGui = java.time.temporal.ChronoUnit.MONTHS.between(ngayMo, homNay);
        long kyHienTai = thangDaGui / kyHan;

        // Ngày bắt đầu kỳ tiếp theo
        LocalDate ngayBatDauKyMoi = ngayMo.plusMonths(kyHienTai * kyHan);

        // Cho phép gởi vào đúng ngày bắt đầu kỳ mới (trong vòng 3 ngày dung sai)
        if (homNay.isBefore(ngayBatDauKyMoi) ||
                homNay.isAfter(ngayBatDauKyMoi.plusDays(2))) {
            throw new RuntimeException(
                    "Chưa đến kỳ hạn gởi tiền! Có thể gởi thêm từ ngày: "
                            + ngayBatDauKyMoi.plusMonths(kyHan));
        }
    }
}