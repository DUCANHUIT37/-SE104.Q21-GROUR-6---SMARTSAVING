package com.example.BE_SmartSaving.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TempCleanupController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @DeleteMapping("/api/cleanup-garbage-users")
    public String cleanup() {
        // Step 1: Identify garbage users (NguoiDung with NO TaiKhoan OR TaiKhoan with empty/null email)
        String identifySql = "SELECT nd.id FROM nguoi_dung nd LEFT JOIN tai_khoan tk ON nd.id = tk.nguoi_dung_id WHERE tk.email IS NULL OR trim(tk.email) = ''";
        
        java.util.List<Integer> garbageIds = jdbcTemplate.queryForList(identifySql, Integer.class);
        if (garbageIds.isEmpty()) {
            return "No garbage users found.";
        }
        
        String inSql = String.join(",", java.util.Collections.nCopies(garbageIds.size(), "?"));
        
        int totalDeleted = 0;
        
        // Delete dependent records
        // 1. PhieuRut
        int deletedPhieuRut = jdbcTemplate.update("DELETE FROM phieu_rut WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        
        // 2. PhieuGoi
        int deletedPhieuGoi = jdbcTemplate.update("DELETE FROM phieu_goi WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        
        // 3. LichSuGiaoDich
        int deletedLichSu = jdbcTemplate.update("DELETE FROM lich_su_giao_dich WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        
        // 4. SoTietKiem
        int deletedSo = jdbcTemplate.update("DELETE FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + ")", garbageIds.toArray());
        
        // 5. TaiKhoan
        int deletedTaiKhoan = jdbcTemplate.update("DELETE FROM tai_khoan WHERE nguoi_dung_id IN (" + inSql + ")", garbageIds.toArray());
        
        // 6. NguoiDung
        int deletedNguoiDung = jdbcTemplate.update("DELETE FROM nguoi_dung WHERE id IN (" + inSql + ")", garbageIds.toArray());
        
        return String.format("Cleanup Successful! Deleted: %d PhieuRut, %d PhieuGoi, %d LichSuGiaoDich, %d SoTietKiem, %d TaiKhoan, %d NguoiDung", 
            deletedPhieuRut, deletedPhieuGoi, deletedLichSu, deletedSo, deletedTaiKhoan, deletedNguoiDung);
    }
}
