package com.example.BE_SmartSaving.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TongQuanDTO {
    private long tongKhachHang;
    private long tongSoTietKiem;
    private BigDecimal tongSoDu;
    private BigDecimal doanhThuHomNay;
}
