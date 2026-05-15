package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.LoaiTietKiemDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.repository.LoaiTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LoaiTietKiemService {

    @Autowired
    private LoaiTietKiemRepository loaiTietKiemRepository;

    // ─────────────────────────────────────────────────────────────
    //  MAPPER: Entity → DTO
    // ─────────────────────────────────────────────────────────────
    public LoaiTietKiemDTO toDTO(LoaiTietKiem loai) {
        if (loai == null) return null;
        return LoaiTietKiemDTO.builder()
                .id(loai.getId())
                .tenLoai(loai.getTenLoai())
                .kyHanThang(loai.getKyHanThang())
                .laiSuatNam(loai.getLaiSuatNam())
                .soTienGuiToiThieu(loai.getSoTienGuiToiThieu())
                .dangApDung(loai.getDangApDung())
                .taoLuc(loai.getTaoLuc())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    //  BUSINESS METHODS (trả về DTO)
    // ─────────────────────────────────────────────────────────────

    public List<LoaiTietKiemDTO> layTatCa() {
        return loaiTietKiemRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<LoaiTietKiemDTO> layDangApDung() {
        return loaiTietKiemRepository.findByDangApDungTrue()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public LoaiTietKiemDTO layTheoId(Integer id) {
        return toDTO(layTheoIdEntity(id));
    }

    /** Dùng nội bộ (SoTietKiemService, PhieuRutService) vẫn cần Entity */
    public LoaiTietKiem layTheoIdEntity(Integer id) {
        return loaiTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại tiết kiệm ID: " + id));
    }

    public LoaiTietKiem layKhongKyHan() {
        return loaiTietKiemRepository.findFirstByKyHanThang(0)
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình loại tiết kiệm không kỳ hạn!"));
    }

    public LoaiTietKiemDTO capNhatLaiSuat(Integer id, BigDecimal laiSuatMoi) {
        LoaiTietKiem loai = layTheoIdEntity(id);
        loai.setLaiSuatNam(laiSuatMoi);
        return toDTO(loaiTietKiemRepository.save(loai));
    }

    public LoaiTietKiemDTO toggleTrangThai(Integer id) {
        LoaiTietKiem loai = layTheoIdEntity(id);
        loai.setDangApDung(!loai.getDangApDung());
        return toDTO(loaiTietKiemRepository.save(loai));
    }

    public LoaiTietKiemDTO taoMoi(LoaiTietKiem loai) {
        return toDTO(loaiTietKiemRepository.save(loai));
    }
}