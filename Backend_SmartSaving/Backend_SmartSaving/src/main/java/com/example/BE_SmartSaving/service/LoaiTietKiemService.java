package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.repository.LoaiTietKiemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LoaiTietKiemService {

    @Autowired
    private LoaiTietKiemRepository loaiTietKiemRepository;

    public List<LoaiTietKiem> layTatCa() {
        return loaiTietKiemRepository.findAll();
    }

    /** Chỉ trả về loại đang được áp dụng (dùng cho màn hình Mở Sổ Mới) */
    public List<LoaiTietKiem> layDangApDung() {
        return loaiTietKiemRepository.findByDangApDungTrue();
    }

    public LoaiTietKiem layTheoId(Integer id) {
        return loaiTietKiemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại tiết kiệm ID: " + id));
    }

    /**
     * Lấy loại không kỳ hạn (kyHanThang = 0).
     * Dùng để lấy lãi suất phạt khi khách hàng rút trước hạn.
     */
    public LoaiTietKiem layKhongKyHan() {
        return loaiTietKiemRepository.findFirstByKyHanThang(0)
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình loại tiết kiệm không kỳ hạn!"));
    }

    /** Admin cập nhật lãi suất cho một loại (QĐ6) */
    public LoaiTietKiem capNhatLaiSuat(Integer id, java.math.BigDecimal laiSuatMoi) {
        LoaiTietKiem loai = layTheoId(id);
        loai.setLaiSuatNam(laiSuatMoi);
        return loaiTietKiemRepository.save(loai);
    }

    /** Admin kích hoạt / vô hiệu hoá loại kỳ hạn (QĐ6) */
    public LoaiTietKiem toggleTrangThai(Integer id) {
        LoaiTietKiem loai = layTheoId(id);
        loai.setDangApDung(!loai.getDangApDung());
        return loaiTietKiemRepository.save(loai);
    }

    public LoaiTietKiem taoMoi(LoaiTietKiem loai) {
        return loaiTietKiemRepository.save(loai);
    }
}