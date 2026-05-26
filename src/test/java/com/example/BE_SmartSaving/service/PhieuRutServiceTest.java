package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PhieuRutService – Unit Tests (QĐ3)")
class PhieuRutServiceTest {

    @Mock private PhieuRutRepository phieuRutRepository;
    @Mock private SoTietKiemRepository soTietKiemRepository;
    @Mock private LoaiTietKiemService loaiTietKiemService;
    @Mock private LichSuGiaoDichService lichSuGiaoDichService;
    @Mock private ThamSoService thamSoService;
    @Mock private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private PhieuRutService phieuRutService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    private NguoiDung nhanVien;
    private TaiKhoan taiKhoan;
    private LoaiTietKiem loaiKhongKyHan;
    private LoaiTietKiem loaiBaThang;
    private SoTietKiem soKhongKyHan;
    private SoTietKiem soCoKyHan;

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

        loaiBaThang = new LoaiTietKiem();
        loaiBaThang.setId(2);
        loaiBaThang.setKyHanThang(3);
        loaiBaThang.setLaiSuatNam(new BigDecimal("0.0500"));

        // Sổ không kỳ hạn – mở 30 ngày trước
        soKhongKyHan = new SoTietKiem();
        soKhongKyHan.setId(1);
        soKhongKyHan.setMaSo("STK20260101001");
        soKhongKyHan.setLoaiTietKiem(loaiKhongKyHan);
        soKhongKyHan.setSoDuHienTai(new BigDecimal("5000000"));
        soKhongKyHan.setLaiSuatMoSo(new BigDecimal("0.0050"));
        soKhongKyHan.setNgayMo(LocalDate.now().minusDays(30));
        soKhongKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);

        // Sổ 3 tháng – mở đúng hạn (ngayDaoHan = hôm nay)
        soCoKyHan = new SoTietKiem();
        soCoKyHan.setId(2);
        soCoKyHan.setMaSo("STK20260101002");
        soCoKyHan.setLoaiTietKiem(loaiBaThang);
        soCoKyHan.setSoDuHienTai(new BigDecimal("10000000"));
        soCoKyHan.setLaiSuatMoSo(new BigDecimal("0.0500"));
        soCoKyHan.setNgayMo(LocalDate.now().minusMonths(3));
        soCoKyHan.setNgayDaoHan(LocalDate.now()); // đúng hạn hôm nay
        soCoKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityUtils.close();
    }

    // ─── Validation: sổ ──────────────────────────────────────────────────────

    @Test
    @DisplayName("rutTien: sổ không tồn tại → throw RuntimeException")
    void rutTien_soKhongTonTai_throwException() {
        when(soTietKiemRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> phieuRutService.thucHienRutTien(99, new BigDecimal("1000000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("không tồn tại");
    }

    @Test
    @DisplayName("rutTien: sổ đã tất toán → throw RuntimeException")
    void rutTien_soDaTatToan_throwException() {
        soKhongKyHan.setTrangThai(SoTietKiem.TrangThaiEnum.da_tat_toan);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));

        assertThatThrownBy(() -> phieuRutService.thucHienRutTien(1, new BigDecimal("1000000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đã đóng");
    }

    @Test
    @DisplayName("rutTien: chưa đăng nhập → throw RuntimeException")
    void rutTien_chuaDangNhap_throwException() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail).thenReturn(null);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);

        assertThatThrownBy(() -> phieuRutService.thucHienRutTien(1, new BigDecimal("1000000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đăng nhập");
    }

    // ─── Không kỳ hạn – validation ───────────────────────────────────────────

    @Test
    @DisplayName("rutTien [KKH]: chưa đủ 15 ngày → throw RuntimeException")
    void rutTien_khongKyHan_chuaDu15Ngay_throwException() {
        soKhongKyHan.setNgayMo(LocalDate.now().minusDays(10)); // mới 10 ngày
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);

        assertThatThrownBy(() -> phieuRutService.thucHienRutTien(1, new BigDecimal("1000000")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("15");
    }

    @Test
    @DisplayName("rutTien [KKH]: soTienRut > soDu → throw RuntimeException")
    void rutTien_khongKyHan_soTienRutVuotSoDu_throwException() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);

        assertThatThrownBy(() -> phieuRutService.thucHienRutTien(1, new BigDecimal("9999999")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Số dư không đủ");
    }

    // ─── Không kỳ hạn – rút một phần ────────────────────────────────────────

    @Test
    @DisplayName("rutTien [KKH]: rút một phần → sổ vẫn mở, soDu giảm đúng")
    void rutTien_khongKyHan_rutMotPhan_soVanMo() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(1, new BigDecimal("1000000"));

        assertThat(result.getTatToan()).isFalse();
        assertThat(soKhongKyHan.getTrangThai()).isEqualTo(SoTietKiem.TrangThaiEnum.dang_hoat_dong);
        assertThat(soKhongKyHan.getSoDuHienTai()).isEqualByComparingTo("4000000");
    }

    // ─── Không kỳ hạn – tất toán ─────────────────────────────────────────────

    @Test
    @DisplayName("rutTien [KKH]: rút hết → sổ tự động đóng (da_tat_toan)")
    void rutTien_khongKyHan_rutHet_soDong() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(1, new BigDecimal("5000000"));

        assertThat(result.getTatToan()).isTrue();
        assertThat(soKhongKyHan.getTrangThai()).isEqualTo(SoTietKiem.TrangThaiEnum.da_tat_toan);
        assertThat(soKhongKyHan.getSoDuHienTai()).isEqualByComparingTo("0");
    }

    // ─── Không kỳ hạn – tính lãi ─────────────────────────────────────────────

    @Test
    @DisplayName("rutTien [KKH]: tienLai = soDu × laiSuatNam × soNgay / 365")
    void rutTien_khongKyHan_tinhLaiDung() {
        // 5.000.000 × 0.0050 × 30 / 365 = 2054 (làm tròn)
        BigDecimal expected = new BigDecimal("5000000")
                .multiply(new BigDecimal("0.0050"))
                .multiply(BigDecimal.valueOf(30))
                .divide(BigDecimal.valueOf(365), 0, RoundingMode.HALF_UP);

        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(1, new BigDecimal("1000000"));

        assertThat(result.getTienLaiTinh()).isEqualByComparingTo(expected);
    }

    // ─── Có kỳ hạn – đúng hạn ────────────────────────────────────────────────

    @Test
    @DisplayName("rutTien [CKH]: đúng hạn → dùng laiSuatMoSo, sổ đóng")
    void rutTien_coKyHan_dungHan_dungLaiSuatHopDong() {
        // ngayDaoHan = hôm nay → daQuaHan = true
        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(2, null);

        assertThat(result.getTatToan()).isTrue();
        assertThat(result.getLaiSuatApDung()).isEqualByComparingTo("0.0500"); // laiSuatMoSo
        assertThat(soCoKyHan.getTrangThai()).isEqualTo(SoTietKiem.TrangThaiEnum.da_tat_toan);
        assertThat(soCoKyHan.getSoDuHienTai()).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("rutTien [CKH]: đúng hạn → tienLai tính theo laiSuatMoSo × soNgay / 365")
    void rutTien_coKyHan_dungHan_tinhLaiDungCong() {
        long soNgay = ChronoUnit.DAYS.between(soCoKyHan.getNgayMo(), LocalDate.now());
        BigDecimal expected = new BigDecimal("10000000")
                .multiply(new BigDecimal("0.0500"))
                .multiply(BigDecimal.valueOf(soNgay))
                .divide(BigDecimal.valueOf(365), 0, RoundingMode.HALF_UP);

        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(2, null);

        assertThat(result.getTienLaiTinh()).isEqualByComparingTo(expected);
    }

    // ─── Có kỳ hạn – trước hạn ───────────────────────────────────────────────

    @Test
    @DisplayName("rutTien [CKH]: trước hạn → dùng laiSuatKhongKyHan (phạt)")
    void rutTien_coKyHan_truocHan_dungLaiSuatKhongKyHan() {
        // Đặt ngayDaoHan về tương lai
        soCoKyHan.setNgayMo(LocalDate.now().minusDays(20));
        soCoKyHan.setNgayDaoHan(LocalDate.now().plusMonths(2)); // chưa đến hạn

        LoaiTietKiem loaiKhongKyHanEntity = new LoaiTietKiem();
        loaiKhongKyHanEntity.setKyHanThang(0);
        loaiKhongKyHanEntity.setLaiSuatNam(new BigDecimal("0.0050"));

        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);
        when(loaiTietKiemService.layKhongKyHan()).thenReturn(loaiKhongKyHanEntity);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(2, null);

        // Lãi suất áp dụng phải là lãi suất không kỳ hạn (phạt)
        assertThat(result.getLaiSuatApDung()).isEqualByComparingTo("0.0050");
        assertThat(result.getTatToan()).isTrue();
    }

    @Test
    @DisplayName("rutTien [CKH]: trước hạn → tienLai tính bằng laiSuat không kỳ hạn")
    void rutTien_coKyHan_truocHan_tinhLaiKhongKyHan() {
        soCoKyHan.setNgayMo(LocalDate.now().minusDays(20));
        soCoKyHan.setNgayDaoHan(LocalDate.now().plusMonths(2));

        LoaiTietKiem loaiKhongKyHanEntity = new LoaiTietKiem();
        loaiKhongKyHanEntity.setLaiSuatNam(new BigDecimal("0.0050"));

        long soNgay = ChronoUnit.DAYS.between(soCoKyHan.getNgayMo(), LocalDate.now());
        BigDecimal expected = new BigDecimal("10000000")
                .multiply(new BigDecimal("0.0050"))
                .multiply(BigDecimal.valueOf(soNgay))
                .divide(BigDecimal.valueOf(365), 0, RoundingMode.HALF_UP);

        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);
        when(loaiTietKiemService.layKhongKyHan()).thenReturn(loaiKhongKyHanEntity);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        PhieuRut result = phieuRutService.thucHienRutTien(2, null);

        assertThat(result.getTienLaiTinh()).isEqualByComparingTo(expected);
    }

    // ─── Audit trail ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("rutTien [KKH]: rút một phần → ghi audit loai rut_tien (không phải tat_toan)")
    void rutTien_motPhan_ghiAuditLoaiRutTien() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soKhongKyHan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(thamSoService.layThoiGianGuiToiThieu()).thenReturn(15);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        phieuRutService.thucHienRutTien(1, new BigDecimal("1000000"));

        verify(lichSuGiaoDichService).ghi(any(),
                eq(LichSuGiaoDich.LoaiGiaoDichEnum.rut_tien),
                any(), any(), any(), anyString());
    }

    @Test
    @DisplayName("rutTien [CKH]: tất toán → ghi audit loai tat_toan")
    void rutTien_tatToan_ghiAuditLoaiTatToan() {
        when(soTietKiemRepository.findById(2)).thenReturn(Optional.of(soCoKyHan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);
        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(phieuRutRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        phieuRutService.thucHienRutTien(2, null);

        verify(lichSuGiaoDichService).ghi(any(),
                eq(LichSuGiaoDich.LoaiGiaoDichEnum.tat_toan),
                any(), any(), any(), anyString());
    }
}