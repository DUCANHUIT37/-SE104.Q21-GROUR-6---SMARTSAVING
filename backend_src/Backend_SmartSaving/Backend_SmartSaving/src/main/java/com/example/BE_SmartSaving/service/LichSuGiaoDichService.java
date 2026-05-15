package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.LichSuGiaoDichDTO;
import com.example.BE_SmartSaving.model.LichSuGiaoDich;
import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.repository.LichSuGiaoDichRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LichSuGiaoDichService {

    @Autowired
    private LichSuGiaoDichRepository lichSuGiaoDichRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    // ─────────────────────────────────────────────────────────────
    //  MAPPER: Entity → DTO
    // ─────────────────────────────────────────────────────────────
    public LichSuGiaoDichDTO toDTO(LichSuGiaoDich ls) {
        if (ls == null) return null;
        return LichSuGiaoDichDTO.builder()
                .id(ls.getId())
                .maGiaoDich(ls.getMaGiaoDich())
                // Flatten ManyToOne: soTietKiem
                .soTietKiemId(ls.getSoTietKiem() != null ? ls.getSoTietKiem().getId() : null)
                .soTietKiemMaSo(ls.getSoTietKiem() != null ? ls.getSoTietKiem().getMaSo() : null)
                .loaiGiaoDich(ls.getLoaiGiaoDich() != null ? ls.getLoaiGiaoDich().name() : null)
                .soTien(ls.getSoTien())
                .soDuTruoc(ls.getSoDuTruoc())
                .soDuSau(ls.getSoDuSau())
                .ghiChu(ls.getGhiChu())
                .thoiGian(ls.getThoiGian())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    //  BUSINESS METHODS
    // ─────────────────────────────────────────────────────────────

    /**
     * Ghi một bản ghi giao dịch vào audit trail.
     * (Vẫn trả về Entity – dùng nội bộ bởi PhieuRutService, PhieuGoiService)
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
        ls.setThoiGian(LocalDateTime.now());
        return lichSuGiaoDichRepository.save(ls);
    }

    /** Lấy toàn bộ lịch sử của một sổ, sắp xếp mới nhất trước – trả về DTO */
    public List<LichSuGiaoDichDTO> layTheoSo(Integer soTietKiemId) {
        return lichSuGiaoDichRepository
                .findBySoTietKiemIdOrderByThoiGianDesc(soTietKiemId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /** Lấy toàn bộ lịch sử giao dịch của hệ thống, sắp xếp mới nhất trước – trả về DTO */
    public List<LichSuGiaoDichDTO> layTatCaGiaoDich() {
        return lichSuGiaoDichRepository
                .findAllByOrderByThoiGianDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}