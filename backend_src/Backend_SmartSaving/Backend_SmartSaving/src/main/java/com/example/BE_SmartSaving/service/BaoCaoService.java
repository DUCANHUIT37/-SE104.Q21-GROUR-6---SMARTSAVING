package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.BaoCaoNgayDTO;
import com.example.BE_SmartSaving.dto.BaoCaoThangDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.repository.LoaiTietKiemRepository;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class BaoCaoService {

    @Autowired
    private LoaiTietKiemRepository loaiTietKiemRepository;
    @Autowired
    private PhieuGoiRepository phieuGoiRepository;
    @Autowired
    private PhieuRutRepository phieuRutRepository;
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;
    @Autowired
    private com.example.BE_SmartSaving.repository.NguoiDungRepository nguoiDungRepository;

    // ─── BM5.1: Báo Cáo Doanh Số Hoạt Động Ngày ────────────────────────
    
    /**
     * Tổng hợp thu chi trong ngày, phân theo loại tiết kiệm.
     * TổngThu = tiền mở sổ mới + tiền gởi thêm trong ngày.
     * TổngChi = tiền rút ra trong ngày.
     */
    public List<BaoCaoNgayDTO> lapBaoCaoDoanhSoNgay(LocalDate ngayBaoCao) {
        List<BaoCaoNgayDTO> danhSach = new ArrayList<>();

        for (LoaiTietKiem loai : loaiTietKiemRepository.findAll()) {
            BaoCaoNgayDTO dto = new BaoCaoNgayDTO();
            dto.setTenLoaiTietKiem(loai.getTenLoai());

            // Thu: tiền mở sổ mới + tiền gởi thêm trong ngày
            BigDecimal thuMoSo = phieuGoiRepository
                    .tinhTongMoSoTheoLoaiVaNgay(loai.getId(), ngayBaoCao);
            BigDecimal thuGoiThem = phieuGoiRepository
                    .tinhTongThuTheoLoaiVaNgay(loai.getId(), ngayBaoCao);
            BigDecimal tongThu = thuMoSo.add(thuGoiThem);

            // Chi: tiền rút ra trong ngày
            BigDecimal tongChi = phieuRutRepository
                    .tinhTongChiTheoLoaiVaNgay(loai.getId(), ngayBaoCao);

            dto.setTongThu(tongThu);
            dto.setTongChi(tongChi);
            dto.setChenhLech(tongThu.subtract(tongChi));

            danhSach.add(dto);
        }
        return danhSach;
    }

    // ─── BM5.2: Báo Cáo Mở/Đóng Sổ Tháng ──────────────────────────────

    /**
     * Thống kê số sổ mở và đóng mỗi ngày trong tháng, theo từng loại tiết kiệm.
     *
     * @param thang Tháng cần báo cáo (ví dụ: YearMonth.of(2026, 5))
     * @param loaiId ID loại tiết kiệm (null = tất cả loại)
     */
    public List<BaoCaoThangDTO> lapBaoCaoMoDongSoThang(YearMonth thang, Integer loaiId) {
        List<BaoCaoThangDTO> danhSach = new ArrayList<>();

        List<LoaiTietKiem> danhSachLoai = (loaiId != null)
                ? List.of(loaiTietKiemRepository.findById(loaiId)
                          .orElseThrow(() -> new RuntimeException("Không tìm thấy loại TK")))
                : loaiTietKiemRepository.findAll();

        for (LoaiTietKiem loai : danhSachLoai) {
            // Duyệt từng ngày trong tháng
            int soNgayTrongThang = thang.lengthOfMonth();
            for (int ngay = 1; ngay <= soNgayTrongThang; ngay++) {
                LocalDate ngayHienTai = thang.atDay(ngay);

                long soSoMo = soTietKiemRepository
                        .demSoMoTheoLoaiVaNgay(loai.getId(), ngayHienTai);
                long soSoDong = phieuRutRepository
                        .demSoDongTheoLoaiVaNgay(loai.getId(), ngayHienTai);

                if (soSoMo > 0 || soSoDong > 0) { // Chỉ thêm ngày có phát sinh
                    BaoCaoThangDTO dto = new BaoCaoThangDTO();
                    dto.setTenLoaiTietKiem(loai.getTenLoai());
                    dto.setNgay(ngayHienTai);
                    dto.setSoSoMo(soSoMo);
                    dto.setSoSoDong(soSoDong);
                    dto.setChenhLech(soSoMo - soSoDong);
                    danhSach.add(dto);
                }
            }
        }
        return danhSach;
    }

    // ─── TỔNG QUAN DASHBOARD ──────────────────────────────
    public com.example.BE_SmartSaving.dto.TongQuanDTO layTongQuan() {
        long tongSoTietKiem = soTietKiemRepository.count();
        long tongKhachHang = nguoiDungRepository.findByLoaiNguoiDung(com.example.BE_SmartSaving.model.NguoiDung.LoaiNguoiDungEnum.ROLE_USER).size();
        BigDecimal tongSoDu = soTietKiemRepository.sumSoDuHienTai();
        
        LocalDate today = LocalDate.now();
        BigDecimal thuGoiThem = phieuGoiRepository.tinhTongThuGoiThemTrongNgay(today);
        BigDecimal thuMoSo = phieuGoiRepository.tinhTongThuMoSoTrongNgay(today);
        BigDecimal doanhThuHomNay = thuGoiThem.add(thuMoSo);
        
        return com.example.BE_SmartSaving.dto.TongQuanDTO.builder()
                .tongKhachHang(tongKhachHang)
                .tongSoTietKiem(tongSoTietKiem)
                .tongSoDu(tongSoDu)
                .doanhThuHomNay(doanhThuHomNay)
                .build();
    }
}