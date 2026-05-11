package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class SoTietKiemService {

    @Autowired
    private SoTietKiemRepository soTietKiemRepository;

    // QUY ĐỊNH 1: Số tiền gửi tối thiểu khi mở sổ là 1.000.000đ
    private final BigDecimal TIEN_MO_SO_TOI_THIEU = new BigDecimal("1000000");

    // QUY ĐỊNH 2: Số tiền gửi thêm tối thiểu là 100.000đ
    private final BigDecimal TIEN_GUI_THEM_TOI_THIEU = new BigDecimal("100000");

    public SoTietKiem moSoTietKiem(SoTietKiem soTietKiem) {
        // Kiểm tra tiền gửi ban đầu
        if (soTietKiem.getSoTienBanDau() == null || soTietKiem.getSoTienBanDau().compareTo(TIEN_MO_SO_TOI_THIEU) < 0) {
            throw new RuntimeException("Lỗi: Số tiền nộp ban đầu phải từ 1.000.000đ trở lên! (Theo QĐ1)");
        }

        // Khởi tạo số dư hiện tại bằng đúng số tiền ban đầu
        soTietKiem.setSoDuHienTai(soTietKiem.getSoTienBanDau());

        return soTietKiemRepository.save(soTietKiem);
    }

    public SoTietKiem guiThemTien(Integer id, BigDecimal soTienGuiThem) {
        // Kiểm tra số tiền gửi thêm
        if (soTienGuiThem == null || soTienGuiThem.compareTo(TIEN_GUI_THEM_TOI_THIEU) < 0) {
            throw new RuntimeException("Lỗi: Số tiền gửi thêm phải từ 100.000đ trở lên! (Theo QĐ2)");
        }

        // Tìm sổ trong Database
        SoTietKiem stk = soTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy sổ tiết kiệm này!"));

        // Cộng tiền và lưu lại
        stk.setSoDuHienTai(stk.getSoDuHienTai().add(soTienGuiThem));
        return soTietKiemRepository.save(stk);
    }

    // Thêm hàm lấy tất cả sổ
    public List<SoTietKiem> layTatCaSo() {
        return soTietKiemRepository.findAll();
    }

    // Thêm hàm lấy chi tiết 1 sổ theo ID
    public SoTietKiem laySoTheoId(Integer id) {
        return soTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sổ tiết kiệm này!"));
    }
}