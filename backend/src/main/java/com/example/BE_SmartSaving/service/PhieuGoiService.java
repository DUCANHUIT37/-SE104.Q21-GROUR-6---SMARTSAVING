package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import com.example.BE_SmartSaving.security.SecurityUtils;
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

    // Dùng SoTietKiemRepository trực tiếp để tránh dependency cycle
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;

    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Transactional
    public PhieuGoi thucHienGuiTien(Integer soTietKiemId, BigDecimal soTienGoi) {
        // Lấy Entity trực tiếp từ Repository (không qua SoTietKiemService vì nay trả DTO)
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
        LoaiTietKiem loai = stk.getLoaiTietKiem();
        if (loai.getKyHanThang() > 0) {
            kiemTraDieuKienKyHan(stk, loai);
        }

        // 4. Cập nhật số dư
        BigDecimal soDuTruoc = stk.getSoDuHienTai();
        stk.setSoDuHienTai(soDuTruoc.add(soTienGoi));
        soTietKiemRepository.save(stk);

        // 5. Tạo phiếu gởi
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

        PhieuGoi pg = new PhieuGoi();
        pg.setMaPhieu("PG" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + System.currentTimeMillis() % 10000);
        pg.setSoTietKiem(stk);
        pg.setNhanVien(nhanVien);
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
     */
    private void kiemTraDieuKienKyHan(SoTietKiem stk, LoaiTietKiem loai) {
        LocalDate homNay = LocalDate.now();
        LocalDate ngayMo = stk.getNgayMo();
        int kyHan = loai.getKyHanThang();

        long thangDaGui = java.time.temporal.ChronoUnit.MONTHS.between(ngayMo, homNay);
        long kyHienTai = thangDaGui / kyHan;
        LocalDate ngayBatDauKyMoi = ngayMo.plusMonths(kyHienTai * kyHan);

        if (homNay.isBefore(ngayBatDauKyMoi) ||
                homNay.isAfter(ngayBatDauKyMoi.plusDays(2))) {
            throw new RuntimeException(
                    "Chưa đến kỳ hạn gởi tiền! Có thể gởi thêm từ ngày: "
                            + ngayBatDauKyMoi.plusMonths(kyHan));
        }
    }
}