package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.NguoiDungDTO;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.TaiKhoan;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NguoiDungService – Unit Tests")
class NguoiDungServiceTest {

    @Mock
    private NguoiDungRepository nguoiDungRepository;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private NguoiDungService nguoiDungService;

    private NguoiDung khachHang;
    private NguoiDung nhanVien;
    private TaiKhoan taiKhoan;

    @BeforeEach
    void setUp() {
        khachHang = new NguoiDung();
        khachHang.setId(1);
        khachHang.setHoTen("Nguyen Van A");
        khachHang.setCmnd("123456789");
        khachHang.setDiaChi("Ho Chi Minh");
        khachHang.setSoDienThoai("0901234567");
        khachHang.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);

        nhanVien = new NguoiDung();
        nhanVien.setId(2);
        nhanVien.setHoTen("Tran Thi B");
        nhanVien.setCmnd("987654321");
        nhanVien.setDiaChi("Ha Noi");
        nhanVien.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.giao_dich_vien);

        taiKhoan = new TaiKhoan();
        taiKhoan.setId(1);
        taiKhoan.setEmail("nhanvien@bank.com");
        taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.giao_dich_vien);
        taiKhoan.setNguoiDung(nhanVien);
        taiKhoan.setKichHoat(true);
    }

    // ─── toDTO ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("toDTO: khách hàng không có tài khoản → quyenHan = USER, kichHoat = true")
    void toDTO_khachHangKhongCoTaiKhoan_traVeUserRole() {
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        NguoiDungDTO dto = nguoiDungService.toDTO(khachHang);

        assertThat(dto.getQuyenHan()).isEqualTo("USER");
        assertThat(dto.getKichHoat()).isTrue();
        assertThat(dto.getEmail()).isEmpty();
    }

    @Test
    @DisplayName("toDTO: nhân viên có tài khoản giao_dich_vien → quyenHan = TELLER")
    void toDTO_nhanVienCoTaiKhoan_traVeTellerRole() {
        when(taiKhoanRepository.findByNguoiDungId(2)).thenReturn(Optional.of(taiKhoan));

        NguoiDungDTO dto = nguoiDungService.toDTO(nhanVien);

        assertThat(dto.getQuyenHan()).isEqualTo("TELLER");
        assertThat(dto.getEmail()).isEqualTo("nhanvien@bank.com");
        assertThat(dto.getKichHoat()).isTrue();
    }

    @Test
    @DisplayName("toDTO: tài khoản quan_tri_vien → quyenHan = ADMIN")
    void toDTO_adminTaiKhoan_traVeAdminRole() {
        taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.quan_tri_vien);
        when(taiKhoanRepository.findByNguoiDungId(2)).thenReturn(Optional.of(taiKhoan));

        NguoiDungDTO dto = nguoiDungService.toDTO(nhanVien);

        assertThat(dto.getQuyenHan()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("toDTO: null input → trả về null")
    void toDTO_nullInput_traVeNull() {
        assertThat(nguoiDungService.toDTO(null)).isNull();
    }

    // ─── layTheoId ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTheoId: tìm thấy → trả về DTO đúng thông tin")
    void layTheoId_timThay_traVeDTO() {
        when(nguoiDungRepository.findById(1)).thenReturn(Optional.of(khachHang));
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        NguoiDungDTO dto = nguoiDungService.layTheoId(1);

        assertThat(dto.getId()).isEqualTo(1);
        assertThat(dto.getHoTen()).isEqualTo("Nguyen Van A");
        assertThat(dto.getCmnd()).isEqualTo("123456789");
    }

    @Test
    @DisplayName("layTheoId: không tìm thấy → throw RuntimeException")
    void layTheoId_khongTimThay_throwException() {
        when(nguoiDungRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> nguoiDungService.layTheoId(99))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    // ─── layTheoCmnd ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("layTheoCmnd: tìm thấy → trả về DTO đúng")
    void layTheoCmnd_timThay_traVeDTO() {
        when(nguoiDungRepository.findByCmnd("123456789")).thenReturn(Optional.of(khachHang));
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        NguoiDungDTO dto = nguoiDungService.layTheoCmnd("123456789");

        assertThat(dto.getCmnd()).isEqualTo("123456789");
    }

    @Test
    @DisplayName("layTheoCmnd: không tìm thấy → throw RuntimeException")
    void layTheoCmnd_khongTimThay_throwException() {
        when(nguoiDungRepository.findByCmnd("000")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> nguoiDungService.layTheoCmnd("000"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("000");
    }

    // ─── taoMoi ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("taoMoi: CMND chưa tồn tại → lưu thành công, trả về DTO")
    void taoMoi_cmndChuaTonTai_luuThanhCong() {
        when(nguoiDungRepository.existsByCmnd("123456789")).thenReturn(false);
        when(nguoiDungRepository.save(khachHang)).thenReturn(khachHang);
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        NguoiDungDTO dto = nguoiDungService.taoMoi(khachHang);

        assertThat(dto.getHoTen()).isEqualTo("Nguyen Van A");
        verify(nguoiDungRepository).save(khachHang);
    }

    @Test
    @DisplayName("taoMoi: CMND đã tồn tại → throw RuntimeException")
    void taoMoi_cmndDaTonTai_throwException() {
        when(nguoiDungRepository.existsByCmnd("123456789")).thenReturn(true);

        assertThatThrownBy(() -> nguoiDungService.taoMoi(khachHang))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("CMND");

        verify(nguoiDungRepository, never()).save(any());
    }

    // ─── capNhat ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("capNhat: cập nhật đúng hoTen, diaChi, soDienThoai")
    void capNhat_idHopLe_capNhatThanhCong() {
        NguoiDung thongTinMoi = new NguoiDung();
        thongTinMoi.setHoTen("Nguyen Van A Updated");
        thongTinMoi.setDiaChi("Da Nang");
        thongTinMoi.setSoDienThoai("0999999999");

        when(nguoiDungRepository.findById(1)).thenReturn(Optional.of(khachHang));
        when(nguoiDungRepository.save(any())).thenReturn(khachHang);
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        nguoiDungService.capNhat(1, thongTinMoi);

        assertThat(khachHang.getHoTen()).isEqualTo("Nguyen Van A Updated");
        assertThat(khachHang.getDiaChi()).isEqualTo("Da Nang");
        assertThat(khachHang.getSoDienThoai()).isEqualTo("0999999999");
        verify(nguoiDungRepository).save(khachHang);
    }

    // ─── layTatCa / layKhachHang ─────────────────────────────────────────────

    @Test
    @DisplayName("layTatCa: trả về đúng số lượng DTO")
    void layTatCa_traVeDanhSachDTO() {
        when(nguoiDungRepository.findAll()).thenReturn(List.of(khachHang, nhanVien));
        when(taiKhoanRepository.findByNguoiDungId(anyInt())).thenReturn(Optional.empty());

        List<NguoiDungDTO> result = nguoiDungService.layTatCa();

        assertThat(result).hasSize(2);
    }

    @Test
    @DisplayName("layKhachHang: chỉ trả về người dùng loại khach_hang")
    void layKhachHang_chiTraVeKhachHang() {
        when(nguoiDungRepository.findByLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang))
                .thenReturn(List.of(khachHang));
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        List<NguoiDungDTO> result = nguoiDungService.layKhachHang();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getQuyenHan()).isEqualTo("USER");
    }

    // ─── timHoacTaoKhachHang ─────────────────────────────────────────────────

    @Test
    @DisplayName("timHoacTaoKhachHang: CMND đã có → trả về người dùng cũ, không tạo mới")
    void timHoacTaoKhachHang_cmndDaCo_traVeCu() {
        when(nguoiDungRepository.findByCmnd("123456789")).thenReturn(Optional.of(khachHang));
        when(taiKhoanRepository.findByNguoiDungId(1)).thenReturn(Optional.empty());

        NguoiDungDTO dto = nguoiDungService.timHoacTaoKhachHang(khachHang);

        assertThat(dto.getCmnd()).isEqualTo("123456789");
        verify(nguoiDungRepository, never()).save(any());
    }

    @Test
    @DisplayName("timHoacTaoKhachHang: CMND chưa có → tạo mới với loai khach_hang")
    void timHoacTaoKhachHang_cmndChuaCo_taoMoiKhachHang() {
        NguoiDung nguoiMoi = new NguoiDung();
        nguoiMoi.setId(3);
        nguoiMoi.setCmnd("111111111");
        nguoiMoi.setHoTen("Le Van C");
        nguoiMoi.setDiaChi("Can Tho");

        when(nguoiDungRepository.findByCmnd("111111111")).thenReturn(Optional.empty());
        when(nguoiDungRepository.save(any())).thenReturn(nguoiMoi);
        when(taiKhoanRepository.findByNguoiDungId(3)).thenReturn(Optional.empty());

        nguoiDungService.timHoacTaoKhachHang(nguoiMoi);

        verify(nguoiDungRepository).save(argThat(nd ->
                nd.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.khach_hang));
    }
}