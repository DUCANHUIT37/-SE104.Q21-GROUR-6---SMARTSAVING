package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.SoTietKiemDTO;
import com.example.BE_SmartSaving.model.*;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SoTietKiemService – Unit Tests")
class SoTietKiemServiceTest {

    @Mock private SoTietKiemRepository soTietKiemRepository;
    @Mock private ThamSoService thamSoService;
    @Mock private LoaiTietKiemService loaiTietKiemService;
    @Mock private TaiKhoanRepository taiKhoanRepository;
    @Mock private LichSuGiaoDichService lichSuGiaoDichService;
    @Mock private com.example.BE_SmartSaving.repository.NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private SoTietKiemService soTietKiemService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    private LoaiTietKiem loaiKhongKyHan;
    private LoaiTietKiem loaiBaThang;
    private NguoiDung khachHang;
    private NguoiDung nhanVien;
    private TaiKhoan taiKhoan;
    private SoTietKiem soTietKiem;

    @BeforeEach
    void setUp() {
        // Mock SecurityUtils static method
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail)
                .thenReturn("nhanvien@bank.com");

        khachHang = new NguoiDung();
        khachHang.setId(1);
        khachHang.setHoTen("Nguyen Van A");
        khachHang.setCmnd("123456789");
        khachHang.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);

        nhanVien = new NguoiDung();
        nhanVien.setId(2);
        nhanVien.setHoTen("Tran Thi B");
        nhanVien.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.giao_dich_vien);

        taiKhoan = new TaiKhoan();
        taiKhoan.setId(1);
        taiKhoan.setEmail("nhanvien@bank.com");
        taiKhoan.setNguoiDung(nhanVien);
        taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.giao_dich_vien);

        loaiKhongKyHan = new LoaiTietKiem();
        loaiKhongKyHan.setId(1);
        loaiKhongKyHan.setTenLoai("Không kỳ hạn");
        loaiKhongKyHan.setKyHanThang(0);
        loaiKhongKyHan.setLaiSuatNam(new BigDecimal("0.0050"));
        loaiKhongKyHan.setSoTienGuiToiThieu(new BigDecimal("1000000"));
        loaiKhongKyHan.setDangApDung(true);

        loaiBaThang = new LoaiTietKiem();
        loaiBaThang.setId(2);
        loaiBaThang.setTenLoai("3 tháng");
        loaiBaThang.setKyHanThang(3);
        loaiBaThang.setLaiSuatNam(new BigDecimal("0.0500"));
        loaiBaThang.setSoTienGuiToiThieu(new BigDecimal("1000000"));
        loaiBaThang.setDangApDung(true);

        soTietKiem = new SoTietKiem();
        soTietKiem.setId(1);
        soTietKiem.setMaSo("STK20260101001");
        soTietKiem.setKhachHang(khachHang);
        soTietKiem.setLoaiTietKiem(loaiKhongKyHan);
        soTietKiem.setNhanVienTao(nhanVien);
        soTietKiem.setSoTienBanDau(new BigDecimal("5000000"));
        soTietKiem.setSoDuHienTai(new BigDecimal("5000000"));
        soTietKiem.setLaiSuatMoSo(new BigDecimal("0.0050"));
        soTietKiem.setNgayMo(LocalDate.now());
        soTietKiem.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityUtils.close();
    }

    // ─── toDTO ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("toDTO: null → trả về null")
    void toDTO_null_traVeNull() {
        assertThat(soTietKiemService.toDTO(null)).isNull();
    }

    @Test
    @DisplayName("toDTO: flatten đúng thông tin khachHang và loaiTietKiem")
    void toDTO_entityHopLe_flattenDungThongTin() {
        SoTietKiemDTO dto = soTietKiemService.toDTO(soTietKiem);

        assertThat(dto.getId()).isEqualTo(1);
        assertThat(dto.getMaSo()).isEqualTo("STK20260101001");
        assertThat(dto.getKhachHangId()).isEqualTo(1);
        assertThat(dto.getKhachHangTen()).isEqualTo("Nguyen Van A");
        assertThat(dto.getKhachHangCmnd()).isEqualTo("123456789");
        assertThat(dto.getLoaiTietKiemId()).isEqualTo(1);
        assertThat(dto.getLoaiTietKiemTen()).isEqualTo("Không kỳ hạn");
        assertThat(dto.getSoDuHienTai()).isEqualByComparingTo("5000000");
        assertThat(dto.getTrangThai()).isEqualTo("dang_hoat_dong");
    }

    // ─── moSoTietKiem ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("moSo: loai dangApDung, soTien >= min → mở thành công")
    void moSo_hopLe_moThanhCong() {
        SoTietKiem request = new SoTietKiem();
        request.setKhachHang(khachHang);
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(soTietKiemRepository.save(any())).thenReturn(soTietKiem);
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        SoTietKiemDTO dto = soTietKiemService.moSoTietKiem(request);

        assertThat(dto).isNotNull();
        verify(soTietKiemRepository).save(any(SoTietKiem.class));
        verify(lichSuGiaoDichService).ghi(any(), eq(LichSuGiaoDich.LoaiGiaoDichEnum.mo_so),
                any(), any(), any(), any());
    }

    @Test
    @DisplayName("moSo: loai ngungApDung → throw RuntimeException")
    void moSo_loaiNgungApDung_throwException() {
        loaiKhongKyHan.setDangApDung(false);

        SoTietKiem request = new SoTietKiem();
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);

        assertThatThrownBy(() -> soTietKiemService.moSoTietKiem(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("ngừng áp dụng");
    }

    @Test
    @DisplayName("moSo: soTien < min → throw RuntimeException")
    void moSo_soTienDuoiMin_throwException() {
        SoTietKiem request = new SoTietKiem();
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("500000")); // < 1.000.000

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);

        assertThatThrownBy(() -> soTietKiemService.moSoTietKiem(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("tối thiểu");
    }

    @Test
    @DisplayName("moSo: chưa đăng nhập → throw RuntimeException")
    void moSo_chuaDangNhap_throwException() {
        mockedSecurityUtils.when(SecurityUtils::getCurrentUserEmail).thenReturn(null);

        SoTietKiem request = new SoTietKiem();
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        assertThatThrownBy(() -> soTietKiemService.moSoTietKiem(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đăng nhập");
    }

    @Test
    @DisplayName("moSo: loai co ky han → ngayDaoHan = ngayMo + kyHanThang")
    void moSo_loaiCoKyHan_datNgayDaoHan() {
        SoTietKiem request = new SoTietKiem();
        request.setKhachHang(khachHang);
        request.setLoaiTietKiem(loaiBaThang);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(2)).thenReturn(loaiBaThang);

        when(soTietKiemRepository.save(any())).thenAnswer(inv -> {
            SoTietKiem saved = inv.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        soTietKiemService.moSoTietKiem(request);

        // Kiểm tra ngayDaoHan được gán đúng
        verify(soTietKiemRepository).save(argThat(stk ->
                stk.getNgayDaoHan() != null &&
                        stk.getNgayDaoHan().equals(LocalDate.now().plusMonths(3))
        ));
    }

    @Test
    @DisplayName("moSo: loai khong ky han → ngayDaoHan = null")
    void moSo_loaiKhongKyHan_ngayDaoHanNull() {
        SoTietKiem request = new SoTietKiem();
        request.setKhachHang(khachHang);
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);
        when(soTietKiemRepository.save(any())).thenAnswer(inv -> {
            SoTietKiem saved = inv.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        soTietKiemService.moSoTietKiem(request);

        verify(soTietKiemRepository).save(argThat(stk -> stk.getNgayDaoHan() == null));
    }

    @Test
    @DisplayName("moSo: maSo sinh đúng format STK + ngay + sequence 3 chu so")
    void moSo_maSoSinhDungFormat() {
        SoTietKiem request = new SoTietKiem();
        request.setKhachHang(khachHang);
        request.setLoaiTietKiem(loaiKhongKyHan);
        request.setSoTienBanDau(new BigDecimal("2000000"));

        when(taiKhoanRepository.findByEmail("nhanvien@bank.com")).thenReturn(Optional.of(taiKhoan));
        when(loaiTietKiemService.layTheoIdEntity(1)).thenReturn(loaiKhongKyHan);

        when(soTietKiemRepository.save(any())).thenAnswer(inv -> {
            SoTietKiem saved = inv.getArgument(0);
            saved.setId(1);
            return saved;
        });
        when(lichSuGiaoDichService.ghi(any(), any(), any(), any(), any(), any()))
                .thenReturn(new LichSuGiaoDich());

        soTietKiemService.moSoTietKiem(request);

        String expectedPrefix = "STK" + LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        verify(soTietKiemRepository).save(argThat(stk ->
                stk.getMaSo().startsWith(expectedPrefix) &&
                        stk.getMaSo().length() > 10
        ));
    }

    // ─── laySoTheoId ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("laySoTheoId: tìm thấy → trả về DTO")
    void laySoTheoId_timThay_traVeDTO() {
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soTietKiem));

        SoTietKiemDTO dto = soTietKiemService.laySoTheoId(1);

        assertThat(dto.getId()).isEqualTo(1);
        assertThat(dto.getMaSo()).isEqualTo("STK20260101001");
    }

    @Test
    @DisplayName("laySoTheoId: không tìm thấy → throw RuntimeException")
    void laySoTheoId_khongTimThay_throwException() {
        when(soTietKiemRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> soTietKiemService.laySoTheoId(99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    // ─── xoaSo ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("xoaSo: sổ đã tất toán → xoá thành công")
    void xoaSo_soDaTatToan_xoaThanhCong() {
        soTietKiem.setTrangThai(SoTietKiem.TrangThaiEnum.da_tat_toan);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soTietKiem));

        soTietKiemService.xoaSo(1);

        verify(soTietKiemRepository).deleteById(1);
    }

    @Test
    @DisplayName("xoaSo: sổ đang hoạt động → throw RuntimeException")
    void xoaSo_soDangHoatDong_throwException() {
        soTietKiem.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);
        when(soTietKiemRepository.findById(1)).thenReturn(Optional.of(soTietKiem));

        assertThatThrownBy(() -> soTietKiemService.xoaSo(1))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("đang hoạt động");

        verify(soTietKiemRepository, never()).deleteById(any());
    }

    // ─── layTatCaSo / laySoTheoKhachHang ─────────────────────────────────────

    @Test
    @DisplayName("layTatCaSo: trả về đúng số lượng DTO")
    void layTatCaSo_traVeTatCaDTO() {
        when(soTietKiemRepository.findAll()).thenReturn(List.of(soTietKiem));

        List<SoTietKiemDTO> result = soTietKiemService.layTatCaSo();

        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("laySoTheoKhachHang: trả về đúng sổ theo khachHangId")
    void laySoTheoKhachHang_traVeDungSo() {
        when(soTietKiemRepository.findByKhachHangId(1)).thenReturn(List.of(soTietKiem));

        List<SoTietKiemDTO> result = soTietKiemService.laySoTheoKhachHang(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getKhachHangId()).isEqualTo(1);
    }
}
