package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.SoTietKiemDTO;
import com.example.BE_SmartSaving.model.*;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import java.util.stream.Collectors;


@Service
public class SoTietKiemService {

    @Autowired
    private SoTietKiemRepository soTietKiemRepository;
    @Autowired
    private ThamSoService thamSoService;
    @Autowired
    private LoaiTietKiemService loaiTietKiemService;
    @Autowired
    private TaiKhoanRepository taiKhoanRepository;
    @Autowired
    private LichSuGiaoDichService lichSuGiaoDichService;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // ─────────────────────────────────────────────────────────────
    //  MAPPER: Entity → DTO
    // ─────────────────────────────────────────────────────────────
    public SoTietKiemDTO toDTO(SoTietKiem stk) {
        if (stk == null) return null;
        return SoTietKiemDTO.builder()
                .id(stk.getId())
                .maSo(stk.getMaSo())
                // Flatten ManyToOne: khachHang
                .khachHangId(stk.getKhachHang() != null ? stk.getKhachHang().getId() : null)
                .khachHangTen(stk.getKhachHang() != null ? stk.getKhachHang().getHoTen() : null)
                .khachHangCmnd(stk.getKhachHang() != null ? stk.getKhachHang().getCmnd() : null)
                .khachHangDiaChi(stk.getKhachHang() != null ? stk.getKhachHang().getDiaChi() : null)
                // Flatten ManyToOne: loaiTietKiem
                .loaiTietKiemId(stk.getLoaiTietKiem() != null ? stk.getLoaiTietKiem().getId() : null)
                .loaiTietKiemTen(stk.getLoaiTietKiem() != null ? stk.getLoaiTietKiem().getTenLoai() : null)
                .kyHanThang(stk.getLoaiTietKiem() != null ? stk.getLoaiTietKiem().getKyHanThang() : null)
                .soTienBanDau(stk.getSoTienBanDau())
                .soDuHienTai(stk.getSoDuHienTai())
                .laiSuatMoSo(stk.getLaiSuatMoSo())
                .ngayMo(stk.getNgayMo())
                .ngayDaoHan(stk.getNgayDaoHan())
                .trangThai(stk.getTrangThai() != null ? stk.getTrangThai().name() : null)
                .taoLuc(stk.getTaoLuc())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    //  BUSINESS METHODS (trả về DTO)
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public SoTietKiemDTO moSoTietKiem(SoTietKiem soTietKiem) {
        String email = SecurityUtils.getCurrentUserEmail();
        NguoiDung nhanVien = null;
        if (email != null) {
            TaiKhoan tk = taiKhoanRepository.findByEmail(email).orElse(null);
            if (tk != null) {
                nhanVien = tk.getNguoiDung();
            }
        }
        
        if (nhanVien == null) {
            throw new RuntimeException("Không xác định được nhân viên thực hiện giao dịch (vui lòng đăng nhập).");
        }
        soTietKiem.setNhanVienTao(nhanVien);

        // 1. Lấy loại tiết kiệm, validate đang áp dụng
        LoaiTietKiem loai = loaiTietKiemService.layTheoIdEntity(
                soTietKiem.getLoaiTietKiem().getId());
        if (!loai.getDangApDung()) {
            throw new RuntimeException("Loại tiết kiệm này đã ngừng áp dụng!");
        }

        // 2. Kiểm tra số tiền tối thiểu theo loại
        BigDecimal min = loai.getSoTienGuiToiThieu();
        if (soTietKiem.getSoTienBanDau().compareTo(min) < 0) {
            throw new RuntimeException(
                    "Số tiền gởi ban đầu tối thiểu là " + min + " VNĐ");
        }

        // 3. Wire FK (Khách Hàng và Loại Tiết Kiệm)
        if (soTietKiem.getKhachHang() == null || soTietKiem.getKhachHang().getCmnd() == null) {
            throw new RuntimeException("Thiếu thông tin CMND khách hàng");
        }
        
        String cmnd = soTietKiem.getKhachHang().getCmnd();
        NguoiDung khachHang = nguoiDungRepository.findByCmnd(cmnd).orElse(null);
        
        if (khachHang == null) {
            // Tự động tạo hồ sơ Khách Hàng mới nếu chưa có
            khachHang = new NguoiDung();
            khachHang.setCmnd(cmnd);
            khachHang.setHoTen(soTietKiem.getKhachHang().getHoTen());
            khachHang.setDiaChi(soTietKiem.getKhachHang().getDiaChi());
            khachHang.setSoDienThoai(soTietKiem.getKhachHang().getSoDienThoai());
            khachHang.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
            khachHang = nguoiDungRepository.save(khachHang);
        } else {
            TaiKhoan tkKhachHang = taiKhoanRepository.findByNguoiDungId(khachHang.getId()).orElse(null);
            if (tkKhachHang != null && !tkKhachHang.getKichHoat()) {
                throw new RuntimeException("Tài khoản của khách hàng này đã bị khóa. Không thể thực hiện giao dịch!");
            }
            
            // Cập nhật địa chỉ nếu khách hàng chưa có và có gửi kèm địa chỉ mới
            String diaChiMoi = soTietKiem.getKhachHang().getDiaChi();
            if (diaChiMoi != null && !diaChiMoi.trim().isEmpty() && !diaChiMoi.equals("Chưa cập nhật")) {
                String diaChiCu = khachHang.getDiaChi();
                if (diaChiCu == null || diaChiCu.trim().isEmpty() || diaChiCu.equals("Chưa cập nhật")) {
                    khachHang.setDiaChi(diaChiMoi.trim());
                    khachHang = nguoiDungRepository.save(khachHang);
                }
            }
        }
        
        soTietKiem.setKhachHang(khachHang);
        soTietKiem.setLoaiTietKiem(loai);

        // 4. Snapshot lãi suất tại thời điểm mở
        soTietKiem.setLaiSuatMoSo(loai.getLaiSuatNam());

        // 5. Ngày mở và đáo hạn
        LocalDate ngayMo = LocalDate.now();
        soTietKiem.setNgayMo(ngayMo);
        if (loai.getKyHanThang() > 0) {
            soTietKiem.setNgayDaoHan(ngayMo.plusMonths(loai.getKyHanThang()));
        } else {
            soTietKiem.setNgayDaoHan(null);
        }

        // 6. Số dư ban đầu
        soTietKiem.setSoDuHienTai(soTietKiem.getSoTienBanDau());
        soTietKiem.setTrangThai(SoTietKiem.TrangThaiEnum.dang_hoat_dong);

        // 7. Tạo mã sổ duy nhất (STKyyyyMMdd + 8 ký tự UUID ngẫu nhiên – thread-safe)
        String prefix = "STK" + ngayMo.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uniqueSuffix = java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        soTietKiem.setMaSo(prefix + uniqueSuffix);

        SoTietKiem saved = soTietKiemRepository.save(soTietKiem);

        // 8. Ghi audit trail
        lichSuGiaoDichService.ghi(saved,
                LichSuGiaoDich.LoaiGiaoDichEnum.mo_so,
                saved.getSoTienBanDau(),
                BigDecimal.ZERO,
                saved.getSoDuHienTai(),
                "Mở sổ tiết kiệm " + loai.getTenLoai());

        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<SoTietKiemDTO> layTatCaSo() {
        return soTietKiemRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SoTietKiemDTO laySoTheoId(Integer id) {
        SoTietKiem stk = soTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy sổ tiết kiệm ID: " + id));
        return toDTO(stk);
    }

    /** Dùng nội bộ (PhieuRutService, PhieuGoiService) vẫn cần Entity */
    public SoTietKiem laySoEntityTheoId(Integer id) {
        return soTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy sổ tiết kiệm ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<SoTietKiemDTO> timKiem(String tuKhoa) {
        return soTietKiemRepository.timKiem(tuKhoa)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SoTietKiemDTO> laySoTheoKhachHang(Integer khachHangId) {
        return soTietKiemRepository.findByKhachHangId(khachHangId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void xoaSo(Integer id) {
        SoTietKiem stk = laySoEntityTheoId(id);
        if (stk.getTrangThai() == SoTietKiem.TrangThaiEnum.dang_hoat_dong) {
            throw new RuntimeException(
                    "Không thể xoá sổ đang hoạt động. Chỉ xoá sổ đã tất toán!");
        }
        soTietKiemRepository.deleteById(id);
    }
}