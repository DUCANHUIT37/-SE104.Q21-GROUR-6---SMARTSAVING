package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.AuthResponseDTO;
import com.example.BE_SmartSaving.dto.LoginRequestDTO;
import com.example.BE_SmartSaving.security.CustomUserDetails;
import com.example.BE_SmartSaving.security.JwtUtil;
import com.example.BE_SmartSaving.dto.RegisterRequestDTO;
import com.example.BE_SmartSaving.model.NguoiDung;
import com.example.BE_SmartSaving.model.TaiKhoan;
import com.example.BE_SmartSaving.repository.NguoiDungRepository;
import com.example.BE_SmartSaving.repository.TaiKhoanRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Autowired
    private TaiKhoanRepository taiKhoanRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@RequestBody LoginRequestDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMatKhau())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            
            // Generate token
            String role = userDetails.getAuthorities().iterator().next().getAuthority();
            Integer nguoiDungId = userDetails.getTaiKhoan().getNguoiDung().getId();
            String token = jwtUtil.generateToken(userDetails.getUsername(), role, nguoiDungId);

            AuthResponseDTO responseDTO = AuthResponseDTO.builder()
                    .token(token)
                    .nguoiDungId(nguoiDungId)
                    .hoTen(userDetails.getTaiKhoan().getNguoiDung().getHoTen())
                    .quyenHan(role)
                    .build();

            return ResponseEntity.ok(
                    ApiResponse.success(responseDTO)
            );

        } catch (org.springframework.security.authentication.DisabledException | org.springframework.security.authentication.LockedException e) {
            return ResponseEntity.status(403).body(
                    ApiResponse.error(403, "Tài khoản của bạn đã bị khoá. Vui lòng liên hệ Admin.")
            );
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error(401, "Email hoặc mật khẩu không chính xác")
            );
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody RegisterRequestDTO request) {
        try {
            if (taiKhoanRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "Email đã tồn tại!"));
            }
            if (nguoiDungRepository.findByCmnd(request.getCmnd()).isPresent()) {
                return ResponseEntity.badRequest().body(ApiResponse.error(400, "CMND đã tồn tại trong hệ thống!"));
            }

            NguoiDung nguoiDung = new NguoiDung();
            nguoiDung.setHoTen(request.getHoTen());
            nguoiDung.setCmnd(request.getCmnd());
            nguoiDung.setDiaChi("Chưa cập nhật");
            nguoiDung.setSoDienThoai("");
            nguoiDung.setLoaiNguoiDung(NguoiDung.LoaiNguoiDungEnum.khach_hang);
            nguoiDung.setTaoLuc(java.time.LocalDateTime.now());
            nguoiDung = nguoiDungRepository.save(nguoiDung);

            TaiKhoan taiKhoan = new TaiKhoan();
            taiKhoan.setEmail(request.getEmail());
            taiKhoan.setMatKhauHash(passwordEncoder.encode(request.getMatKhau()));
            taiKhoan.setQuyenHan(TaiKhoan.QuyenHanEnum.khach_hang);
            taiKhoan.setKichHoat(true);
            taiKhoan.setTaoLuc(java.time.LocalDateTime.now());
            taiKhoan.setNguoiDung(nguoiDung);
            taiKhoanRepository.save(taiKhoan);

            return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(500, "Lỗi server: " + e.getMessage()));
        }
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> pingSystem() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "SmartSavings Backend is awake and active.");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }
}
