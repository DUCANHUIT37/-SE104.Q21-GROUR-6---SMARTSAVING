package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.LoaiTietKiemDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.repository.LoaiTietKiemRepository;
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
@DisplayName("LoaiTietKiemService – Unit Tests")
class LoaiTietKiemServiceTest {

    @Mock
    private LoaiTietKiemRepository loaiTietKiemRepository;

    @InjectMocks
    private LoaiTietKiemService loaiTietKiemService;

    private LoaiTietKiem khongKyHan;
    private LoaiTietKiem baThang;
    private LoaiTietKiem sauThang;

    @BeforeEach
    void setUp() {
        khongKyHan = new LoaiTietKiem();
        khongKyHan.setId(1);
        khongKyHan.setTenLoai("Không kỳ hạn");
        khongKyHan.setKyHanThang(0);
        khongKyHan.setLaiSuatNam(new BigDecimal("0.0050"));
        khongKyHan.setSoTienGuiToiThieu(new BigDecimal("1000000"));
        khongKyHan.setDangApDung(true);

        baThang = new LoaiTietKiem();
        baThang.setId(2);
        baThang.setTenLoai("3 tháng");
        baThang.setKyHanThang(3);
        baThang.setLaiSuatNam(new BigDecimal("0.0500"));
        baThang.setSoTienGuiToiThieu(new BigDecimal("1000000"));
        baThang.setDangApDung(true);

        sauThang = new LoaiTietKiem();
        sauThang.setId(3);
        sauThang.setTenLoai("6 tháng");
        sauThang.setKyHanThang(6);
        sauThang.setLaiSuatNam(new BigDecimal("0.0550"));
        sauThang.setSoTienGuiToiThieu(new BigDecimal("1000000"));
        sauThang.setDangApDung(false);
    }

    // ─── toDTO ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("toDTO: null input → trả về null")
    void toDTO_null_traVeNull() {
        assertThat(loaiTietKiemService.toDTO(null)).isNull();
    }

    @Test
    @DisplayName("toDTO: entity hợp lệ → ánh xạ đúng tất cả fields")
    void toDTO_entityHopLe_anhXaDungFields() {
        LoaiTietKiemDTO dto = loaiTietKiemService.toDTO(baThang);

        assertThat(dto.getId()).isEqualTo(2);
        assertThat(dto.getTenLoai()).isEqualTo("3 tháng");
        assertThat(dto.getKyHanThang()).isEqualTo(3);
        assertThat(dto.getLaiSuatNam()).isEqualByComparingTo("0.0500");
        assertThat(dto.getSoTienGuiToiThieu()).isEqualByComparingTo("1000000");
        assertThat(dto.getDangApDung()).isTrue();
    }

    // ─── layTatCa ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTatCa: trả về tất cả loại kể cả ngừng áp dụng")
    void layTatCa_traVeTatCaLoai() {
        when(loaiTietKiemRepository.findAll()).thenReturn(List.of(khongKyHan, baThang, sauThang));

        List<LoaiTietKiemDTO> result = loaiTietKiemService.layTatCa();

        assertThat(result).hasSize(3);
    }

    // ─── layDangApDung ────────────────────────────────────────────────────────

    @Test
    @DisplayName("layDangApDung: chỉ trả về loại có dangApDung = true")
    void layDangApDung_chiTraVeLoaiDangHoatDong() {
        when(loaiTietKiemRepository.findByDangApDungTrue()).thenReturn(List.of(khongKyHan, baThang));

        List<LoaiTietKiemDTO> result = loaiTietKiemService.layDangApDung();

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(dto -> dto.getDangApDung());
    }

    // ─── layTheoId / layTheoIdEntity ─────────────────────────────────────────

    @Test
    @DisplayName("layTheoId: tìm thấy → trả về DTO")
    void layTheoId_timThay_traVeDTO() {
        when(loaiTietKiemRepository.findById(2)).thenReturn(Optional.of(baThang));

        LoaiTietKiemDTO dto = loaiTietKiemService.layTheoId(2);

        assertThat(dto.getId()).isEqualTo(2);
        assertThat(dto.getTenLoai()).isEqualTo("3 tháng");
    }

    @Test
    @DisplayName("layTheoIdEntity: không tìm thấy → throw RuntimeException")
    void layTheoIdEntity_khongTimThay_throwException() {
        when(loaiTietKiemRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loaiTietKiemService.layTheoIdEntity(99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    // ─── layKhongKyHan ────────────────────────────────────────────────────────

    @Test
    @DisplayName("layKhongKyHan: tìm thấy loại kyHan=0 → trả về entity")
    void layKhongKyHan_timThay_traVeEntity() {
        when(loaiTietKiemRepository.findFirstByKyHanThang(0)).thenReturn(Optional.of(khongKyHan));

        LoaiTietKiem result = loaiTietKiemService.layKhongKyHan();

        assertThat(result.getKyHanThang()).isEqualTo(0);
        assertThat(result.getLaiSuatNam()).isEqualByComparingTo("0.0050");
    }

    @Test
    @DisplayName("layKhongKyHan: chưa cấu hình → throw RuntimeException")
    void layKhongKyHan_chuaCauHinh_throwException() {
        when(loaiTietKiemRepository.findFirstByKyHanThang(0)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loaiTietKiemService.layKhongKyHan())
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("không kỳ hạn");
    }

    // ─── capNhatLaiSuat ───────────────────────────────────────────────────────

    @Test
    @DisplayName("capNhatLaiSuat: cập nhật đúng lãi suất mới")
    void capNhatLaiSuat_idHopLe_capNhatThanhCong() {
        BigDecimal laiSuatMoi = new BigDecimal("0.0600");
        when(loaiTietKiemRepository.findById(2)).thenReturn(Optional.of(baThang));
        when(loaiTietKiemRepository.save(baThang)).thenReturn(baThang);

        loaiTietKiemService.capNhatLaiSuat(2, laiSuatMoi);

        assertThat(baThang.getLaiSuatNam()).isEqualByComparingTo("0.0600");
        verify(loaiTietKiemRepository).save(baThang);
    }

    // ─── toggleTrangThai ─────────────────────────────────────────────────────

    @Test
    @DisplayName("toggleTrangThai: đang true → chuyển thành false")
    void toggleTrangThai_dangTrue_chuyenThanhFalse() {
        when(loaiTietKiemRepository.findById(2)).thenReturn(Optional.of(baThang));
        when(loaiTietKiemRepository.save(baThang)).thenReturn(baThang);

        loaiTietKiemService.toggleTrangThai(2);

        assertThat(baThang.getDangApDung()).isFalse();
    }

    @Test
    @DisplayName("toggleTrangThai: đang false → chuyển thành true")
    void toggleTrangThai_dangFalse_chuyenThanhTrue() {
        when(loaiTietKiemRepository.findById(3)).thenReturn(Optional.of(sauThang));
        when(loaiTietKiemRepository.save(sauThang)).thenReturn(sauThang);

        loaiTietKiemService.toggleTrangThai(3);

        assertThat(sauThang.getDangApDung()).isTrue();
    }

    // ─── taoMoi ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("taoMoi: lưu và trả về DTO")
    void taoMoi_entityHopLe_luuVaTraVeDTO() {
        when(loaiTietKiemRepository.save(khongKyHan)).thenReturn(khongKyHan);

        LoaiTietKiemDTO dto = loaiTietKiemService.taoMoi(khongKyHan);

        assertThat(dto.getTenLoai()).isEqualTo("Không kỳ hạn");
        verify(loaiTietKiemRepository).save(khongKyHan);
    }
}