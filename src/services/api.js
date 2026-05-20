import axios from 'axios';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: `http://${window.location.hostname}:8080/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
      // Điều hướng về trang login
      window.location.href = '/login';
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
};

// ─── Loại Tiết Kiệm API ───────────────────────────────────────────────────────
export const loaiTietKiemApi = {
  layDangApDung: () =>
    api.get('/loaitietkiem/dang-ap-dung'),
  layTatCa: () =>
    api.get('/loaitietkiem'),
};

// ─── Người Dùng API ───────────────────────────────────────────────────────────
export const nguoiDungApi = {
  layTatCa: () =>
    api.get('/nguoidung'),
  layKhachHang: () =>
    api.get('/nguoidung/khach-hang'),
  layTheoId: (id) =>
    api.get(`/nguoidung/${id}`),
};

// ─── Báo Cáo API ──────────────────────────────────────────────────────────────
export const baoCaoApi = {
  tongQuan: () =>
    api.get('/baocao/tong-quan'),
  theo_ngay: (ngay) =>
    api.get('/baocao/ngay', { params: { ngay } }),
  theo_thang: (nam, thang) =>
    api.get('/baocao/thang', { params: { nam, thang } }),
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
};
