package com.example.demo.repository;

import com.example.demo.model.NguoiDung; // Dòng này để nó nhận diện được class NguoiDung em vừa tạo
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Đánh dấu đây là Cánh tay robot (kho chứa)
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {

    // Tạm thời để trống!
    // Mặc dù trống trơn nhưng nhờ kế thừa JpaRepository,
    // em đã có sẵn cả chục hàm thao tác với Database rồi đó.

    // Bật mí: Sau này nếu muốn tìm khách hàng theo CMND, em chỉ cần khai báo:
    // NguoiDung findByCmnd(String cmnd);
    // Spring Boot sẽ tự viết SQL cho em luôn!
}