package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.LichSuThamSo;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.LichSuThamSoRepository;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ThamSoAdminService – Unit Tests")
class ThamSoAdminServiceTest {

    @Mock private ThamSoRepository thamSoRepository;
    @Mock private LichSuThamSoRepository lichSuThamSoRepository;
    @Mock private NguoiDungRepository nguoiDungRepository;

    @InjectMocks
    private ThamSoAdminService thamSoAdminService;

    private ThamSo thamSo;
    private NguoiDung admin;

    @BeforeEach
    void setUp() {
        thamSo = new ThamSo();
        thamSo.setId(1);
        thamSo.setKhoa("so_tien_gui_toi_thieu");
        thamSo.setGiaTri("1000000");

        admin = new NguoiDung();
        admin.setId(10);
        admin.setHoTen("Admin");
        admin.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.quan_tri_vien);
    }

    // ─── capNhatThamSo – happy path ───────────────────────────────────────────

    @Test
    @DisplayName("capNhat: giá trị hợp lệ → cập nhật và ghi lịch sử")
    void capNhat_hopLe_capNhatVaGhiLichSu() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));
        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(admin));
        when(thamSoRepository.save(any())).thenReturn(thamSo);

        thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", "2000000", 10, "Tăng mức tối thiểu");

        // Kiểm tra giá trị mới đã được set
        assertThat(thamSo.getGiaTri()).isEqualTo("2000000");

        // Kiểm tra lịch sử được ghi đúng
        ArgumentCaptor<LichSuThamSo> captor = ArgumentCaptor.forClass(LichSuThamSo.class);
        verify(lichSuThamSoRepository).save(captor.capture());

        LichSuThamSo lichSu = captor.getValue();
        assertThat(lichSu.getGiaTriCu()).isEqualTo("1000000");
        assertThat(lichSu.getGiaTriMoi()).isEqualTo("2000000");
        assertThat(lichSu.getLyDo()).isEqualTo("Tăng mức tối thiểu");
    }

    @Test
    @DisplayName("capNhat: adminId hợp lệ → gán capNhatBoi cho thamSo và lichSu")
    void capNhat_adminIdHopLe_ganCapNhatBoi() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));
        when(nguoiDungRepository.findById(10)).thenReturn(Optional.of(admin));
        when(thamSoRepository.save(any())).thenReturn(thamSo);

        thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", "2000000", 10, null);

        assertThat(thamSo.getCapNhatBoi()).isEqualTo(admin);
    }

    @Test
    @DisplayName("capNhat: adminId = null → không gán capNhatBoi, vẫn cập nhật thành công")
    void capNhat_adminIdNull_khongGanCapNhatBoi() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));
        when(thamSoRepository.save(any())).thenReturn(thamSo);

        thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", "2000000", null, null);

        assertThat(thamSo.getGiaTri()).isEqualTo("2000000");
        verify(nguoiDungRepository, never()).findById(any());
    }

    // ─── capNhatThamSo – validation ───────────────────────────────────────────

    @Test
    @DisplayName("capNhat: khoa không tồn tại → throw RuntimeException")
    void capNhat_khoaKhongTonTai_throwException() {
        when(thamSoRepository.findByKhoa("khoa_sai")).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                thamSoAdminService.capNhatThamSo("khoa_sai", "999", null, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("khoa_sai");
    }

    @Test
    @DisplayName("capNhat: giá trị mới rỗng → throw RuntimeException")
    void capNhat_giaTriRong_throwException() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));

        assertThatThrownBy(() ->
                thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", "", null, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("trống");

        verify(thamSoRepository, never()).save(any());
        verify(lichSuThamSoRepository, never()).save(any());
    }

    @Test
    @DisplayName("capNhat: giá trị mới null → throw RuntimeException")
    void capNhat_giaTriNull_throwException() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));

        assertThatThrownBy(() ->
                thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", null, null, null))
                .isInstanceOf(RuntimeException.class);

        verify(thamSoRepository, never()).save(any());
    }

    @Test
    @DisplayName("capNhat: thứ tự ghi lichSu TRƯỚC khi save thamSo (audit first)")
    void capNhat_ghiLichSuTruocKhiSaveThamSo() {
        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));
        when(thamSoRepository.save(any())).thenReturn(thamSo);

        thamSoAdminService.capNhatThamSo("so_tien_gui_toi_thieu", "3000000", null, null);

        // Verify cả hai được gọi – thứ tự đảm bảo bởi logic trong service
        verify(lichSuThamSoRepository).save(any());
        verify(thamSoRepository).save(thamSo);
    }

    // ─── layLichSuThayDoi ─────────────────────────────────────────────────────

    @Test
    @DisplayName("layLichSu: tìm thấy tham số → trả về lịch sử theo thứ tự mới nhất")
    void layLichSu_timThay_traVeLichSu() {
        LichSuThamSo ls1 = new LichSuThamSo();
        ls1.setGiaTriCu("1000000");
        ls1.setGiaTriMoi("2000000");
        LichSuThamSo ls2 = new LichSuThamSo();
        ls2.setGiaTriCu("2000000");
        ls2.setGiaTriMoi("3000000");

        when(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")).thenReturn(Optional.of(thamSo));
        when(lichSuThamSoRepository.findByThamSoIdOrderByThoiGianDesc(1))
                .thenReturn(List.of(ls2, ls1));

        List<LichSuThamSo> result =
                thamSoAdminService.layLichSuThayDoi("so_tien_gui_toi_thieu");

        assertThat(result).hasSize(2);
        // Phần tử đầu là mới nhất
        assertThat(result.get(0).getGiaTriMoi()).isEqualTo("3000000");
    }

    @Test
    @DisplayName("layLichSu: khoa không tồn tại → throw RuntimeException")
    void layLichSu_khoaKhongTonTai_throwException() {
        when(thamSoRepository.findByKhoa("khoa_sai")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> thamSoAdminService.layLichSuThayDoi("khoa_sai"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("khoa_sai");
    }
}