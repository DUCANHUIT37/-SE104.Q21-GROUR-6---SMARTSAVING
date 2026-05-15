package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.NguoiDungDTO;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.TaiKhoan;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NguoiDungService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    // ─────────────────────────────────────────────────────────────
    //  MAPPER: Entity → DTO
    //  Ánh xạ loaiNguoiDung (enum nội bộ) → quyenHan (string cho FE)
    // ─────────────────────────────────────────────────────────────
    public NguoiDungDTO toDTO(NguoiDung nd) {
        if (nd == null) return null;

        // Tìm TaiKhoan tương ứng để lấy quyenHan và kichHoat thật từ DB
        Optional<TaiKhoan> taiKhoanOpt = taiKhoanRepository.findByNguoiDungId(nd.getId());

        // Map quyenHan từ TaiKhoan nếu có, ngược lại dùng loaiNguoiDung để suy ra
        String quyenHan;
        Boolean kichHoat;
        String email = "";

        if (taiKhoanOpt.isPresent()) {
            TaiKhoan tk = taiKhoanOpt.get();
            kichHoat = tk.getKichHoat();
            email = tk.getEmail();
            // TaiKhoan.QuyenHanEnum: quan_tri_vien, giao_dich_vien, giam_doc
            quyenHan = switch (tk.getQuyenHan()) {
                case quan_tri_vien -> "ADMIN";
                case giao_dich_vien -> "TELLER";
                default -> "USER";
            };
        } else {
            // Khách hàng không có TaiKhoan → mặc định kichHoat = true, quyenHan = USER
            kichHoat = true;
            quyenHan = switch (nd.getLoaiNguoiDung() != null ? nd.getLoaiNguoiDung() : NguoiDung.LoaiNguoiDungEnum.khach_hang) {
                case quan_tri_vien -> "ADMIN";
                case giao_dich_vien -> "TELLER";
                default -> "USER";
            };
        }

        return NguoiDungDTO.builder()
                .id(nd.getId())
                .email(email)
                .hoTen(nd.getHoTen())
                .cmnd(nd.getCmnd())
                .diaChi(nd.getDiaChi())
                .soDienThoai(nd.getSoDienThoai())
                .quyenHan(quyenHan)
                .kichHoat(kichHoat)
                .taoLuc(nd.getTaoLuc())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    //  BUSINESS METHODS (trả về DTO)
    // ─────────────────────────────────────────────────────────────

    public NguoiDungDTO timHoacTaoKhachHang(NguoiDung thongTin) {
        NguoiDung nd = nguoiDungRepository.findByCmnd(thongTin.getCmnd())
                .orElseGet(() -> {
                    thongTin.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
                    return nguoiDungRepository.save(thongTin);
                });
        return toDTO(nd);
    }

    public NguoiDungDTO layTheoId(Integer id) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + id));
        return toDTO(nd);
    }

    /** Dùng nội bộ (SoTietKiemService) vẫn cần Entity */
    public NguoiDung layEntityTheoId(Integer id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + id));
    }

    public NguoiDungDTO layTheoCmnd(String cmnd) {
        NguoiDung nd = nguoiDungRepository.findByCmnd(cmnd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng CMND: " + cmnd));
        return toDTO(nd);
    }

    public List<NguoiDungDTO> layTatCa() {
        return nguoiDungRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NguoiDungDTO> layKhachHang() {
        return nguoiDungRepository.findByLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NguoiDungDTO> timKiemTheoTen(String hoTen) {
        return nguoiDungRepository.findByHoTenContainingIgnoreCase(hoTen)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NguoiDungDTO taoMoi(NguoiDung nguoiDung) {
        if (nguoiDungRepository.existsByCmnd(nguoiDung.getCmnd())) {
            throw new RuntimeException("CMND/CCCD đã tồn tại trong hệ thống!");
        }
        return toDTO(nguoiDungRepository.save(nguoiDung));
    }

    public NguoiDungDTO capNhat(Integer id, NguoiDung thongTinMoi) {
        NguoiDung existing = layEntityTheoId(id);
        existing.setHoTen(thongTinMoi.getHoTen());
        existing.setDiaChi(thongTinMoi.getDiaChi());
        existing.setSoDienThoai(thongTinMoi.getSoDienThoai());
        return toDTO(nguoiDungRepository.save(existing));
    }
}