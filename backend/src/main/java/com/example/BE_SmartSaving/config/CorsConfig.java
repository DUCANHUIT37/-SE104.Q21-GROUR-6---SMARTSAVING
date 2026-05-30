package com.example.BE_SmartSaving.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

/**
 * Cấu hình CORS toàn cục – thay thế @CrossOrigin("*") rải rác trên từng Controller.
 * Hỗ trợ local dev (localhost) và production (Render, Vercel, Netlify).
 * Đảm bảo Preflight OPTIONS không bị chặn.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> origins = new ArrayList<>(List.of(
                // Local development
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*:*",
                "http://10.*.*:*",
                "http://172.16.*:*",
                "http://*.local:*",
                // Production: Render.com, Vercel, Netlify
                "https://*.onrender.com",
                "https://*.vercel.app",
                "https://*.netlify.app"
        ));

        // Thêm custom domain từ biến môi trường nếu có
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            origins.add(frontendUrl);
        }

        registry.addMapping("/api/**")
                .allowedOriginPatterns(origins.toArray(new String[0]))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Disposition")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

