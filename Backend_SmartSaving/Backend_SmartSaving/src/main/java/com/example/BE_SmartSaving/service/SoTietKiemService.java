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

    @Autowired
    private ThamSoService thamSoService;

    public SoTietKiem moSoTietKiem(SoTietKiem soTietKiem) {
        BigDecimal minMoSo = thamSoService.laySoTienGuiToiThieu();
        if (soTietKiem.getSoTienBanDau().compareTo(minMoSo) < 0) {
            throw new RuntimeException("Số tiền gửi ban đầu tối thiểu phải là " + minMoSo + " VNĐ");
        }
        soTietKiem.setSoDuHienTai(soTietKiem.getSoTienBanDau());
        soTietKiem.setTrangThai("dang_hoat_dong");
        return soTietKiemRepository.save(soTietKiem);
    }

    public List<SoTietKiem> layTatCaSo() {
        return soTietKiemRepository.findAll();
    }

    public SoTietKiem laySoTheoId(Integer id) {
        return soTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sổ tiết kiệm ID: " + id));
    }

    public void xoaSo(Integer id) {
        soTietKiemRepository.deleteById(id);
    }
}