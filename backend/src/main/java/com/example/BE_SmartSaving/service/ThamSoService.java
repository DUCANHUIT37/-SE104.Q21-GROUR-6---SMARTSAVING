package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import com.example.BE_SmartSaving.service.LoaiTietKiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class ThamSoService {

    @Autowired
    private ThamSoRepository thamSoRepository;

    /** WARN-02 FIX: Inject LoaiTietKiemService to read real DB rate */
    @Autowired
    @Lazy
    private LoaiTietKiemService loaiTietKiemService;

    // ─── Đọc tham số ────────────────────────────────────────────────────

    public BigDecimal laySoTienGuiToiThieu() {
        return new BigDecimal(lay("so_tien_gui_toi_thieu", "1000000"));
    }

    public BigDecimal laySoTienGuiThemToiThieu() {
        return new BigDecimal(lay("so_tien_gui_them_toi_thieu", "100000"));
    }

    public int layThoiGianGuiToiThieu() {
        return Integer.parseInt(lay("thoi_gian_gui_toi_thieu_ngay", "15"));
    }

    /** WARN-02 FIX: Lãi suất không kỳ hạn – đọc từ DB, không hardcode */
    public double layLaiSuatKhongKyHan() {
        try {
            return loaiTietKiemService.layKhongKyHan().getLaiSuatNam().doubleValue();
        } catch (Exception e) {
            return 0.005; // Fallback an toàn nếu chưa cấu hình DB
        }
    }

    // ─── Tiện ích ────────────────────────────────────────────────────────

    private String lay(String khoa, String macDinh) {
        return thamSoRepository.findByKhoa(khoa)
                .map(ThamSo::getGiaTri)
                .orElse(macDinh);
    }

    /** Lấy toàn bộ tham số (dùng cho màn hình Cài Đặt) */
    public java.util.List<ThamSo> layTatCaThamSo() {
        return thamSoRepository.findAll();
    }

    public ThamSo layTheoKhoa(String khoa) {
        return thamSoRepository.findByKhoa(khoa)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tham số: " + khoa));
    }
}