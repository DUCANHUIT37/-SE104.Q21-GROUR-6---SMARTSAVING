import { createContext, useContext, useState } from 'react';
import { taiKhoanData } from '../data/fakeDb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Mặc định đăng nhập sẵn với admin để demo
  const [user, setUser] = useState({
    id: 1,
    email: 'admin@gmail.com',
    hoTen: 'Admin Hệ Thống',
    quyenHan: 'ADMIN', // ADMIN | TELLER | USER
    kichHoat: true,
  });

  const login = (email, matKhau) => {
    const found = taiKhoanData.find(
      (tk) => tk.email === email && tk.kichHoat
    );
    if (found) {
      setUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Email hoặc mật khẩu không đúng' };
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => user?.quyenHan === 'ADMIN';
  const isTeller = () => user?.quyenHan === 'TELLER' || user?.quyenHan === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isTeller }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
