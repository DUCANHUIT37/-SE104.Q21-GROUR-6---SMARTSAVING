import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoIcon from '../assets/Logo.svg';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full font-sans bg-[#05080D]">
      
      {/* Form Đăng Ký */}
      <div className="w-full lg:w-1/3 bg-[#020408] flex flex-col justify-center p-12 border-r border-gray-900">
        <div className="max-w-sm mx-auto w-full">
          {/* Nút quay lại */}
          <Link to="/login" className="text-gray-500 text-xs hover:text-white flex items-center gap-2 mb-8 transition-colors">
            ← Trở lại Đăng nhập
          </Link>

          <h2 className="text-white text-2xl font-bold mb-2">Mở Hồ Sơ Đăng Ký</h2>
          <p className="text-gray-500 mb-8 text-xs">Hãy cung cấp định danh hợp lệ để mở C.I.F</p>

          <form className="space-y-5">
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Tên đầy đủ (Căn cước)</label>
              <input type="text" placeholder="VD: NGUYEN VAN A" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Số CMND / CCCD</label>
              <input type="text" placeholder="9 hoặc 12 chữ số định danh" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Email kết nối</label>
              <input type="email" placeholder="hello@example.com" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Mật khẩu bảo mật</label>
              <input type="password" placeholder="Tối thiểu 6 ký tự" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <button className="w-full bg-[#0085D0] hover:bg-[#0071b1] text-white font-bold py-3 rounded-lg mt-4 shadow-lg transition-all active:scale-95">
              Khởi tạo tài khoản
            </button>
          </form>

          <p className="text-[10px] text-gray-600 mt-6 text-center leading-relaxed px-4">
            Bằng cách đăng ký, tôi cam kết thông tin cung cấp là chính xác và đồng ý với Điều khoản hệ thống.
          </p>
        </div>
      </div>

      {/* Nội dung giới thiệu*/}
      <div className="hidden lg:flex flex-1 bg-[#0B131E] flex-col justify-center p-20 relative">
        <div className="max-w-xl">
          {/* Logo & Brand*/}
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-[#00C194] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,193,148,0.3)]">
              <img src={logoIcon} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">SmartSavings.</h2>
          </div>

          <h1 className="text-5xl font-bold text-white mb-4">
            Khởi Đầu Khôn Ngoan. <br />
            <span className="text-[#00C194]">Sinh Lời Bền Vững.</span>
          </h1>

          <p className="text-gray-400 text-sm mb-12 max-w-md leading-relaxed">
            Gia nhập cộng đồng gồm hơn 50,000+ khách hàng tin dùng gửi gắm sổ tiết kiệm điện tử 4.0.
          </p>

          {/* Stats */}
          <div className="flex gap-12 border-t border-gray-800 pt-10">
            <div>
              <div className="text-3xl font-bold text-white">6.5%</div>
              <div className="text-[10px] text-cyan-500 uppercase font-bold">Lãi suất tối đa</div>
            </div>
            <div className="border-l border-gray-800 h-12"></div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-[10px] text-green-500 uppercase font-bold">Rút tiền online</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}