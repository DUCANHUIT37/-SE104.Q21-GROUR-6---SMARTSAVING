package com.example.BE_SmartSaving.controller;

import com.example.BE_SmartSaving.dto.ApiResponse;
import com.example.BE_SmartSaving.dto.AuthResponseDTO;
import com.example.BE_SmartSaving.dto.LoginRequestDTO;
import com.example.BE_SmartSaving.security.CustomUserDetails;
import com.example.BE_SmartSaving.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

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

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    ApiResponse.error(401, "Email hoặc mật khẩu không chính xác")
            );
        }
    }
}
