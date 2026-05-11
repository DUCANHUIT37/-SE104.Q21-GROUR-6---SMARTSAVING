package com.example.BE_SmartSaving.service;

import com.example.BE_SmartSaving.dto.BaoCaoNgayDTO;
import com.example.BE_SmartSaving.model.LoaiTietKiem;
import com.example.BE_SmartSaving.repository.LoaiTietKiemRepository;
import com.example.BE_SmartSaving.repository.PhieuGoiRepository;
import com.example.BE_SmartSaving.repository.PhieuRutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class BaoCaoService {

    @Autowired
    private LoaiTietKiemRepository loaiTietKiemRepository;
    @Autowired
    private PhieuGoiRepository phieuGoiRepository;
    @Autowired
    private PhieuRutRepository phieuRutRepository;

    public List<BaoCaoNgayDTO> lapBaoCaoDoanhSoNgay(LocalDate ngayBaoCao) {
        List<BaoCaoNgayDTO> danhSachBaoCao = new ArrayList<>();
        List<LoaiTietKiem> danhSachLoai = loaiTietKiemRepository.findAll();

        for (LoaiTietKiem loai : danhSachLoai) {
            BaoCaoNgayDTO dto = new BaoCaoNgayDTO();
            dto.setTenLoaiTietKiem(loai.getTenLoai());

            // Hỏi 2 thằng đàn em (Repository) xem hôm nay loại sổ này thu chi bao nhiêu
            BigDecimal tongThu = phieuGoiRepository.tinhTongThuTheoLoaiVaNgay(loai.getId(), ngayBaoCao);
            BigDecimal tongChi = phieuRutRepository.tinhTongChiTheoLoaiVaNgay(loai.getId(), ngayBaoCao);

            dto.setTongThu(tongThu);
            dto.setTongChi(tongChi);
            dto.setChenhLech(tongThu.subtract(tongChi));

            danhSachBaoCao.add(dto);
        }
        return danhSachBaoCao;
    }
}