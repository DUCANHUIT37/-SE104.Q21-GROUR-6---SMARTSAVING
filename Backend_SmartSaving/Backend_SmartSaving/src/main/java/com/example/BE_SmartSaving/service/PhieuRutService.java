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

    @Transactional
    public PhieuRut thucHienRutTien(Integer soTietKiemId, BigDecimal soTienRut) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        long soNgayGui = ChronoUnit.DAYS.between(stk.getNgayMo(), LocalDate.now());
        if (soNgayGui < thamSoService.layThoiGianGuiToiThieu()) {
            throw new RuntimeException("Chưa đủ " + thamSoService.layThoiGianGuiToiThieu() + " ngày để rút!");
        }

        if (soTienRut.compareTo(stk.getSoDuHienTai()) > 0) {
            throw new RuntimeException("Số dư không đủ!");
        }

        stk.setSoDuHienTai(stk.getSoDuHienTai().subtract(soTienRut));
        if (stk.getSoDuHienTai().compareTo(BigDecimal.ZERO) == 0) {
            stk.setTrangThai("da_tat_toan");
        }
        soTietKiemRepository.save(stk);

        PhieuRut pr = new PhieuRut();
        pr.setMaPhieu("PR" + System.currentTimeMillis());
        pr.setSoTietKiem(stk);
        pr.setSoTienRut(soTienRut);
        pr.setNgayRut(LocalDate.now());
        return phieuRutRepository.save(pr);
    }
}