import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, History, Settings,
  LogOut, PiggyBank, Headset, Users, BarChart3, Moon, Sun,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const allRoutes = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/overview', color: 'text-sky-500', roles: ['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien', 'ROLE_khach_hang'] },
  { label: 'Sổ Tiết Kiệm Của Tôi', icon: PiggyBank, href: '/my-passbooks', color: 'text-indigo-500', roles: ['ROLE_khach_hang'] },
  { label: 'Mở Sổ Mới', icon: Wallet, href: '/open-savings', color: 'text-emerald-500', roles: ['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien'] },
  { label: 'Danh sách Sổ', icon: PiggyBank, href: '/passbooks', color: 'text-indigo-500', roles: ['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien'] },
  { label: 'Lịch sử giao dịch', icon: History, href: '/transactions', color: 'text-orange-500', roles: ['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien'] },
  { label: 'Báo Cáo Phân Tích', icon: BarChart3, href: '/reports', color: 'text-amber-500', roles: ['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien'] },
  { label: 'Cài đặt tham số', icon: Settings, href: '/settings', color: 'text-gray-400', roles: ['ROLE_quan_tri_vien'] },
  { label: 'Quản lý Tài khoản', icon: Users, href: '/users', color: 'text-rose-500', roles: ['ROLE_quan_tri_vien'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const routes = allRoutes.filter(r => r.roles.includes(user?.quyenHan || 'ROLE_khach_hang'));

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] text-gray-900 dark:text-white border-r border-black/[0.06] dark:border-white/[0.06] shadow-[1px_0_20px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-300">
      {/* ── Logo ── */}
      <div className="px-4 pt-6 pb-4">
        <Link to="/overview" className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md shadow-emerald-500/30 flex-shrink-0">
            <PiggyBank className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-sky-500 dark:from-emerald-400 dark:to-sky-400 tracking-tight">
            SmartSavings
          </span>
        </Link>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        <p className="text-[10px] uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 px-3 mb-3 mt-1 font-semibold">
          Menu chính
        </p>

        {routes.map((route) => {
          const active = isActive(route.href);
          return (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none',
                active
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white'
              )}
            >
              {/* Left accent bar */}
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              )}

              <route.icon
                className={cn(
                  'h-[18px] w-[18px] flex-shrink-0 transition-transform duration-150',
                  active ? route.color : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:scale-110'
                )}
              />
              <span className="leading-none">{route.label}</span>

              {/* Active dot */}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow shadow-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Panel ── */}
      <div className="px-3 border-t border-gray-100 dark:border-white/[0.06] pt-3 pb-4 space-y-2">
        {/* Theme toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-white/[0.04] rounded-xl border border-black/[0.06] dark:border-white/[0.08] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.08] transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDarkMode
              ? <Moon className="w-4 h-4 text-sky-400" />
              : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isDarkMode ? 'Chế độ: Tối' : 'Chế độ: Sáng'}
            </span>
          </div>
          <div className={cn('w-9 h-5 rounded-full relative transition-colors duration-300', isDarkMode ? 'bg-sky-500' : 'bg-gray-200')}>
            <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300', isDarkMode ? 'right-0.5' : 'left-0.5')} />
          </div>
        </button>

        {/* Support */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-xl p-3.5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 bg-emerald-500/20 rounded-lg">
              <Headset className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">Trung tâm Hỗ trợ</p>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-2.5">
            Đội ngũ CSKH trực tuyến 24/7.
          </p>
          <button className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-xs font-bold rounded-lg transition-colors">
            Hotline: 1900 8888
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50 dark:bg-white/[0.04] rounded-xl border border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.hoTen?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col truncate">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{user?.hoTen || 'Người dùng'}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium truncate">
                {user?.quyenHan === 'ROLE_quan_tri_vien' ? 'Quản trị viên'
                  : user?.quyenHan === 'ROLE_giao_dich_vien' ? 'Giao dịch viên'
                  : 'Khách hàng'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}