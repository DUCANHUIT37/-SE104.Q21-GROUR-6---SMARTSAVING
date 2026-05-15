package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class ThamSoService {

    @Autowired
    private ThamSoRepository thamSoRepository;

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

    /** Lãi suất không kỳ hạn – lấy từ bảng LOAITIETKIEM, nhưng dùng fallback */
    public double layLaiSuatKhongKyHan() {
        return 0.005; // 0,5%/năm – được set qua LoaiTietKiemService
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