package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.PhieuRut;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class PhieuRutService {
    @Autowired
    private PhieuRutRepository phieuRutRepository;
    @Autowired
    private SoTietKiemRepository soTietKiemRepository;
    @Autowired
    private ThamSoService thamSoService;

    @Transactional // Đảm bảo nếu lỗi thì không trừ tiền bậy bạ
    public PhieuRut thucHienRutTien(Integer soTietKiemId, BigDecimal soTienRut) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sổ!"));

        // 1. Check điều kiện thời gian (Hỏi luật từ ThamSoService)
        long soNgayGui = ChronoUnit.DAYS.between(stk.getNgayMo(), LocalDate.now());
        if (soNgayGui < thamSoService.layThoiGianGuiToiThieu()) {
            throw new RuntimeException("Chưa đủ " + thamSoService.layThoiGianGuiToiThieu() + " ngày để rút!");
        }

        // 2. Check số dư
        if (soTienRut.compareTo(stk.getSoDuHienTai()) > 0) {
            throw new RuntimeException("Tiền trong sổ không đủ!");
        }

        // 3. Cập nhật sổ
        stk.setSoDuHienTai(stk.getSoDuHienTai().subtract(soTienRut));
        if (stk.getSoDuHienTai().compareTo(BigDecimal.ZERO) == 0) {
            stk.setTrangThai("da_tat_toan");
        }
        soTietKiemRepository.save(stk);

        // 4. Tạo phiếu rút
        PhieuRut phieu = new PhieuRut();
        phieu.setMaPhieu("PR" + System.currentTimeMillis());
        phieu.setSoTietKiem(stk);
        phieu.setSoTienRut(soTienRut);
        phieu.setNgayRut(LocalDate.now());

        return phieuRutRepository.save(phieu);
    }
}