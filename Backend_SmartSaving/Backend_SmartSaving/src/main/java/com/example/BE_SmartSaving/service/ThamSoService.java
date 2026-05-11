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

    // BỔ SUNG HÀM NÀY ĐỂ SOTIETKIEMSERVICE GỌI KHÔNG BỊ LỖI
    public BigDecimal laySoTienGuiToiThieu() {
        return new BigDecimal(thamSoRepository.findByKhoa("so_tien_gui_toi_thieu")
                .map(ts -> ts.getGiaTri()).orElse("1000000")); // Mặc định là 1 triệu nếu chưa có trong DB
    }

    public int layThoiGianGuiToiThieu() {
        ThamSo ts = thamSoRepository.findByKhoa("thoi_gian_gui_toi_thieu_ngay")
                .orElseThrow(() -> new RuntimeException("Chưa cài đặt luật thời gian rút!"));
        return Integer.parseInt(ts.getGiaTri());
    }

    public double layLaiSuatKhongKyHan() {
        // Sau này em có thể thêm luật lấy lãi suất từ bảng ThamSo ở đây
        return 0.005;
    }

    public BigDecimal laySoTienGuiThemToiThieu() {
        return new BigDecimal(thamSoRepository.findByKhoa("so_tien_gui_them_toi_thieu")
                .map(ts -> ts.getGiaTri()).orElse("100000"));
    }
}