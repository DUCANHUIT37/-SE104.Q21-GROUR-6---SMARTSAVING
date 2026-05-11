package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.model.SoTietKiem;
import com.example.BE_SmartSaving.service.PhieuGoiService;
import com.example.BE_SmartSaving.service.PhieuRutService;
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

    @Autowired
    private PhieuRutService phieuRutService;

    @Autowired
    private PhieuGoiService phieuGoiService; // MỚI THÊM

    @PostMapping("/mo-so")
    public ResponseEntity<?> moSo(@RequestBody SoTietKiem soTietKiem) {
        try {
            return ResponseEntity.ok(soTietKiemService.moSoTietKiem(soTietKiem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> layDanhSach() {
        return ResponseEntity.ok(soTietKiemService.layTatCaSo());
    }

    @PostMapping("/rut-tien/{id}")
    public ResponseEntity<?> rutTien(@PathVariable Integer id, @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuRutService.thucHienRutTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @PutMapping("/gui-them/{id}")
    public ResponseEntity<?> guiThemTien(@PathVariable Integer id, @RequestParam BigDecimal soTien) {
        try {
            return ResponseEntity.ok(phieuGoiService.thucHienGuiTien(id, soTien));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}