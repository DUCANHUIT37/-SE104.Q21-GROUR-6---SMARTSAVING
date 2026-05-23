package com.example.BE_SmartSaving.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình CORS toàn cục – thay thế @CrossOrigin("*") rải rác trên từng Controller.
 * Cho phép Vite dev server (localhost:5173) và CRA (localhost:3000) gọi API.
 * Đảm bảo Preflight OPTIONS không bị chặn.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://192.168.*:*",
                        "http://10.*.*:*",
                        "http://172.16.*:*",
                        "http://*.local:*"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Disposition")
                .allowCredentials(true)
                .maxAge(3600); // Cache preflight response 1 hour
    }
}
