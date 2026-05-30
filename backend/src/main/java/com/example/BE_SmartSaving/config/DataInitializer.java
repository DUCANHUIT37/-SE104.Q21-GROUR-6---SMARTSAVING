package com.example.BE_SmartSaving.config;

import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.TaiKhoan;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
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
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        createTestAccount("teller@smartsaving.vn", "teller123", "Giao Dịch Viên Test", "123456789012", TaiKhoan.QuyenHanEnum.giao_dich_vien);
        createTestAccount("user@smartsaving.vn", "user123", "Khách Hàng Test", "987654321012", TaiKhoan.QuyenHanEnum.khach_hang);
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
            System.out.println("Created test account: " + email + " with role: " + role);
        }
    }
}
