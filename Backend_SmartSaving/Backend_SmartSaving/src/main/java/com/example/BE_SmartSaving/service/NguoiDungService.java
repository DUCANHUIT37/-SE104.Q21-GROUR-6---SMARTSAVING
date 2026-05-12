package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NguoiDungService {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    /**
     * Tra cứu/tạo mới khách hàng theo CMND.
     * Khi giao dịch viên nhập CMND: nếu đã có → trả về, nếu chưa → tạo mới.
     */
    public NguoiDung timHoacTaoKhachHang(NguoiDung thongTin) {
        return nguoiDungRepository.findByCmnd(thongTin.getCmnd())
                .orElseGet(() -> {
                    thongTin.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
                    return nguoiDungRepository.save(thongTin);
                });
    }

    public NguoiDung layTheoId(Integer id) {
        return nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + id));
    }

    public NguoiDung layTheoCmnd(String cmnd) {
        return nguoiDungRepository.findByCmnd(cmnd)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng CMND: " + cmnd));
    }

    public List<NguoiDung> layTatCa() {
        return nguoiDungRepository.findAll();
    }

    public List<NguoiDung> timKiemTheoTen(String hoTen) {
        return nguoiDungRepository.findByHoTenContainingIgnoreCase(hoTen);
    }

    public NguoiDung taoMoi(NguoiDung nguoiDung) {
        if (nguoiDungRepository.existsByCmnd(nguoiDung.getCmnd())) {
            throw new RuntimeException("CMND/CCCD đã tồn tại trong hệ thống!");
        }
        return nguoiDungRepository.save(nguoiDung);
    }

    public NguoiDung capNhat(Integer id, NguoiDung thongTinMoi) {
        NguoiDung existing = layTheoId(id);
        existing.setHoTen(thongTinMoi.getHoTen());
        existing.setDiaChi(thongTinMoi.getDiaChi());
        existing.setSoDienThoai(thongTinMoi.getSoDienThoai());
        return nguoiDungRepository.save(existing);
    }
}