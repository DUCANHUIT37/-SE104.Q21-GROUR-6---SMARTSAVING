package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.LichSuGiaoDich;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.LichSuGiaoDichRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LichSuGiaoDichService {

    @Autowired
    private LichSuGiaoDichRepository lichSuGiaoDichRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    /**
     * Ghi một bản ghi giao dịch vào audit trail.
     *
     * @param stk       Sổ liên quan
     * @param loai      Loại giao dịch
     * @param soTien    Dương = tiền vào, Âm = tiền ra
     * @param soDuTruoc Số dư trước giao dịch
     * @param soDuSau   Số dư sau giao dịch
     * @param ghiChu    Mô tả thêm
     */
    public LichSuGiaoDich ghi(SoTietKiem stk,
                              LichSuGiaoDich.LoaiGiaoDichEnum loai,
                              BigDecimal soTien,
                              BigDecimal soDuTruoc,
                              BigDecimal soDuSau,
                              String ghiChu) {
        LichSuGiaoDich ls = new LichSuGiaoDich();
        ls.setMaGiaoDich("GD" + LocalDateTime.now().format(FMT));
        ls.setSoTietKiem(stk);
        ls.setLoaiGiaoDich(loai);
        ls.setSoTien(soTien);
        ls.setSoDuTruoc(soDuTruoc);
        ls.setSoDuSau(soDuSau);
        ls.setGhiChu(ghiChu);
        return lichSuGiaoDichRepository.save(ls);
    }

    /** Lấy toàn bộ lịch sử của một sổ, sắp xếp mới nhất trước */
    public List<LichSuGiaoDich> layTheoSo(Integer soTietKiemId) {
        return lichSuGiaoDichRepository
                .findBySoTietKiemIdOrderByThoiGianDesc(soTietKiemId);
    }
}