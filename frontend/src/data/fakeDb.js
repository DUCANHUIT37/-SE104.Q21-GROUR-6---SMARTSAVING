// ============================================================
// FAKE DATABASE — SmartSavings
// Dữ liệu mẫu cho toàn bộ hệ thống, thay thế API thực tế
// ============================================================

// --- Loại Tiết Kiệm (Tham số hệ thống) ---
export const loaiTietKiemData = [
  { id: 1, tenLoai: 'Không kỳ hạn', kyHanThang: 0, laiSuatNam: 0.5, soTienGuiToiThieu: 1000000, dangApDung: true },
  { id: 2, tenLoai: 'Kỳ hạn 3 tháng', kyHanThang: 3, laiSuatNam: 5.0, soTienGuiToiThieu: 1000000, dangApDung: true },
  { id: 3, tenLoai: 'Kỳ hạn 6 tháng', kyHanThang: 6, laiSuatNam: 5.5, soTienGuiToiThieu: 1000000, dangApDung: true },
  { id: 4, tenLoai: 'Kỳ hạn 12 tháng', kyHanThang: 12, laiSuatNam: 7.0, soTienGuiToiThieu: 1000000, dangApDung: true },
];

// --- Tham Số Hệ Thống ---
export const thamSoData = {
  soTienGuiToiThieu: 1000000,
  soTienGuiThemToiThieu: 100000,
  soNgayGuiToiThieu: 15,
};

// --- Khách Hàng ---
export const khachHangData = [
  { id: 1, hoTen: 'Nguyễn Văn An', cmnd: '012345678901', diaChi: '123 Lê Lợi, Q.1, TP.HCM', soDienThoai: '0901234567' },
  { id: 2, hoTen: 'Trần Thị Bích', cmnd: '098765432100', diaChi: '456 Nguyễn Huệ, Q.1, TP.HCM', soDienThoai: '0912345678' },
  { id: 3, hoTen: 'Lê Quốc Cường', cmnd: '011223344556', diaChi: '789 Đồng Khởi, Q.1, TP.HCM', soDienThoai: '0923456789' },
  { id: 4, hoTen: 'Phạm Thị Dung', cmnd: '033445566778', diaChi: '101 Lý Tự Trọng, Q.3, TP.HCM', soDienThoai: '0934567890' },
  { id: 5, hoTen: 'Hoàng Văn Em', cmnd: '055667788990', diaChi: '202 Nam Kỳ Khởi Nghĩa, Q.3, TP.HCM', soDienThoai: '0945678901' },
];

// --- Sổ Tiết Kiệm ---
export const soTietKiemData = [
  {
    id: 1, maSo: 'SS2026001', khachHangId: 1, loaiTietKiemId: 2,
    soTienBanDau: 50000000, soDuHienTai: 55000000,
    laiSuatMoSo: 5.0, ngayMo: '2026-01-15', ngayDaoHan: '2026-04-15',
    trangThai: 'dang_hoat_dong',
  },
  {
    id: 2, maSo: 'SS2026002', khachHangId: 2, loaiTietKiemId: 3,
    soTienBanDau: 100000000, soDuHienTai: 102000000,
    laiSuatMoSo: 5.5, ngayMo: '2026-02-01', ngayDaoHan: '2026-08-01',
    trangThai: 'dang_hoat_dong',
  },
  {
    id: 3, maSo: 'SS2026003', khachHangId: 3, loaiTietKiemId: 1,
    soTienBanDau: 20000000, soDuHienTai: 20050000,
    laiSuatMoSo: 0.5, ngayMo: '2026-03-10', ngayDaoHan: null,
    trangThai: 'dang_hoat_dong',
  },
  {
    id: 4, maSo: 'SS2026004', khachHangId: 4, loaiTietKiemId: 4,
    soTienBanDau: 200000000, soDuHienTai: 214000000,
    laiSuatMoSo: 7.0, ngayMo: '2026-01-01', ngayDaoHan: '2027-01-01',
    trangThai: 'dang_hoat_dong',
  },
  {
    id: 5, maSo: 'SS2025010', khachHangId: 5, loaiTietKiemId: 2,
    soTienBanDau: 30000000, soDuHienTai: 0,
    laiSuatMoSo: 5.0, ngayMo: '2025-10-01', ngayDaoHan: '2026-01-01',
    trangThai: 'da_tat_toan',
  },
];

// --- Lịch Sử Giao Dịch ---
export const lichSuGiaoDichData = [
  { id: 1, maGiaoDich: 'GD202601001', soTietKiemId: 1, loaiGiaoDich: 'mo_so', soTien: 50000000, soDuTruoc: 0, soDuSau: 50000000, ghiChu: 'Mở sổ tiết kiệm kỳ hạn 3 tháng', thoiGian: '2026-01-15T08:30:00' },
  { id: 2, maGiaoDich: 'GD202601002', soTietKiemId: 2, loaiGiaoDich: 'mo_so', soTien: 100000000, soDuTruoc: 0, soDuSau: 100000000, ghiChu: 'Mở sổ tiết kiệm kỳ hạn 6 tháng', thoiGian: '2026-02-01T09:00:00' },
  { id: 3, maGiaoDich: 'GD202601003', soTietKiemId: 3, loaiGiaoDich: 'mo_so', soTien: 20000000, soDuTruoc: 0, soDuSau: 20000000, ghiChu: 'Mở sổ tiết kiệm không kỳ hạn', thoiGian: '2026-03-10T10:15:00' },
  { id: 4, maGiaoDich: 'GD202604001', soTietKiemId: 1, loaiGiaoDich: 'goi_them', soTien: 5000000, soDuTruoc: 50000000, soDuSau: 55000000, ghiChu: 'Gởi thêm tiền đúng kỳ hạn', thoiGian: '2026-04-15T14:00:00' },
  { id: 5, maGiaoDich: 'GD202603002', soTietKiemId: 3, loaiGiaoDich: 'goi_them', soTien: 50000, soDuTruoc: 20000000, soDuSau: 20050000, ghiChu: 'Tính lãi không kỳ hạn', thoiGian: '2026-03-25T11:00:00' },
  { id: 6, maGiaoDich: 'GD202601004', soTietKiemId: 4, loaiGiaoDich: 'mo_so', soTien: 200000000, soDuTruoc: 0, soDuSau: 200000000, ghiChu: 'Mở sổ tiết kiệm kỳ hạn 12 tháng', thoiGian: '2026-01-01T08:00:00' },
  { id: 7, maGiaoDich: 'GD202504003', soTietKiemId: 5, loaiGiaoDich: 'mo_so', soTien: 30000000, soDuTruoc: 0, soDuSau: 30000000, ghiChu: 'Mở sổ', thoiGian: '2025-10-01T09:00:00' },
  { id: 8, maGiaoDich: 'GD202601005', soTietKiemId: 5, loaiGiaoDich: 'tat_toan', soTien: -31500000, soDuTruoc: 30000000, soDuSau: 0, ghiChu: 'Tất toán sổ, bao gồm lãi', thoiGian: '2026-01-01T15:00:00' },
];

// --- Tài Khoản Người Dùng ---
export const taiKhoanData = [
  { id: 1, email: 'admin@gmail.com', hoTen: 'Admin Hệ Thống', quyenHan: 'ADMIN', kichHoat: true },
  { id: 2, email: 'giaodichvien@gmail.com', hoTen: 'Nguyễn Thanh Lan', quyenHan: 'TELLER', kichHoat: true },
  { id: 3, email: 'khachhang@gmail.com', hoTen: 'Nguyễn Văn An', quyenHan: 'USER', kichHoat: true },
];

// --- Helper: tạo mã tự động ---
export const generateMaSo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 900) + 100;
  return `SS${year}${rand}`;
};

export const generateMaGiaoDich = (prefix = 'GD') => {
  const now = new Date();
  const ts = now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  return `${prefix}${ts}`;
};

// --- Helper: tính số ngày giữa 2 mốc ---
export const soNgayGiua = (d1, d2) => {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.floor(Math.abs(t2 - t1) / (1000 * 60 * 60 * 24));
};

// --- Helper: tính lãi ---
export const tinhTienLai = (soDu, laiSuatNam, soNgay) => {
  return Math.floor((soDu * (laiSuatNam / 100) * soNgay) / 365);
};
