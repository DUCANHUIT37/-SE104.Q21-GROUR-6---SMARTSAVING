package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.LichSuGiaoDichDTO;
import com.example.BE_SmartSaving.model.LichSuGiaoDich;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.LichSuGiaoDichRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LichSuGiaoDichService – Unit Tests")
class LichSuGiaoDichServiceTest {

    @Mock
    private LichSuGiaoDichRepository lichSuGiaoDichRepository;

    @InjectMocks
    private LichSuGiaoDichService lichSuGiaoDichService;

    private SoTietKiem soTietKiem;
    private LichSuGiaoDich giaoDich;

    @BeforeEach
    void setUp() {
        NguoiDung khachHang = new NguoiDung();
        khachHang.setId(1);
        khachHang.setHoTen("Nguyen Van A");

        soTietKiem = new SoTietKiem();
        soTietKiem.setId(1);
        soTietKiem.setMaSo("STK20260101001");
        soTietKiem.setKhachHang(khachHang);

        giaoDich = new LichSuGiaoDich();
        giaoDich.setId(1);
        giaoDich.setMaGiaoDich("GD20260101120000000");
        giaoDich.setSoTietKiem(soTietKiem);
        giaoDich.setLoaiGiaoDich(LichSuGiaoDich.LoaiGiaoDichEnum.mo_so);
        giaoDich.setSoTien(new BigDecimal("5000000"));
        giaoDich.setSoDuTruoc(BigDecimal.ZERO);
        giaoDich.setSoDuSau(new BigDecimal("5000000"));
        giaoDich.setGhiChu("Mở sổ tiết kiệm");
        giaoDich.setThoiGian(LocalDateTime.now());
    }

    // ─── toDTO ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("toDTO: null → trả về null")
    void toDTO_null_traVeNull() {
        assertThat(lichSuGiaoDichService.toDTO(null)).isNull();
    }

    @Test
    @DisplayName("toDTO: entity hợp lệ → ánh xạ đúng tất cả fields")
    void toDTO_entityHopLe_anhXaDungFields() {
        LichSuGiaoDichDTO dto = lichSuGiaoDichService.toDTO(giaoDich);

        assertThat(dto.getId()).isEqualTo(1);
        assertThat(dto.getMaGiaoDich()).isEqualTo("GD20260101120000000");
        assertThat(dto.getSoTietKiemId()).isEqualTo(1);
        assertThat(dto.getSoTietKiemMaSo()).isEqualTo("STK20260101001");
        assertThat(dto.getLoaiGiaoDich()).isEqualTo("mo_so");
        assertThat(dto.getSoTien()).isEqualByComparingTo("5000000");
        assertThat(dto.getSoDuTruoc()).isEqualByComparingTo("0");
        assertThat(dto.getSoDuSau()).isEqualByComparingTo("5000000");
        assertThat(dto.getGhiChu()).isEqualTo("Mở sổ tiết kiệm");
    }

    @Test
    @DisplayName("toDTO: soTietKiem = null → soTietKiemId và maSo đều null")
    void toDTO_soTietKiemNull_fieldsSoTietKiemLaNull() {
        giaoDich.setSoTietKiem(null);

        LichSuGiaoDichDTO dto = lichSuGiaoDichService.toDTO(giaoDich);

        assertThat(dto.getSoTietKiemId()).isNull();
        assertThat(dto.getSoTietKiemMaSo()).isNull();
    }

    // ─── ghi ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("ghi: tạo bản ghi với đúng thông tin và maGiaoDich bắt đầu bằng 'GD'")
    void ghi_duLieuHopLe_luuVaTraVeEntity() {
        when(lichSuGiaoDichRepository.save(any())).thenReturn(giaoDich);

        LichSuGiaoDich result = lichSuGiaoDichService.ghi(
                soTietKiem,
                LichSuGiaoDich.LoaiGiaoDichEnum.mo_so,
                new BigDecimal("5000000"),
                BigDecimal.ZERO,
                new BigDecimal("5000000"),
                "Mở sổ tiết kiệm"
        );

        ArgumentCaptor<LichSuGiaoDich> captor = ArgumentCaptor.forClass(LichSuGiaoDich.class);
        verify(lichSuGiaoDichRepository).save(captor.capture());

        LichSuGiaoDich saved = captor.getValue();
        assertThat(saved.getMaGiaoDich()).startsWith("GD");
        assertThat(saved.getSoTietKiem()).isEqualTo(soTietKiem);
        assertThat(saved.getLoaiGiaoDich()).isEqualTo(LichSuGiaoDich.LoaiGiaoDichEnum.mo_so);
        assertThat(saved.getSoTien()).isEqualByComparingTo("5000000");
        assertThat(saved.getSoDuTruoc()).isEqualByComparingTo("0");
        assertThat(saved.getSoDuSau()).isEqualByComparingTo("5000000");
        assertThat(saved.getGhiChu()).isEqualTo("Mở sổ tiết kiệm");
        assertThat(saved.getThoiGian()).isNotNull();
    }

    @Test
    @DisplayName("ghi: mỗi lần gọi tạo maGiaoDich duy nhất (không trùng)")
    void ghi_goiNhieuLan_maGiaoDichKhongTrung() throws InterruptedException {
        when(lichSuGiaoDichRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ArgumentCaptor<LichSuGiaoDich> captor = ArgumentCaptor.forClass(LichSuGiaoDich.class);

        lichSuGiaoDichService.ghi(soTietKiem, LichSuGiaoDich.LoaiGiaoDichEnum.mo_so,
                BigDecimal.TEN, BigDecimal.ZERO, BigDecimal.TEN, "GD1");
        Thread.sleep(10);
        lichSuGiaoDichService.ghi(soTietKiem, LichSuGiaoDich.LoaiGiaoDichEnum.goi_them,
                BigDecimal.ONE, BigDecimal.TEN, new BigDecimal("11"), "GD2");

        verify(lichSuGiaoDichRepository, times(2)).save(captor.capture());
        List<LichSuGiaoDich> saved = captor.getAllValues();

        // Hai mã giao dịch phải khác nhau
        assertThat(saved.get(0).getMaGiaoDich())
                .isNotEqualTo(saved.get(1).getMaGiaoDich());
    }

    // ─── layTheoSo ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTheoSo: trả về danh sách DTO đúng soTietKiemId")
    void layTheoSo_traVeDanhSachDTO() {
        when(lichSuGiaoDichRepository.findBySoTietKiemIdOrderByThoiGianDesc(1))
                .thenReturn(List.of(giaoDich));

        List<LichSuGiaoDichDTO> result = lichSuGiaoDichService.layTheoSo(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSoTietKiemId()).isEqualTo(1);
    }

    @Test
    @DisplayName("layTheoSo: không có giao dịch → trả về danh sách rỗng")
    void layTheoSo_khongCoGiaoDich_traVeRong() {
        when(lichSuGiaoDichRepository.findBySoTietKiemIdOrderByThoiGianDesc(99))
                .thenReturn(List.of());

        List<LichSuGiaoDichDTO> result = lichSuGiaoDichService.layTheoSo(99);

        assertThat(result).isEmpty();
    }

    // ─── layTatCaGiaoDich ─────────────────────────────────────────────────────

    @Test
    @DisplayName("layTatCaGiaoDich: trả về đúng số lượng DTO")
    void layTatCaGiaoDich_traVeTatCa() {
        LichSuGiaoDich giaoDich2 = new LichSuGiaoDich();
        giaoDich2.setId(2);
        giaoDich2.setMaGiaoDich("GD20260101130000000");
        giaoDich2.setSoTietKiem(soTietKiem);
        giaoDich2.setLoaiGiaoDich(LichSuGiaoDich.LoaiGiaoDichEnum.goi_them);
        giaoDich2.setSoTien(new BigDecimal("1000000"));
        giaoDich2.setSoDuTruoc(new BigDecimal("5000000"));
        giaoDich2.setSoDuSau(new BigDecimal("6000000"));
        giaoDich2.setThoiGian(LocalDateTime.now());

        when(lichSuGiaoDichRepository.findAllByOrderByThoiGianDesc())
                .thenReturn(List.of(giaoDich2, giaoDich));

        List<LichSuGiaoDichDTO> result = lichSuGiaoDichService.layTatCaGiaoDich();

        assertThat(result).hasSize(2);
        // Phần tử đầu là giao dịch mới hơn (goi_them)
        assertThat(result.get(0).getLoaiGiaoDich()).isEqualTo("goi_them");
    }
}