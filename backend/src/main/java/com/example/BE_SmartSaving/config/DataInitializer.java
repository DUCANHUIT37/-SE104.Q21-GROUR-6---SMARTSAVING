package com.example.BE_SmartSaving.config;

import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.TaiKhoan;
import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private ThamSoRepository thamSoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            createTestAccount("teller@smartsaving.vn", "teller123", "Giao Dịch Viên Test", "123456789012", TaiKhoan.QuyenHanEnum.giao_dich_vien);
            createTestAccount("user@smartsaving.vn", "user123", "Khách Hàng Test", "987654321012", TaiKhoan.QuyenHanEnum.khach_hang);
            createTestAccount("admin@smartsaving.vn", "admin123", "Quản Trị Viên Test", "999999888888", TaiKhoan.QuyenHanEnum.quan_tri_vien);

            seedThamSo("so_tien_gui_toi_thieu", "1000000", "Số tiền gửi tối thiểu ban đầu");
            seedThamSo("so_tien_gui_them_toi_thieu", "100000", "Số tiền gửi thêm tối thiểu");
            seedThamSo("thoi_gian_gui_toi_thieu_ngay", "15", "Thời gian gửi tối thiểu trước khi rút (ngày)");

            System.out.println("[DataInitializer] Khởi tạo dữ liệu thành công.");
        } catch (Exception e) {
            // Không crash app khi DB chưa sẵn sàng lúc startup
            // App vẫn chạy được, chỉ bỏ qua bước seed data
            System.err.println("[DataInitializer] Không thể khởi tạo dữ liệu: " + e.getMessage());
            System.err.println("[DataInitializer] Kiểm tra kết nối Database và biến môi trường SPRING_DATASOURCE_URL.");
        }
    }

    private void createTestAccount(String email, String password, String name, String cmnd, TaiKhoan.QuyenHanEnum role) {
        if (!taiKhoanRepository.existsByEmail(email)) {
            NguoiDung nguoiDung = new NguoiDung();
            nguoiDung.setHoTen(name);
            nguoiDung.setCmnd(cmnd);
            nguoiDung.setDiaChi("Hệ thống khởi tạo");
            nguoiDung.setLoaiNguoiDung(role == TaiKhoan.QuyenHanEnum.khach_hang ?
                NguoiDung.LoaiNguoiDungEnum.khach_hang : NguoiDung.LoaiNguoiDungEnum.giao_dich_vien);
            nguoiDung = nguoiDungRepository.save(nguoiDung);

            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setEmail(email);
            taiKhoan.setMatKhauHash(passwordEncoder.encode(password));
            taiKhoan.setQuyenHan(role);
            taiKhoan.setNguoiDung(nguoiDung);
            taiKhoanRepository.save(taiKhoan);
            System.out.println("[DataInitializer] Đã tạo tài khoản: " + email + " | Role: " + role);
        }
    }

    private void seedThamSo(String khoa, String giaTri, String moTa) {
        if (!thamSoRepository.findByKhoa(khoa).isPresent()) {
            ThamSo ts = new ThamSo();
            ts.setKhoa(khoa);
            ts.setGiaTri(giaTri);
            ts.setKieuDuLieu(ThamSo.KieuDuLieuEnum.integer);
            ts.setMoTa(moTa);
            thamSoRepository.save(ts);
            System.out.println("[DataInitializer] Đã khởi tạo tham số: " + khoa + " = " + giaTri);
        }
    }
}
