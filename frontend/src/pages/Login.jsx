import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoIcon from '../assets/Logo.svg';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import AlertModal, { useAlert } from '../components/AlertModal';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { alertProps, showAlert } = useAlert();

  // Dùng ref để giữ giá trị thực – tránh bug reset khi blur / re-render
  const emailRef = useRef('');
  const matKhauRef = useRef('');

  // State chỉ để React re-render UI (không làm nguồn dữ liệu submit)
  const [emailDisplay, setEmailDisplay] = useState('');
  const [matKhauDisplay, setMatKhauDisplay] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      navigate('/overview', { replace: true });
    }
  }, [navigate]);

  const handleEmailChange = (e) => {
    emailRef.current = e.target.value;
    setEmailDisplay(e.target.value);
  };

  const handleMatKhauChange = (e) => {
    matKhauRef.current = e.target.value;
    setMatKhauDisplay(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current;
    const matKhau = matKhauRef.current;

    if (!email || !matKhau) {
      showAlert({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập Email và Mật khẩu trước khi đăng nhập.' });
      return;
    }

    setIsLoading(true);
    const result = await login(email, matKhau);
    setIsLoading(false);

    if (result.success) {
      navigate('/overview', { replace: true });
    } else {
      showAlert({
        type: 'error',
        title: 'Đăng nhập thất bại',
        message: result.message || 'Thông tin đăng nhập không chính xác. Vui lòng thử lại.',
      });
    }
  };

  return (
    <div className="flex h-screen w-full font-sans">

      {/* Panel trái – Branding */}
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

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Lãi Suất Tối Đa', value: '7.0%' },
              { label: 'Bảo Mật JWT', value: '✓ Chuẩn' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-black text-[#00C194]">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 text-xs text-gray-600 uppercase tracking-widest">
          © 2026 Ngân Hàng Kỹ Thuật Số  •  Dành cho Nhân Sự & Hội Viên VIP
        </div>
      </div>

      {/* Panel phải – Form đăng nhập */}
      <div className="w-full lg:w-1/2 bg-[#05080D] flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="text-white text-3xl font-bold mb-2">Đăng Nhập Thành Viên</h2>
          <p className="text-gray-500 mb-8 text-sm">Nhập thông tin xác thực để truy cập Dashboard</p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email */}
            <div>
              <label className="block text-gray-400 text-xs uppercase font-bold mb-2 tracking-wider">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="name@bank.com"
                value={emailDisplay}
                onChange={handleEmailChange}
                required
                autoComplete="email"
                className="w-full bg-[#111827] border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#00C194] transition-all placeholder:text-gray-600"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-gray-400 text-xs uppercase font-bold tracking-wider">Mật khẩu</label>
                <a href="#" className="text-[#00C194] text-xs hover:underline">Quên mật khẩu?</a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={matKhauDisplay}
                  onChange={handleMatKhauChange}
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#111827] border border-gray-800 rounded-xl p-4 pr-12 text-white focus:outline-none focus:border-[#00C194] transition-all placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00C194] hover:bg-[#00a37d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,193,148,0.2)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : 'Truy Cập Hệ Thống'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#00C194] hover:underline font-medium transition-all">
              Đăng ký khách hàng ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Alert Popup */}
      <AlertModal {...alertProps} />
    </div>
  );
}