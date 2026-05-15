import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import logoIcon from '../assets/logo.svg';

export default function Login() {
  const navigate = useNavigate(); 

  const handleLogin = (e) => {
    e.preventDefault(); 
    // Thêm logic tài khoản ở đây
    navigate('/overview'); 
  };

  return (
    <div className="flex h-screen w-full font-sans">
      
      {/* Nội dung chào mừng  */}
      <div className="hidden lg:flex w-1/2 bg-[#0B131E] flex-col justify-center items-center p-12 text-white relative">
        <div className="max-w-md text-left">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-[#00C194] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,193,148,0.4)] transition-transform hover:scale-105 active:scale-95">
              <img src={logoIcon} alt="Logo" className="w-8 h-8 brightness-0 invert" />
            </div>
              <h2 className="text-4xl font-bold tracking-tight">SmartSavings.</h2>
          </div>

          <h1 className="text-4xl font-black mb-4 leading-tight">
            Bảo vệ quỹ dữ liệu. <br />
            <span className="text-[#00C194]">Kiến tạo tương lai.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Hệ thống quản trị danh mục sổ số Tiết Kiệm đạt chuẩn bảo mật nội bộ hàng đầu Việt Nam.
          </p>
        </div>
        
        <div className="absolute bottom-10 text-xs text-gray-600 uppercase tracking-widest">
          © 2026 Ngân Hàng Kỹ Thuật Số  •  Dành cho Nhân Sự & Hội Viên VIP
        </div>
      </div>

      {/* Form đăng nhập  */}
      <div className="w-full lg:w-1/2 bg-[#05080D] flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-white text-3xl font-bold mb-2">Đăng Nhập Thành Viên</h2>
          <p className="text-gray-500 mb-8 text-sm">Nhập thông tin xác thực để truy cập Dashboard</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2 tracking-wider">Email hoặc Tên đăng nhập</label>
              <input 
                type="text" 
                placeholder="name@bank.com"
                className="w-full bg-[#111827] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#00C194] transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Mật khẩu</label>
                <a href="#" className="text-[#00C194] text-xs hover:underline">Quên mật khẩu?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#111827] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#00C194] transition-all placeholder:text-gray-600"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#00C194] hover:bg-[#00a37d] text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,193,148,0.2)] active:scale-[0.98]"
            >
              Truy Cập Hệ Thống
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Chưa có tài khoản? 
            <Link to="/register" className="text-[#00C194] hover:underline font-medium transition-all">
            Đăng ký khách hàng ngay</Link>
          </p>
        </div>
      </div>

    </div>
  );
}