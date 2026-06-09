package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.BaoCaoNgayDTO;
import com.example.BE_SmartSaving.dto.BaoCaoThangDTO;
import com.example.BE_SmartSaving.dto.TongQuanDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("BaoCaoService – Unit Tests")
class BaoCaoServiceTest {

    @Mock private LoaiTietKiemRepository loaiTietKiemRepository;
    @Mock private PhieuGoiRepository phieuGoiRepository;
    @Mock private PhieuRutRepository phieuRutRepository;
    @Mock private SoTietKiemRepository soTietKiemRepository;
    @Mock private NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private BaoCaoService baoCaoService;

    private LoaiTietKiem loai1;
    private LoaiTietKiem loai2;
    private LocalDate ngayBaoCao;

    @BeforeEach
    void setUp() {
        loai1 = new LoaiTietKiem();
        loai1.setId(1);
        loai1.setTenLoai("Không kỳ hạn");
        loai1.setKyHanThang(0);

        loai2 = new LoaiTietKiem();
        loai2.setId(2);
        loai2.setTenLoai("3 tháng");
        loai2.setKyHanThang(3);

        ngayBaoCao = LocalDate.of(2026, 5, 15);
    }

    // ─── lapBaoCaoDoanhSoNgay ─────────────────────────────────────────────────

    @Test
    @DisplayName("baoCaoNgay: tính đúng tongThu = moSo + goiThem")
    void baoCaoNgay_tinhDungTongThu() {
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1));
        when(phieuGoiRepository.tinhTongMoSoTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(new BigDecimal("10000000"));
        when(phieuGoiRepository.tinhTongThuTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(new BigDecimal("5000000"));
        when(phieuRutRepository.tinhTongChiTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(new BigDecimal("2000000"));

        List<BaoCaoNgayDTO> result = baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao);

        assertThat(result).hasSize(1);
        BaoCaoNgayDTO dto = result.get(0);
        assertThat(dto.getTenLoaiTietKiem()).isEqualTo("Không kỳ hạn");
        assertThat(dto.getTongThu()).isEqualByComparingTo("15000000"); // 10M + 5M
        assertThat(dto.getTongChi()).isEqualByComparingTo("2000000");
        assertThat(dto.getChenhLech()).isEqualByComparingTo("13000000"); // 15M - 2M
    }

    @Test
    @DisplayName("baoCaoNgay: chenhLech âm khi chi > thu")
    void baoCaoNgay_chenhLechAm_khiChiLonHonThu() {
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1));
        when(phieuGoiRepository.tinhTongMoSoTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(BigDecimal.ZERO);
        when(phieuGoiRepository.tinhTongThuTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(BigDecimal.ZERO);
        when(phieuRutRepository.tinhTongChiTheoLoaiVaNgay(1, ngayBaoCao))
                .thenReturn(new BigDecimal("3000000"));

        List<BaoCaoNgayDTO> result = baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao);

        assertThat(result.get(0).getChenhLech()).isEqualByComparingTo("-3000000");
    }

    @Test
    @DisplayName("baoCaoNgay: nhiều loại → mỗi loại có DTO riêng")
    void baoCaoNgay_nhieuLoai_moiLoaiCoDTO() {
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1, loai2));
        when(phieuGoiRepository.tinhTongMoSoTheoLoaiVaNgay(anyInt(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(phieuGoiRepository.tinhTongThuTheoLoaiVaNgay(anyInt(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(phieuRutRepository.tinhTongChiTheoLoaiVaNgay(anyInt(), any()))
                .thenReturn(BigDecimal.ZERO);

        List<BaoCaoNgayDTO> result = baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(BaoCaoNgayDTO::getTenLoaiTietKiem)
                .containsExactlyInAnyOrder("Không kỳ hạn", "3 tháng");
    }

    @Test
    @DisplayName("baoCaoNgay: không có loại nào → trả về danh sách rỗng")
    void baoCaoNgay_khongCoLoai_traVeRong() {
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of());

        List<BaoCaoNgayDTO> result = baoCaoService.lapBaoCaoDoanhSoNgay(ngayBaoCao);

        assertThat(result).isEmpty();
    }

    // ─── lapBaoCaoMoDongSoThang ───────────────────────────────────────────────

    @Test
    @DisplayName("baoCaoThang: loaiId cụ thể → chỉ lấy 1 loại")
    void baoCaoThang_loaiIdCuThe_chiLayMotLoai() {
        YearMonth thang = YearMonth.of(2026, 5);
        when(loaiTietKiemRepository.findById(1)).thenReturn(Optional.of(loai1));
        when(soTietKiemRepository.countSoMoByDateRange(any(), any())).thenReturn(List.of());
        when(phieuRutRepository.countSoDongByDateRange(any(), any())).thenReturn(List.of());

        List<BaoCaoThangDTO> result = baoCaoService.lapBaoCaoMoDongSoThang(thang, 1);

        // Chỉ lấy loại có ID = 1
        verify(loaiTietKiemRepository).findById(1);
        verify(loaiTietKiemRepository, never()).findAll();
        // Không có ngày phát sinh nên danh sách rỗng
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("baoCaoThang: loaiId = null → lấy tất cả loại")
    void baoCaoThang_loaiIdNull_layTatCaLoai() {
        YearMonth thang = YearMonth.of(2026, 5);
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1, loai2));
        when(soTietKiemRepository.countSoMoByDateRange(any(), any())).thenReturn(List.of());
        when(phieuRutRepository.countSoDongByDateRange(any(), any())).thenReturn(List.of());

        baoCaoService.lapBaoCaoMoDongSoThang(thang, null);

        verify(loaiTietKiemRepository).findAll();
    }

    @Test
    @DisplayName("baoCaoThang: ngày có phát sinh → thêm vào danh sách")
    void baoCaoThang_ngayCoPhaSinh_themVaoDanhSach() {
        YearMonth thang = YearMonth.of(2026, 5);
        LocalDate ngayCoMo = LocalDate.of(2026, 5, 10);

        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1));

        // Mặc định trả 0, chỉ ngày 10/5 có phát sinh
        when(soTietKiemRepository.countSoMoByDateRange(any(), any())).thenReturn(List.<Object[]>of(
            new Object[]{1, ngayCoMo, 3L}
        ));
        when(phieuRutRepository.countSoDongByDateRange(any(), any())).thenReturn(List.<Object[]>of(
            new Object[]{1, ngayCoMo, 1L}
        ));

        List<BaoCaoThangDTO> result = baoCaoService.lapBaoCaoMoDongSoThang(thang, null);

        assertThat(result).hasSize(1);
        BaoCaoThangDTO dto = result.get(0);
        assertThat(dto.getNgay()).isEqualTo(ngayCoMo.toString());
        assertThat(dto.getSoSoMo()).isEqualTo(3L);
        assertThat(dto.getSoSoDong()).isEqualTo(1L);
        assertThat(dto.getChenhLech()).isEqualTo(2L); // 3 - 1
    }

    @Test
    @DisplayName("baoCaoThang: ngày không phát sinh → không thêm vào danh sách")
    void baoCaoThang_ngayKhongPhaSinh_khongThem() {
        YearMonth thang = YearMonth.of(2026, 5);
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(loai1));
        when(soTietKiemRepository.countSoMoByDateRange(any(), any())).thenReturn(List.of());
        when(phieuRutRepository.countSoDongByDateRange(any(), any())).thenReturn(List.of());

        List<BaoCaoThangDTO> result = baoCaoService.lapBaoCaoMoDongSoThang(thang, null);

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("baoCaoThang: loaiId không tồn tại → throw RuntimeException")
    void baoCaoThang_loaiIdKhongTonTai_throwException() {
        YearMonth thang = YearMonth.of(2026, 5);
        when(loaiTietKiemRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> baoCaoService.lapBaoCaoMoDongSoThang(thang, 99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("loại TK");
    }

    // ─── layTongQuan ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTongQuan: tổng hợp đúng số liệu dashboard")
    void layTongQuan_tongHopDungSoLieu() {
        NguoiDung kh1 = new NguoiDung();
        kh1.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
        NguoiDung kh2 = new NguoiDung();
        kh2.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);

        when(soTietKiemRepository.count()).thenReturn(10L);
        when(nguoiDungRepository.findByLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang))
                .thenReturn(List.of(kh1, kh2));
        when(soTietKiemRepository.sumSoDuHienTai()).thenReturn(new BigDecimal("50000000"));
        when(phieuGoiRepository.tinhTongThuGoiThemTrongNgay(any()))
                .thenReturn(new BigDecimal("3000000"));
        when(phieuGoiRepository.tinhTongThuMoSoTrongNgay(any()))
                .thenReturn(new BigDecimal("7000000"));

        TongQuanDTO result = baoCaoService.layTongQuan();

        assertThat(result.getTongSoTietKiem()).isEqualTo(10L);
        assertThat(result.getTongKhachHang()).isEqualTo(2L);
        assertThat(result.getTongSoDu()).isEqualByComparingTo("50000000");
        assertThat(result.getDoanhThuHomNay()).isEqualByComparingTo("10000000"); // 3M + 7M
    }

    @Test
    @DisplayName("layTongQuan: sumSoDu = null → không throw exception")
    void layTongQuan_sumSoDuNull_khongThrowException() {
        when(soTietKiemRepository.count()).thenReturn(0L);
        when(nguoiDungRepository.findByLoaiNguoiDung(any())).thenReturn(List.of());
        when(soTietKiemRepository.sumSoDuHienTai()).thenReturn(BigDecimal.ZERO);
        when(phieuGoiRepository.tinhTongThuGoiThemTrongNgay(any())).thenReturn(BigDecimal.ZERO);
        when(phieuGoiRepository.tinhTongThuMoSoTrongNgay(any())).thenReturn(BigDecimal.ZERO);

        assertThatCode(() -> baoCaoService.layTongQuan()).doesNotThrowAnyException();
    }
}