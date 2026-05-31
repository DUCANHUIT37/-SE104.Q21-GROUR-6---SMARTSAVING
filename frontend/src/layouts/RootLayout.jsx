import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, X } from 'lucide-react';
import { useAutoLogout } from '../hooks/useAutoLogout';

export default function RootLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Kích hoạt auto logout sau 20 phút (1200000ms)
  useAutoLogout(1200000);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50/50 dark:bg-gray-900 overflow-hidden">
      
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 z-50">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-sky-400">
          SmartSavings
        </h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-500 hover:text-emerald-500 transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-white dark:bg-[#111827] shadow-xl animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <div className="hidden md:flex h-full w-72 flex-col fixed inset-y-0 z-50 overflow-hidden">
        <Sidebar />
      </div>

      {/* --- NỘI DUNG CHÍNH --- */}
      <main className="md:pl-72 flex-1 h-full overflow-y-auto bg-gray-50/40 dark:bg-[#0d1117]">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full page-enter">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
