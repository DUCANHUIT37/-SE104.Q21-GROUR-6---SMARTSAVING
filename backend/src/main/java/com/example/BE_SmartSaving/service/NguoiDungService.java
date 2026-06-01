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

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

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

    @org.springframework.transaction.annotation.Transactional
    public NguoiDungDTO taoMoi(NguoiDung nguoiDung) {
        if (nguoiDungRepository.existsByCmnd(nguoiDung.getCmnd())) {
            throw new RuntimeException("CMND/CCCD đã tồn tại trong hệ thống!");
        }
        
        // Save NguoiDung profile first
        NguoiDung savedNguoiDung = nguoiDungRepository.save(nguoiDung);

        // If email is provided, create corresponding TaiKhoan record
        if (nguoiDung.getEmail() != null && !nguoiDung.getEmail().trim().isEmpty()) {
            String cleanEmail = nguoiDung.getEmail().trim();
            if (taiKhoanRepository.existsByEmail(cleanEmail)) {
                throw new RuntimeException("Email đã tồn tại trong hệ thống!");
            }
            
            if (nguoiDung.getMatKhau() == null || nguoiDung.getMatKhau().trim().isEmpty()) {
                throw new RuntimeException("Mật khẩu không được để trống!");
            }
            
            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setEmail(cleanEmail);
            taiKhoan.setMatKhauHash(passwordEncoder.encode(nguoiDung.getMatKhau()));
            
            // Map loaiNguoiDungEnum to QuyenHanEnum
            TaiKhoan.QuyenHanEnum quyenHan = switch (savedNguoiDung.getLoaiNguoiDung()) {
                case quan_tri_vien -> TaiKhoan.QuyenHanEnum.quan_tri_vien;
                case giao_dich_vien -> TaiKhoan.QuyenHanEnum.giao_dich_vien;
                case giam_doc -> TaiKhoan.QuyenHanEnum.giam_doc;
                default -> TaiKhoan.QuyenHanEnum.khach_hang;
            };
            
            taiKhoan.setQuyenHan(quyenHan);
            taiKhoan.setKichHoat(true);
            taiKhoan.setNguoiDung(savedNguoiDung);
            taiKhoan.setTaoLuc(java.time.LocalDateTime.now());
            
            taiKhoanRepository.save(taiKhoan);
        }
        
        return toDTO(savedNguoiDung);
    }

    public NguoiDungDTO capNhat(Integer id, NguoiDung thongTinMoi) {
        NguoiDung existing = layEntityTheoId(id);
        existing.setHoTen(thongTinMoi.getHoTen());
        existing.setDiaChi(thongTinMoi.getDiaChi());
        existing.setSoDienThoai(thongTinMoi.getSoDienThoai());
        if (thongTinMoi.getTaoLuc() != null) {
            existing.setTaoLuc(thongTinMoi.getTaoLuc());
        }
        return toDTO(nguoiDungRepository.save(existing));
    }

    @org.springframework.transaction.annotation.Transactional
    public NguoiDungDTO toggleKichHoat(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByNguoiDungId(id)
                .orElseThrow(() -> new RuntimeException("Người dùng này chưa có tài khoản đăng nhập!"));

        if (taiKhoan.getQuyenHan() == TaiKhoan.QuyenHanEnum.quan_tri_vien || taiKhoan.getQuyenHan() == TaiKhoan.QuyenHanEnum.giam_doc) {
            throw new RuntimeException("Không thể khoá tài khoản Quản Trị Viên hoặc Giám Đốc!");
        }

        taiKhoan.setKichHoat(!taiKhoan.getKichHoat());
        taiKhoanRepository.save(taiKhoan);

        return toDTO(taiKhoan.getNguoiDung());
    }

    @org.springframework.transaction.annotation.Transactional
    public NguoiDungDTO thangCapThanhGiaoDichVien(Integer id) {
        NguoiDung nguoiDung = layEntityTheoId(id);
        if (nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.giao_dich_vien) {
            throw new RuntimeException("Người dùng này đã là Giao Dịch Viên!");
        }
        
        nguoiDung.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.giao_dich_vien);
        nguoiDungRepository.save(nguoiDung);

        TaiKhoan taiKhoan = taiKhoanRepository.findByNguoiDungId(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tài Khoản cho người dùng này!"));
        
        taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.giao_dich_vien);
        taiKhoanRepository.save(taiKhoan);

        return toDTO(nguoiDung);
    }

    @org.springframework.transaction.annotation.Transactional
    public NguoiDungDTO haQuyenThanhKhachHang(Integer id) {
        NguoiDung nguoiDung = layEntityTheoId(id);
        if (nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.khach_hang) {
            throw new RuntimeException("Người dùng này đã là Khách Hàng!");
        }
        if (nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.quan_tri_vien || nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.giam_doc) {
            throw new RuntimeException("Không thể hạ quyền Quản Trị Viên hoặc Giám Đốc!");
        }
        
        nguoiDung.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
        nguoiDungRepository.save(nguoiDung);

        TaiKhoan taiKhoan = taiKhoanRepository.findByNguoiDungId(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tài Khoản cho người dùng này!"));
        
        taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.khach_hang);
        taiKhoanRepository.save(taiKhoan);

        return toDTO(nguoiDung);
    }

    @org.springframework.transaction.annotation.Transactional
    public void xoaTaiKhoan(Integer id) {
        NguoiDung nguoiDung = layEntityTheoId(id);
        if (nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.quan_tri_vien || nguoiDung.getLoaiNguoiDung() == NguoiDung.LoaiNguoiDungEnum.giam_doc) {
            throw new RuntimeException("Không thể xoá tài khoản Quản Trị Viên hoặc Giám Đốc!");
        }
        try {
            taiKhoanRepository.findByNguoiDungId(id).ifPresent(taiKhoanRepository::delete);
            nguoiDungRepository.delete(nguoiDung);
            nguoiDungRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Không thể xoá! Người dùng này đã có dữ liệu sổ tiết kiệm hoặc giao dịch trong hệ thống.");
        }
    }
}