package com.example.BE_SmartSaving;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class CleanJDBC {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require";
        String user = "postgres.szfpfpimovdgmrixpovj";
        String password = "smartsaving123@";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("====== STARTING CLEANUP OPERATION (RAW JDBC) ======");
            conn.setAutoCommit(false);
            
            String identifySql = "SELECT nd.id FROM nguoi_dung nd LEFT JOIN tai_khoan tk ON nd.id = tk.nguoi_dung_id WHERE tk.email IS NULL OR trim(tk.email) = ''";
            
            List<Integer> garbageIds = new ArrayList<>();
            try (PreparedStatement pstmt = conn.prepareStatement(identifySql);
                 ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    garbageIds.add(rs.getInt("id"));
                }
            }
            
            if (garbageIds.isEmpty()) {
                System.out.println("No garbage users found.");
                conn.commit();
                return;
            }
            
            System.out.println("Found " + garbageIds.size() + " garbage users.");
            
            String inSql = String.join(",", java.util.Collections.nCopies(garbageIds.size(), "?"));
            
            int[] deletedCounts = new int[6];
            String[] queries = {
                "DELETE FROM phieu_rut WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))",
                "DELETE FROM phieu_goi WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))",
                "DELETE FROM lich_su_giao_dich WHERE so_tiet_kiem_id IN (SELECT id FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + "))",
                "DELETE FROM so_tiet_kiem WHERE khach_hang_id IN (" + inSql + ")",
                "DELETE FROM tai_khoan WHERE nguoi_dung_id IN (" + inSql + ")",
                "DELETE FROM nguoi_dung WHERE id IN (" + inSql + ")"
            };
            
            for (int i = 0; i < queries.length; i++) {
                try (PreparedStatement pstmt = conn.prepareStatement(queries[i])) {
                    for (int j = 0; j < garbageIds.size(); j++) {
                        pstmt.setInt(j + 1, garbageIds.get(j));
                    }
                    deletedCounts[i] = pstmt.executeUpdate();
                }
            }
            
            System.out.println("Deleted PhieuRut: " + deletedCounts[0]);
            System.out.println("Deleted PhieuGoi: " + deletedCounts[1]);
            System.out.println("Deleted LichSuGiaoDich: " + deletedCounts[2]);
            System.out.println("Deleted SoTietKiem: " + deletedCounts[3]);
            System.out.println("Deleted TaiKhoan: " + deletedCounts[4]);
            System.out.println("Deleted NguoiDung: " + deletedCounts[5]);
            
            conn.commit();
            System.out.println("====== CLEANUP COMPLETED SUCCESSFULLY ======");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
