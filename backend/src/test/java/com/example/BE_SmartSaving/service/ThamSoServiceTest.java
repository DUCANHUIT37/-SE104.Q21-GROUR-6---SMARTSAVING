package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ThamSoService – Unit Tests")
class ThamSoServiceTest {

    @Mock
    private ThamSoRepository thamSoRepository;

    @InjectMocks
    private ThamSoService thamSoService;

    private ThamSo thamSoGuiToiThieu;
    private ThamSo thamSoGuiThemToiThieu;
    private ThamSo thamSoThoiGian;

    @BeforeEach
    void setUp() {
        thamSoGuiToiThieu = new ThamSo();
        thamSoGuiToiThieu.setId(1);
        thamSoGuiToiThieu.setKhoa("so_tien_gui_toi_thieu");
        thamSoGuiToiThieu.setGiaTri("1000000");

        thamSoGuiThemToiThieu = new ThamSo();
        thamSoGuiThemToiThieu.setId(2);
        thamSoGuiThemToiThieu.setKhoa("so_tien_gui_them_toi_thieu");
        thamSoGuiThemToiThieu.setGiaTri("100000");

        thamSoThoiGian = new ThamSo();
        thamSoThoiGian.setId(3);
        thamSoThoiGian.setKhoa("thoi_gian_gui_toi_thieu_ngay");
        thamSoThoiGian.setGiaTri("15");
    }

    // ─── laySoTienGuiToiThieu ─────────────────────────────────────────────────

    @Test
    @DisplayName("laySoTienGuiToiThieu: có trong DB → trả về đúng giá trị")
    void laySoTienGuiToiThieu_coTrongDB_traVeDungGiaTri() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu"))
                .thenReturn(Optional.of(thamSoGuiToiThieu));

        BigDecimal result = thamSoService.laySoTienGuiToiThieu();

        assertThat(result).isEqualByComparingTo("1000000");
    }

    @Test
    @DisplayName("laySoTienGuiToiThieu: không có trong DB → dùng mặc định 1000000")
    void laySoTienGuiToiThieu_khongCoTrongDB_dungMacDinh() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu"))
                .thenReturn(Optional.empty());

        BigDecimal result = thamSoService.laySoTienGuiToiThieu();

        assertThat(result).isEqualByComparingTo("1000000");
    }

    // ─── laySoTienGuiThemToiThieu ─────────────────────────────────────────────

    @Test
    @DisplayName("laySoTienGuiThemToiThieu: có trong DB → trả về đúng giá trị")
    void laySoTienGuiThemToiThieu_coTrongDB_traVeDungGiaTri() {
        when(thamSoRepository.findByKhoa("so_tien_gui_them_toi_thieu"))
                .thenReturn(Optional.of(thamSoGuiThemToiThieu));

        BigDecimal result = thamSoService.laySoTienGuiThemToiThieu();

        assertThat(result).isEqualByComparingTo("100000");
    }

    @Test
    @DisplayName("laySoTienGuiThemToiThieu: không có trong DB → dùng mặc định 100000")
    void laySoTienGuiThemToiThieu_khongCoTrongDB_dungMacDinh() {
        when(thamSoRepository.findByKhoa("so_tien_gui_them_toi_thieu"))
                .thenReturn(Optional.empty());

        BigDecimal result = thamSoService.laySoTienGuiThemToiThieu();

        assertThat(result).isEqualByComparingTo("100000");
    }

    // ─── layThoiGianGuiToiThieu ───────────────────────────────────────────────

    @Test
    @DisplayName("layThoiGianGuiToiThieu: có trong DB → trả về 15")
    void layThoiGianGuiToiThieu_coTrongDB_traVe15() {
        when(thamSoRepository.findByKhoa("thoi_gian_gui_toi_thieu_ngay"))
                .thenReturn(Optional.of(thamSoThoiGian));

        int result = thamSoService.layThoiGianGuiToiThieu();

        assertThat(result).isEqualTo(15);
    }

    @Test
    @DisplayName("layThoiGianGuiToiThieu: không có trong DB → dùng mặc định 15")
    void layThoiGianGuiToiThieu_khongCoTrongDB_dungMacDinh() {
        when(thamSoRepository.findByKhoa("thoi_gian_gui_toi_thieu_ngay"))
                .thenReturn(Optional.empty());

        int result = thamSoService.layThoiGianGuiToiThieu();

        assertThat(result).isEqualTo(15);
    }

    @Test
    @DisplayName("layThoiGianGuiToiThieu: DB trả về giá trị tùy chỉnh → trả về đúng")
    void layThoiGianGuiToiThieu_giaTriTuyChinhTrongDB_traVeDung() {
        thamSoThoiGian.setGiaTri("30");
        when(thamSoRepository.findByKhoa("thoi_gian_gui_toi_thieu_ngay"))
                .thenReturn(Optional.of(thamSoThoiGian));

        int result = thamSoService.layThoiGianGuiToiThieu();

        assertThat(result).isEqualTo(30);
    }

    // ─── layTheoKhoa ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTheoKhoa: tìm thấy → trả về entity")
    void layTheoKhoa_timThay_traVeEntity() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu"))
                .thenReturn(Optional.of(thamSoGuiToiThieu));

        ThamSo result = thamSoService.layTheoKhoa("so_tien_gui_toi_thieu");

        assertThat(result.getGiaTri()).isEqualTo("1000000");
    }

    @Test
    @DisplayName("layTheoKhoa: không tìm thấy → throw RuntimeException")
    void layTheoKhoa_khongTimThay_throwException() {
        when(thamSoRepository.findByKhoa("khoa_khong_ton_tai"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> thamSoService.layTheoKhoa("khoa_khong_ton_tai"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("khoa_khong_ton_tai");
    }

    // ─── layTatCaThamSo ───────────────────────────────────────────────────────

    @Test
    @DisplayName("layTatCaThamSo: trả về tất cả tham số")
    void layTatCaThamSo_traVeTatCa() {
        when(thamSoRepository.findAll())
                .thenReturn(List.of(thamSoGuiToiThieu, thamSoGuiThemToiThieu, thamSoThoiGian));

        List<ThamSo> result = thamSoService.layTatCaThamSo();

        assertThat(result).hasSize(3);
    }
}