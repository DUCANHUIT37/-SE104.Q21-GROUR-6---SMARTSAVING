import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logoIcon from '../assets/Logo.svg';
import api from '../services/api';
import AlertModal, { useAlert } from '../components/AlertModal';

export default function Register() {
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();

  const [formData, setFormData] = useState({
    hoTen: '',
    cmnd: '',
    diaChi: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/;

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password) && /\d/.test(password)) strength += 1;
    if (/[!@#$%^&*()_+]/.test(password)) strength += 1;
    return strength;
  };

  const strength = getPasswordStrength(formData.matKhau);

  const getStrengthBarColor = () => {
    if (strength === 1) return 'bg-red-500 w-1/3';
    if (strength === 2) return 'bg-yellow-500 w-2/3';
    if (strength === 3) return 'bg-green-500 w-full';
    return 'bg-gray-800 w-0';
  };

  const getStrengthText = () => {
    if (strength === 1) return 'Yếu (Cần thêm chữ hoa và số)';
    if (strength === 2) return 'Trung bình (Cần ký tự đặc biệt)';
    if (strength === 3) return 'Mạnh (Đạt chuẩn)';
    return '';
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hoTen || !formData.cmnd || !formData.diaChi || !formData.email || !formData.matKhau || !formData.xacNhanMatKhau) {
      showAlert({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ tất cả thông tin trước khi đăng ký!' });
      return;
    }

    if (formData.matKhau !== formData.xacNhanMatKhau) {
      showAlert({ type: 'error', title: 'Mật khẩu không khớp', message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập. Vui lòng kiểm tra lại!' });
      return;
    }

    if (!passwordRegex.test(formData.matKhau)) {
      showAlert({ type: 'error', title: 'Mật khẩu không đủ mạnh', message: 'Mật khẩu cần ít nhất 6 ký tự, bao gồm 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt (!@#$%...).' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/auth/register', {
        hoTen: formData.hoTen,
        cmnd: formData.cmnd,
        diaChi: formData.diaChi,
        email: formData.email,
        matKhau: formData.matKhau
      });

      if (res.data && res.data.statusCode === 200) {
        showAlert({
          type: 'success',
          title: 'Đăng ký thành công! 🎉',
          message: 'Tài khoản của bạn đã được tạo thành công. Hãy đăng nhập để bắt đầu sử dụng SmartSavings.',
          confirmLabel: 'Đăng nhập ngay',
          onConfirm: () => navigate('/login'),
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!';
      showAlert({ type: 'error', title: 'Đăng ký thất bại', message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = formData.matKhau === formData.xacNhanMatKhau && passwordRegex.test(formData.matKhau);

  return (
    <div className="flex h-screen w-full font-sans bg-[#05080D]">

      {/* Form Đăng Ký */}
      <div className="w-full lg:w-1/3 bg-[#020408] flex flex-col justify-center p-12 border-r border-gray-900 overflow-y-auto">
        <div className="max-w-sm mx-auto w-full py-8">
          {/* Nút quay lại */}
          <Link to="/login" className="text-gray-500 text-xs hover:text-white flex items-center gap-2 mb-8 transition-colors">
            ← Trở lại Đăng nhập
          </Link>

          <h2 className="text-white text-2xl font-bold mb-2">Mở Hồ Sơ Đăng Ký</h2>
          <p className="text-gray-500 mb-8 text-xs">Hãy cung cấp định danh hợp lệ để mở C.I.F</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Tên đầy đủ (Căn cước)</label>
              <input name="hoTen" value={formData.hoTen} onChange={handleChange} type="text" placeholder="VD: NGUYEN VAN A" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Số CMND / CCCD</label>
              <input name="cmnd" value={formData.cmnd} onChange={handleChange} type="text" placeholder="9 hoặc 12 chữ số định danh" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Địa chỉ thường trú</label>
              <input name="diaChi" value={formData.diaChi} onChange={handleChange} type="text" placeholder="VD: Quận 1, TP.HCM" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Email kết nối</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="hello@example.com" className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 text-white text-sm focus:border-[#0085D0] outline-none transition-all" />
            </div>

            {/* Mật khẩu với toggle ẩn/hiện */}
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Mật khẩu bảo mật</label>
              <div className="relative">
                <input
                  name="matKhau"
                  value={formData.matKhau}
                  onChange={handleChange}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt"
                  className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 pr-11 text-white text-sm focus:border-[#0085D0] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.matKhau.length > 0 && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    <div className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}></div>
                  </div>
                  <p className={`text-[10px] mt-1 ${strength === 3 ? 'text-green-500' : strength === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {getStrengthText()}
                  </p>
                </div>
              )}
            </div>

            {/* Xác nhận mật khẩu với toggle ẩn/hiện */}
            <div>
              <label className="block text-gray-400 text-[10px] uppercase font-bold mb-2">Xác nhận Mật khẩu</label>
              <div className="relative">
                <input
                  name="xacNhanMatKhau"
                  value={formData.xacNhanMatKhau}
                  onChange={handleChange}
                  type={showConfirmPass ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-[#0B131E] border border-gray-800 rounded-lg p-3 pr-11 text-white text-sm focus:border-[#0085D0] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.xacNhanMatKhau.length > 0 && formData.matKhau !== formData.xacNhanMatKhau && (
                <p className="text-red-500 text-[10px] mt-1">Mật khẩu xác nhận không khớp!</p>
              )}
            </div>

            <button
              disabled={isSubmitting || !isValid}
              className={`w-full font-bold py-3 rounded-lg mt-6 shadow-lg transition-all active:scale-95 ${
                isValid && !isSubmitting
                  ? 'bg-[#0085D0] hover:bg-[#0071b1] text-white'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Khởi tạo tài khoản'}
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

      {/* Alert Popup */}
      <AlertModal {...alertProps} />
    </div>
  );
}