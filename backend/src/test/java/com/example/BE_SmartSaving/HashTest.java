package com.example.BE_SmartSaving;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashTest {
    @Test
    public void generateHash() {
        System.out.println("HASH_IS: " + new BCryptPasswordEncoder().encode("admin123"));
    }
}
