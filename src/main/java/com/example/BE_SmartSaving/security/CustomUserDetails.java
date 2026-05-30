package com.example.BE_SmartSaving.security;

import com.example.BE_SmartSaving.model.TaiKhoan;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final TaiKhoan taiKhoan;

    public CustomUserDetails(TaiKhoan taiKhoan) {
        this.taiKhoan = taiKhoan;
    }

    public TaiKhoan getTaiKhoan() {
        return taiKhoan;
    }

    public Integer getNguoiDungId() {
        return taiKhoan != null && taiKhoan.getNguoiDung() != null ? taiKhoan.getNguoiDung().getId() : null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Ánh xạ QuyenHanEnum sang role của Spring Security
        String roleName = switch (taiKhoan.getQuyenHan()) {
            case quan_tri_vien -> "ROLE_quan_tri_vien";
            case giao_dich_vien -> "ROLE_giao_dich_vien";
            case giam_doc -> "ROLE_giam_doc";
            case khach_hang -> "ROLE_khach_hang";
        };
        return Collections.singletonList(new SimpleGrantedAuthority(roleName));
    }

    @Override
    public String getPassword() {
        return taiKhoan.getMatKhauHash();
    }

    @Override
    public String getUsername() {
        return taiKhoan.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return taiKhoan.getKichHoat(); // Khoá nếu kichHoat = false
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return taiKhoan.getKichHoat();
    }
}
