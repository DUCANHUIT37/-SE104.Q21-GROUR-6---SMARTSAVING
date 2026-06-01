UPDATE nguoi_dung 
SET dia_chi = (
    ARRAY[
        'Quận Bình Tân, TP.HCM',
        'Dĩ An, Bình Dương',
        'Khu phố 6, Linh Trung, Thủ Đức, TP.HCM',
        'Quận 7, TP.HCM',
        'Quận 1, TP.HCM'
    ]
)[floor(random() * 5 + 1)]
WHERE dia_chi IS NULL OR dia_chi = '' OR dia_chi ILIKE '%chưa cập nhật%';
