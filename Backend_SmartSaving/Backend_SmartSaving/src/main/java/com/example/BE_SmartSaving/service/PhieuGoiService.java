package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.PhieuGoi;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.SoTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PhieuGoiService {

    @Autowired
    private PhieuGoiRepository phieuGoiRepository;

    @Autowired
    private SoTietKiemRepository soTietKiemRepository;

    @Autowired
    private ThamSoService thamSoService;

    @Transactional
    public PhieuGoi thucHienGuiTien(Integer soTietKiemId, BigDecimal soTienGoi) {
        SoTietKiem stk = soTietKiemRepository.findById(soTietKiemId)
                .orElseThrow(() -> new RuntimeException("Sổ không tồn tại!"));

        if ("da_tat_toan".equals(stk.getTrangThai())) {
            throw new RuntimeException("Sổ đã đóng, không thể gửi thêm tiền!");
        }

        BigDecimal minGuiThem = thamSoService.laySoTienGuiThemToiThieu();
        if (soTienGoi.compareTo(minGuiThem) < 0) {
            throw new RuntimeException("Số tiền gửi thêm tối thiểu phải là " + minGuiThem + " VNĐ");
        }

        stk.setSoDuHienTai(stk.getSoDuHienTai().add(soTienGoi));
        soTietKiemRepository.save(stk);

        PhieuGoi pg = new PhieuGoi();
        pg.setMaPhieu("PG" + System.currentTimeMillis());
        pg.setSoTietKiem(stk);
        pg.setSoTienGoi(soTienGoi);
        pg.setNgayGoi(LocalDate.now());

        return phieuGoiRepository.save(pg);
    }
}