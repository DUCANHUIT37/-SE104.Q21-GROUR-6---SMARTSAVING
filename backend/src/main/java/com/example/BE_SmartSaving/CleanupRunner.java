package com.example.BE_SmartSaving;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CleanupRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("====== STARTING CLEANUP OPERATION ======");
        
        String identifySql = "SELECT nd.id FROM nguoi_dung nd LEFT JOIN tai_khoan tk ON nd.id = tk.nguoi_dung_id WHERE tk.email IS NULL OR trim(tk.email) = ''";
        
        java.util.List<Integer> garbageIds = jdbcTemplate.queryForList(identifySql, Integer.class);
        if (garbageIds.isEmpty()) {
            System.out.println("No garbage users found.");
            System.exit(0);
        }
        
        System.out.println("Found " + garbageIds.size() + " garbage users.");
        
        String inSql = String.join(",", java.util.Collections.nCopies(garbageIds.size(), "?"));
        
        int deletedPhieuRut = jdbcTemplate.update("DELETE FROM phieu_rut WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        System.out.println("Deleted PhieuRut: " + deletedPhieuRut);
        
        int deletedPhieuGoi = jdbcTemplate.update("DELETE FROM phieu_goi WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        System.out.println("Deleted PhieuGoi: " + deletedPhieuGoi);
        
        int deletedLichSu = jdbcTemplate.update("DELETE FROM lich_su_giao_dich WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))", garbageIds.toArray());
        System.out.println("Deleted LichSuGiaoDich: " + deletedLichSu);
        
        int deletedSo = jdbcTemplate.update("DELETE FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + ")", garbageIds.toArray());
        System.out.println("Deleted SoTietKiem: " + deletedSo);
        
        int deletedTaiKhoan = jdbcTemplate.update("DELETE FROM tai_khoan WHERE nguoi_dung_id IN (" + inSql + ")", garbageIds.toArray());
        System.out.println("Deleted TaiKhoan: " + deletedTaiKhoan);
        
        int deletedNguoiDung = jdbcTemplate.update("DELETE FROM nguoi_dung WHERE id IN (" + inSql + ")", garbageIds.toArray());
        System.out.println("Deleted NguoiDung: " + deletedNguoiDung);
        
        System.out.println("====== CLEANUP COMPLETED SUCCESSFULLY ======");
        System.exit(0);
    }
}
