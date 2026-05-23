import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wallet, History, Settings,
  LogOut, PiggyBank, Headset, Users, BarChart3, Moon, Sun,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

const allRoutes = [
  { label: 'Tổng quan', icon: LayoutDashboard, href: '/overview', color: 'text-sky-500', roles: ['ADMIN', 'TELLER', 'USER'] },
  { label: 'Mở Sổ Mới', icon: Wallet, href: '/open-savings', color: 'text-emerald-500', roles: ['ADMIN', 'TELLER'] },
  { label: 'Danh sách Sổ', icon: PiggyBank, href: '/passbooks', color: 'text-indigo-500', roles: ['ADMIN', 'TELLER', 'USER'] },
  { label: 'Lịch sử giao dịch', icon: History, href: '/transactions', color: 'text-orange-500', roles: ['ADMIN', 'TELLER', 'USER'] },
  { label: 'Báo Cáo Phân Tích', icon: BarChart3, href: '/reports', color: 'text-amber-500', roles: ['ADMIN', 'TELLER'] },
  { label: 'Cài đặt tham số', icon: Settings, href: '/settings', color: 'text-gray-400', roles: ['ADMIN'] },
  { label: 'Quản lý Tài khoản', icon: Users, href: '/users', color: 'text-rose-500', roles: ['ADMIN'] },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const routes = allRoutes.filter(r => r.roles.includes(user?.quyenHan || 'USER'));

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white dark:bg-[#111827] text-gray-900 dark:text-white overflow-hidden border-r border-black/10 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.04)] dark:shadow-none transition-colors duration-300">
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <Link to="/overview" className="flex items-center pl-3 mb-10">
          <div className="relative w-8 h-8 mr-4 flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full">
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-sky-600 dark:from-emerald-400 dark:to-sky-400">
            SmartSavings
          </h1>
        </Link>

        <p className="text-xs uppercase tracking-widest text-gray-400 px-3 mb-3 font-semibold">Menu chính</p>

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              className={cn(
                'text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-lg transition-all duration-200',
                location.pathname === route.href
                  ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn('h-5 w-5 mr-3 transition-transform group-hover:scale-110', route.color)} />
                {route.label}
              </div>
              {location.pathname === route.href && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto" />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 mt-auto border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
        {/* THEME TOGGLE */}
        <div
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-sky-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isDarkMode ? 'Chế độ: Tối' : 'Chế độ: Sáng'}
            </span>
          </div>
          <div className={cn('w-9 h-5 rounded-full relative transition-colors duration-300', isDarkMode ? 'bg-sky-500' : 'bg-gray-300')}>
            <div className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300', isDarkMode ? 'right-0.5' : 'left-0.5')} />
          </div>
        </div>

        {/* SUPPORT WIDGET */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <Headset className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-emerald-400">Trung tâm Hỗ trợ</p>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            Liên hệ với đội ngũ CSKH chuyên nghiệp trực tuyến 24/7.
          </p>
          <button className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition-colors">
            Hotline: 1900 8888
          </button>
        </div>

        {/* USER PROFILE */}
        <div className="px-3 py-2.5 flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
          <div className="flex items-center overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex-shrink-0 flex items-center justify-center text-emerald-600 dark:text-emerald-500 font-bold mr-3 text-sm">
              {user?.hoTen?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex flex-col truncate">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.hoTen || 'Người dùng'}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">{user?.quyenHan || 'USER'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-1.5 ml-2 text-gray-400 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}