import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jwt_token';
const USER_KEY  = 'user_info';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // kiểm tra token đã lưu khi app khởi động

  // Khi app mount: khôi phục session từ LocalStorage nếu token còn hợp lệ
  useEffect(() => {
    const savedUser  = localStorage.getItem(USER_KEY);
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  // ─── Login bằng API thật ───────────────────────────────────────────────────
  const login = async (email, matKhau) => {
    try {
      const response = await authApi.login(email, matKhau);
      const { data: apiResp } = response;

      if (apiResp.statusCode === 200 && apiResp.data) {
        const { token, nguoiDungId, hoTen, quyenHan } = apiResp.data;

        const userInfo = {
          id: nguoiDungId,
          hoTen,
          quyenHan, // Store exact backend role: 'ROLE_quan_tri_vien', 'ROLE_giao_dich_vien', 'ROLE_khach_hang'
          email,
        };

        // Lưu vào LocalStorage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        setUser(userInfo);

        return { success: true, user: userInfo };
      }

      return { success: false, message: apiResp.message || 'Đăng nhập thất bại' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Không kết nối được Backend. Vui lòng thử lại.';
      return { success: false, message: msg };
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAdmin  = () => user?.quyenHan === 'ROLE_quan_tri_vien';
  const isTeller = () => user?.quyenHan === 'ROLE_giao_dich_vien';
  const isKhachHang = () => user?.quyenHan === 'ROLE_khach_hang';

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isTeller, isKhachHang }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
