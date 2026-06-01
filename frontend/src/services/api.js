import axios from 'axios';
// ─── Axios Instance ────────────────────────────────────────────────────────────
// Ưu tiên biến môi trường VITE_API_URL (set trên Vercel dashboard)
// Fallback về localhost:8080 khi chạy local dev
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://localhost:8080/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});


// ─── Request Interceptor ───────────────────────────────────────────────────────
// Tự động gắn JWT token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ─── Response Interceptor ─────────────────────────────────────────────────────
// Bắt lỗi 401 (Token hết hạn sau 1 tiếng) → xóa token & về Login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_info');
      // Dispatch custom event để các component có thể lắng nghe nếu cần
      window.dispatchEvent(new CustomEvent('auth:expired'));
      // Redirect về login
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, matKhau) =>
    api.post('/auth/login', { email, matKhau }),
};

// ─── Sổ Tiết Kiệm API ─────────────────────────────────────────────────────────
export const soTietKiemApi = {
  layDanhSach: () =>
    api.get('/sotietkiem'),
  timKiem: (q) =>
    api.get('/sotietkiem/tim-kiem', { params: { q } }),
  layTheoId: (id) =>
    api.get(`/sotietkiem/${id}`),
  moSoMoi: (data) =>
    api.post('/sotietkiem/mo-so', data),
  guiThemTien: (id, soTien) =>
    api.put(`/sotietkiem/gui-them/${id}`, null, { params: { soTien } }),
  rutTien: (id, soTien) =>
    api.post(`/sotietkiem/rut-tien/${id}`, null, { params: { soTien } }),
  xoaSo: (id) =>
    api.delete(`/sotietkiem/${id}`),
  layTheoKhachHang: (khachHangId) =>
    api.get(`/sotietkiem/khach-hang/${khachHangId}`),
  tinhToanRut: (id) =>
    api.get(`/sotietkiem/${id}/tinh-toan-rut`),
};

// ─── Loại Tiết Kiệm API ───────────────────────────────────────────────────────
export const loaiTietKiemApi = {
  layDangApDung: () =>
    api.get('/loaitietkiem/dang-ap-dung'),
  layTatCa: () =>
    api.get('/loaitietkiem'),
  taoMoi: (data) =>
    api.post('/loaitietkiem', data),
  capNhatLaiSuat: (id, laiSuat) =>
    api.put(`/loaitietkiem/${id}/lai-suat`, null, { params: { laiSuat } }),
  toggleTrangThai: (id) =>
    api.put(`/loaitietkiem/${id}/toggle`),
};

// ─── Người Dùng API ───────────────────────────────────────────────────────────
export const nguoiDungApi = {
  layTatCa: () =>
    api.get('/nguoidung'),
  layKhachHang: () =>
    api.get('/nguoidung/khach-hang'),
  layTheoId: (id) =>
    api.get(`/nguoidung/${id}`),
  // BUG-01 FIX: Targeted CMND lookup instead of fetching all customers
  layTheoCmnd: (cmnd) =>
    api.get(`/nguoidung/cmnd/${cmnd}`),
  timKiemCmnd: async (query) => {
    const res = await api.get('/nguoidung/khach-hang');
    const filtered = res.data.data.filter(u => u.cmnd && u.cmnd.includes(query));
    return { data: { data: filtered } };
  },
  // WARN-03 FIX: Add update and create endpoints
  capNhat: (id, data) =>
    api.put(`/nguoidung/${id}`, data),
  taoMoi: (data) =>
    api.post('/nguoidung', data),
  thangCapTeller: (id) =>
    api.put(`/nguoidung/${id}/promote-to-teller`),
  haQuyenUser: (id) =>
    api.put(`/nguoidung/${id}/demote-to-user`),
  toggleKichHoat: (id) =>
    api.put(`/nguoidung/${id}/toggle-status`),
  xoa: (id) =>
    api.delete(`/nguoidung/${id}`),
};

// ─── Báo Cáo API ──────────────────────────────────────────────────────────────
export const baoCaoApi = {
  tongQuan: () =>
    api.get('/baocao/tong-quan'),
  theo_ngay: (ngay) =>
    api.get('/baocao/ngay', { params: { ngay } }),
  // BUG-05 FIX: Backend expects single 'thang' param in YYYY-MM format
  theo_thang: (nam, thang) =>
    api.get('/baocao/thang', { params: { thang: `${nam}-${String(thang).padStart(2, '0')}` } }),
};

// ─── Lịch Sử Giao Dịch API ────────────────────────────────────────────────────
export const giaoDichApi = {
  layTatCa: () =>
    api.get('/sotietkiem/giao-dich'),
};

// ─── Tham Số API ──────────────────────────────────────────────────────────────
export const thamSoApi = {
  layTatCa: () =>
    api.get('/thamso'),
  // WARN-04 FIX: Add update endpoint so Settings page can save changes
  capNhat: (khoa, giaTriMoi, lyDo = 'Cập nhật qua giao diện Admin') =>
    api.put(`/thamso/${khoa}`, { giaTriMoi: String(giaTriMoi), lyDo }),
};
