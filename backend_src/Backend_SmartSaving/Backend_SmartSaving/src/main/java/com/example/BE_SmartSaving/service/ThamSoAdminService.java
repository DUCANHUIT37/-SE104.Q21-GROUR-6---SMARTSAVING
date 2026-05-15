package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.model.LichSuThamSo;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.ThamSo;
import com.example.BE_SmartSaving.repository.LichSuThamSoRepository;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.ThamSoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Dùng cho Admin thay đổi tham số hệ thống (QĐ6).
 * Mỗi lần thay đổi tự động ghi vào LICHSUTHAMSO để kiểm toán.
 */
@Service
public class ThamSoAdminService {

    @Autowired
    private ThamSoRepository thamSoRepository;
    @Autowired
    private LichSuThamSoRepository lichSuThamSoRepository;
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    /**
     * Cập nhật giá trị tham số và ghi lịch sử.
     *
     * @param khoa          Khoá tham số (ví dụ: "so_tien_gui_toi_thieu")
     * @param giaTriMoi     Giá trị mới dạng String
     * @param adminId       ID của NguoiDung thực hiện thay đổi (null nếu chưa có auth)
     * @param lyDo          Lý do thay đổi (tuỳ chọn)
     */
    @Transactional
    public ThamSo capNhatThamSo(String khoa, String giaTriMoi,
                                Integer adminId, String lyDo) {
        ThamSo ts = thamSoRepository.findByKhoa(khoa)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tham số: " + khoa));

        String giaTriCu = ts.getGiaTri();

        // Validate không cho lưu rỗng
        if (giaTriMoi == null || giaTriMoi.isBlank()) {
            throw new RuntimeException("Giá trị mới không được để trống!");
        }

        // Ghi lịch sử trước khi cập nhật
        LichSuThamSo lichSu = new LichSuThamSo();
        lichSu.setThamSo(ts);
        lichSu.setGiaTriCu(giaTriCu);
        lichSu.setGiaTriMoi(giaTriMoi);
        lichSu.setLyDo(lyDo);
        if (adminId != null) {
            nguoiDungRepository.findById(adminId).ifPresent(lichSu::setCapNhatBoi);
        }
        lichSuThamSoRepository.save(lichSu);

        // Cập nhật tham số
        ts.setGiaTri(giaTriMoi);
        if (adminId != null) {
            nguoiDungRepository.findById(adminId).ifPresent(ts::setCapNhatBoi);
        }
        return thamSoRepository.save(ts);
    }

    public List<LichSuThamSo> layLichSuThayDoi(String khoa) {
        ThamSo ts = thamSoRepository.findByKhoa(khoa)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tham số: " + khoa));
        return lichSuThamSoRepository.findByThamSoIdOrderByThoiGianDesc(ts.getId());
    }
}