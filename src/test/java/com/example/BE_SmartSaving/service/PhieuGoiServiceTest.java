package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import com.example.BE_SmartSaving.security.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PhieuGoiService – Unit Tests")
class PhieuGoiServiceTest {

    @Mock private PhieuGoiRepository phieuGoiRepository;
    @Mock private SoTietKiemRepository soTietKiemRepository;
    @Mock private ThamSoService thamSoService;
    @Mock private LichSuGiaoDichService lichSuGiaoDichService;
    @Mock private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private PhieuGoiService phieuGoiService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    private SoTietKiem soKhongKyHan;
    private SoTietKiem soCoKyHan;
    private LoaiTietKiem loaiKhongKyHan;
    private LoaiTietKiem loaiBaThang;
    private NguoiDung nhanVien;
    private TaiKhoan taiKhoan;

    @BeforeEach
    void setUp() {
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail)
                .thenReturn("nhanvien@bank.com");

        nhanVien = new NguoiDung();
        nhanVien.setId(2);
        nhanVien.setHoTen("Tran Thi B");

        taiKhoan = new TaiKhoan();
        taiKhoan.setEmail("nhanvien@bank.com");
        taiKhoan.setNguoiDung(nhanVien);

        loaiKhongKyHan = new LoaiTietKiem();
        loaiKhongKyHan.setId(1);
        loaiKhongKyHan.setKyHanThang(0);
        loaiKhongKyHan.setLaiSuatNam(new BigDecimal("0.0050"));
        loaiKhongKyHan.setDangApDung(true);

        loaiBaThang = new LoaiTietKiem();
        loaiBaThang.setId(2);
        loaiBaThang.setKyHanThang(3);
        loaiBaThang.setLaiSuatNam(new BigDecimal("0.0500"));
        loaiBaThang.setDangApDung(true);

        soKhongKyHan = new SoTietKiem();
        soKhongKyHan.setId(1);
        soKhongKyHan.setMaSo("STK20260101001");
        soKhongKyHan.setLoaiTietKiem(loaiKhongKyHan);
        soKhongKyHan.setSoDuHienTai(new BigDecimal("5000000"));
        soKhongKyHan.setNgayMo(LocalDate.now().minusDays(30));
        soKhongKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);

        // Sổ 3 tháng đang trong đầu kỳ hạn (có thể gởi)
        soCoKyHan = new SoTietKiem();
        soCoKyHan.setId(2);
        soCoKyHan.setMaSo("STK20260101002");
        soCoKyHan.setLoaiTietKiem(loaiBaThang);
        soCoKyHan.setSoDuHienTai(new BigDecimal("5000000"));
        soCoKyHan.setNgayMo(LocalDate.now()); // mở hôm nay → kỳ đầu tiên
        soCoKyHan.setNgayDaoHan(LocalDate.now().plusMonths(3));
        soCoKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityUtils.close();
    }

    // ─── thucHienGuiTien – happy path ─────────────────────────────────────────

    @Test
    @DisplayName("guiTien: sổ hợp lệ, soTien >= min → tạo phiếu thành công")
    void guiTien_hopLe_taoPhieuThanhCong() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));

        PhieuGoi phieu = new PhieuGoi();
        phieu.setId(1);
        phieu.setMaPhieu("PG20260101001");
        when(phieuGoiRepository.save(any())).thenReturn(phieu);
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuGoi result = phieuGoiService.thucHienGuiTien(1, new BigDecimal("500000"));

        assertThat(result).isNotNull();
        assertThat(result.getMaPhieu()).startsWith("PG");

        // Số dư phải tăng đúng
        assertThat(soKhongKyHan.getSoDuHienTai())
                .isEqualByComparingTo("5500000");
        verify(soTietKiemRepository).save(soKhongKyHan);
        verify(lichSuGiaoDichService).ghi(any(),
                eq(LichSuGiaoDich.LoaiGiaoDichEnum.goi_them),
                eq(new BigDecimal("500000")),
                eq(new BigDecimal("5000000")),
                eq(new BigDecimal("5500000")),
                anyString());
    }

    // ─── thucHienGuiTien – validation ─────────────────────────────────────────

    @Test
    @DisplayName("guiTien: sổ không tồn tại → throw RuntimeException")
    void guiTien_soKhongTonTai_throwException() {
        when(soTietKiemRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> phieuGoiService.thucHienGuiTien(99, new BigDecimal("500000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("không tồn tại");
    }

    @Test
    @DisplayName("guiTien: sổ đã tất toán → throw RuntimeException")
    void guiTien_soDaTatToan_throwException() {
        soKhongKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.da_tat_toan);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));

        assertThatThrownBy(() -> phieuGoiService.thucHienGuiTien(1, new BigDecimal("500000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đã đóng");
    }

    @Test
    @DisplayName("guiTien: soTien < min → throw RuntimeException")
    void guiTien_soTienDuoiMin_throwException() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));

        assertThatThrownBy(() -> phieuGoiService.thucHienGuiTien(1, new BigDecimal("50000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("tối thiểu");

        verify(soTietKiemRepository, never()).save(any());
    }

    @Test
    @DisplayName("guiTien: chưa đăng nhập → throw RuntimeException")
    void guiTien_chuaDangNhap_throwException() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail).thenReturn(null);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));

        assertThatThrownBy(() -> phieuGoiService.thucHienGuiTien(1, new BigDecimal("500000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đăng nhập");
    }

    // ─── kiemTraDieuKienKyHan ─────────────────────────────────────────────────

    @Test
    @DisplayName("guiTien: sổ có kỳ hạn, gởi trong ngày mở → hợp lệ (đầu kỳ)")
    void guiTien_coKyHan_goiDauKy_hopLe() {
        // ngayMo = hôm nay, đang trong window 2 ngày đầu kỳ
        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));

        PhieuGoi phieu = new PhieuGoi();
        phieu.setId(1);
        phieu.setMaPhieu("PG20260101002");
        when(phieuGoiRepository.save(any())).thenReturn(phieu);
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        assertThatCode(() -> phieuGoiService.thucHienGuiTien(2, new BigDecimal("500000")))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("guiTien: sổ có kỳ hạn, gởi giữa kỳ → throw RuntimeException")
    void guiTien_coKyHan_goiGiuaKy_throwException() {
        // ngayMo = 45 ngày trước (giữa kỳ 3 tháng)
        soCoKyHan.setNgayMo(LocalDate.now().minusDays(45));
        soCoKyHan.setNgayDaoHan(LocalDate.now().minusDays(45).plusMonths(3));

        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));

        assertThatThrownBy(() -> phieuGoiService.thucHienGuiTien(2, new BigDecimal("500000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("kỳ hạn");
    }

    @Test
    @DisplayName("guiTien: maPhieu sinh đúng format PG + ngay")
    void guiTien_maPhieuDungFormat() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(thamSoService.laySoTienGuiThemToiThieu()).thenReturn(new BigDecimal("100000"));
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuGoiRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuGoi result = phieuGoiService.thucHienGuiTien(1, new BigDecimal("500000"));

        assertThat(result.getMaPhieu()).startsWith("PG");
        assertThat(result.getMaPhieu()).contains(
                LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")));
    }
}