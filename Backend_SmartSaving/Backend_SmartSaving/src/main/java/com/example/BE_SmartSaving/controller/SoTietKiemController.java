package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.SoTietKiemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/sotietkiem")
@CrossOrigin("*")
public class SoTietKiemController {

    @Autowired
    private SoTietKiemService soTietKiemService;

    @PostMapping("/mo-so")
    public ResponseEntity<?> moSoTietKiem(@RequestBody SoTietKiem soTietKiem) {
        try {
            SoTietKiem soMoi = soTietKiemService.moSoTietKiem(soTietKiem);
            return ResponseEntity.ok(soMoi);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/gui-them/{id}")
    public ResponseEntity<?> guiThemTien(@PathVariable Integer id, @RequestParam BigDecimal soTien) {
        try {
            SoTietKiem soCapNhat = soTietKiemService.guiThemTien(id, soTien);
            return ResponseEntity.ok(soCapNhat);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> layDanhSachSo() {
        return ResponseEntity.ok(soTietKiemService.layTatCaSo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> layChiTietSo(@PathVariable Integer id) {
        try {
            SoTietKiem soTietKiem = soTietKiemService.laySoTheoId(id);
            return ResponseEntity.ok(soTietKiem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}