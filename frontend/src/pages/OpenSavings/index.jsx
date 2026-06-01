import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, CalendarDays, ReceiptText, ShieldCheck, ArrowRight, Loader2, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  nguoiDungApi, loaiTietKiemApi, thamSoApi, soTietKiemApi
} from '../../services/api';
import { cn } from '../../lib/utils';
import AlertModal, { useAlert } from '../../components/AlertModal';
import CustomerSelectModal from '../../components/modals/CustomerSelectModal';

const formatTien = (val) => {
  if (!val) return '';
  const num = Number(val.toString().replace(/\D/g, ''));
  return num > 0 ? num.toLocaleString('vi-VN') : '';
};

export default function MoSo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alertProps, showAlert } = useAlert();

  const isStaff = user?.quyenHan !== 'ROLE_khach_hang';
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [form, setForm] = useState({
    cmnd: '', hoTen: '', diaChi: '',
    loaiTietKiemId: '', soTienBanDau: '', soDienThoai: ''
  });
  const [khachHangTimThay, setKhachHangTimThay] = useState(null);
  const [cmndNotFound, setCmndNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(null);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const debounceTimeout = useRef(null);

  const [loaiDangApDung, setLoaiDangApDung] = useState([]);
  const [soTienToiThieu, setSoTienToiThieu] = useState(1000000);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [loaiRes, thamSoRes] = await Promise.all([
          loaiTietKiemApi.layDangApDung(),
          thamSoApi.layTatCa()
        ]);
        setLoaiDangApDung(loaiRes.data.data);
        const minDeposit = thamSoRes.data.data.find(ts => ts.khoa === 'so_tien_gui_toi_thieu')?.giaTri;
        if (minDeposit) setSoTienToiThieu(Number(minDeposit));
      } catch (error) {
        console.error('Lỗi lấy dữ liệu ban đầu', error);
        showAlert({ type: 'error', title: 'Lỗi kết nối', message: 'Không thể kết nối máy chủ. Vui lòng thử lại!' });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const loaiDaChon = loaiDangApDung.find(lt => lt.id === Number(form.loaiTietKiemId));
  const laiSuatUocTinh = loaiDaChon ? (loaiDaChon.laiSuatNam * 100) : 0; // Convert to % if backend returns 0.05

  const handleCmndBlur = async () => {
    if (!form.cmnd.trim()) return;
    try {
      // BUG-01 FIX: Use targeted CMND endpoint instead of fetching ALL customers
      const res = await nguoiDungApi.layTheoCmnd(form.cmnd.trim());
      const found = res.data.data;
      if (found) {
        setKhachHangTimThay(found);
        setCmndNotFound(false);
        setForm(f => ({ 
          ...f, 
          hoTen: found.hoTen, 
          diaChi: (found.diaChi && found.diaChi !== "Chưa cập nhật") ? found.diaChi : '', 
          soDienThoai: found.soDienThoai || '' 
        }));
        showAlert({ type: 'success', title: 'Tìm thấy khách hàng', message: `✅ ${found.hoTen} — CMND: ${form.cmnd}` });
      }
    } catch (e) {
      if (e.response?.status === 404) {
        setKhachHangTimThay(null);
        setCmndNotFound(true);
        // Reset form for safety
        setForm(f => ({ ...f, hoTen: '', diaChi: '', soDienThoai: '' }));
        showAlert({ type: 'error', title: 'Không tìm thấy khách hàng', message: 'Khách hàng chưa có tài khoản trong hệ thống. Vui lòng đăng ký trước!' });
      } else {
        showAlert({ type: 'error', title: 'Lỗi tra cứu', message: 'Lỗi tra cứu CMND. Vui lòng thử lại.' });
        console.error('CMND lookup error:', e);
      }
    }
  };

  const handleCmndSelect = (user) => {
    setKhachHangTimThay(user);
    setCmndNotFound(false);
    setForm(f => ({ 
      ...f, 
      cmnd: user.cmnd,
      hoTen: user.hoTen, 
      diaChi: (user.diaChi && user.diaChi !== "Chưa cập nhật") ? user.diaChi : '', 
      soDienThoai: user.soDienThoai || '' 
    }));
    showAlert({ type: 'success', title: 'Tìm thấy khách hàng', message: `✅ ${user.hoTen} — CMND: ${user.cmnd}` });
  };

  const handleCmndChange = (e) => {
    const value = e.target.value;
    
    setForm(prev => ({ ...prev, cmnd: value }));
    setKhachHangTimThay(null);
    setCmndNotFound(false);

    const exactMatch = suggestedUsers.find(u => u.cmnd === value);
    if (exactMatch) {
      handleCmndSelect(exactMatch);
      return;
    }

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (value.trim().length >= 3) {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await nguoiDungApi.timKiemCmnd(value.trim()); 
          setSuggestedUsers(res.data.data || []);
        } catch (error) {
          console.error("Lỗi khi tải danh sách gợi ý CMND:", error);
        }
      }, 500);
    } else {
      setSuggestedUsers([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMoneyChange = (e) => {
    setForm({ ...form, soTienBanDau: e.target.value.replace(/\D/g, '') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.soTienBanDau) < soTienToiThieu) {
      showAlert({ type: 'warning', title: 'Số tiền không hợp lệ', message: `Số tiền gửi phải lớn hơn hoặc bằng ${soTienToiThieu.toLocaleString('vi-VN')} VNĐ!` });
      return;
    }

    setLoading(true);

    try {
      // 1. Prepare payload
      const payload = {
        soTienBanDau: Number(form.soTienBanDau),
        khachHang: {
          cmnd: form.cmnd,
          hoTen: form.hoTen,
          diaChi: form.diaChi,
          soDienThoai: form.soDienThoai || '0900000000', // Mock sdt
          loaiNguoiDung: 'khach_hang'
        },
        loaiTietKiem: {
          id: Number(form.loaiTietKiemId)
        }
      };

      const res = await soTietKiemApi.moSoMoi(payload);
      const data = res.data.data;
      
      setSuccess({ 
        maSo: data.maSo, 
        soTienBanDau: data.soDuHienTai, 
        loaiTietKiem: data.tenLoaiTietKiem 
      });
      // không dùng alert ở đây vì đã có success screen riêng
    } catch (error) {
      console.error(error);
      showAlert({ type: 'error', title: 'Lỗi mở sổ', message: error.response?.data?.message || 'Có lỗi xảy ra khi mở sổ. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ cmnd: '', hoTen: '', diaChi: '', loaiTietKiemId: '', soTienBanDau: '', soDienThoai: '' });
    setSuccess(null); setKhachHangTimThay(null);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="p-6 bg-emerald-500/10 rounded-full border border-emerald-500/30">
          <CheckCircle className="w-16 h-16 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mở Sổ Thành Công!</h2>
          <p className="text-gray-500 dark:text-gray-400">Sổ tiết kiệm đã được tạo trong hệ thống.</p>
        </div>
        <div className="bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">Mã sổ:</span><span className="font-bold text-emerald-400 text-lg">{success.maSo}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Loại TK:</span><span className="font-semibold text-gray-900 dark:text-white">{success.loaiTietKiem}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Số tiền gởi:</span><span className="font-semibold text-gray-900 dark:text-white">{formatTien(success.soTienBanDau)} ₫</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors">Mở Sổ Mới</button>
          <button onClick={() => navigate('/passbooks')} className="px-6 py-2.5 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-[#283547] transition-colors">Xem Danh Sách Sổ</button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <PiggyBank className="w-8 h-8 mr-3 text-emerald-500" />
          Mở Sổ Tiết Kiệm Mới (BM1)
        </h2>
        <p className="text-gray-500 mt-2">Điền thông tin CMND để hệ thống tạo hoặc tự động tra cứu khách hàng hiện tại.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* THÔNG TIN KHÁCH HÀNG */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-sky-500" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CMND / Căn cước công dân</label>
                  <div className="flex gap-2">
                    <input type="text" name="cmnd" required value={form.cmnd} onChange={handleCmndChange} onBlur={handleCmndBlur} list="cmnd-suggestions" autoComplete="off" disabled={isStaff} className={cn("flex-1 w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500", isStaff ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-400 border-transparent" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white")} placeholder={isStaff ? "Vui lòng bấm Chọn KH bên cạnh 👉" : "VD: 079123456789"} />
                    {user?.quyenHan !== 'ROLE_khach_hang' && (
                      <button
                        type="button"
                        onClick={() => setShowCustomerModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
                      >
                        <Users className="w-3.5 h-3.5" /> Chọn KH
                      </button>
                    )}
                  </div>
                  
                  <datalist id="cmnd-suggestions">
                    {suggestedUsers.map(user => (
                      <option key={user.id} value={user.cmnd}>
                        {user.hoTen} - {user.diaChi && user.diaChi !== 'Chưa cập nhật' ? user.diaChi : 'Chưa cập nhật địa chỉ'}
                      </option>
                    ))}
                  </datalist>
                  {khachHangTimThay && (
                    <p className="text-xs text-emerald-500 font-medium">✓ Khách hàng cũ</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên khách hàng</label>
                  <input type="text" name="hoTen" required value={form.hoTen} onChange={handleChange} disabled={isStaff || !!khachHangTimThay} className={cn("w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500", (isStaff || khachHangTimThay) ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-400 border-transparent" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white")} placeholder={isStaff ? "" : "VD: NGUYEN VAN A"} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ hiện tại</label>
                  <input type="text" name="diaChi" required value={form.diaChi} onChange={handleChange} disabled={isStaff ? (!khachHangTimThay || !!(khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "Chưa cập nhật")) : !!(khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "Chưa cập nhật")} className={cn("w-full px-4 py-2 border rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500", (isStaff ? (!khachHangTimThay || !!(khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "Chưa cập nhật")) : !!(khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "Chưa cập nhật")) ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-400 border-transparent" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white")} placeholder={isStaff && (!khachHangTimThay || (khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "Chưa cập nhật")) ? "" : "VD: Số 123, Phường A, Quận B"} />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* THÔNG TIN GÓI GỬI */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ReceiptText className="w-5 h-5 mr-2 text-indigo-500" />
                Chi tiết tiền gửi
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số tiền gửi ban đầu (VNĐ)</label>
                  <div className="relative">
                    <input
                      type="text" name="soTienBanDau" required
                      value={formatTien(form.soTienBanDau)} onChange={handleMoneyChange}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                      placeholder="1,000,000"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 font-medium">VNĐ</span>
                  </div>
                  <p className="text-xs text-gray-500">Tối thiểu: {soTienToiThieu.toLocaleString('vi-VN')} VNĐ</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại hình / Kỳ hạn</label>
                  <select
                    name="loaiTietKiemId" required
                    value={form.loaiTietKiemId} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>-- Chọn kỳ hạn gửi --</option>
                    {loaiDangApDung.map((loai) => (
                      <option key={loai.id} value={loai.id}>
                        {loai.tenLoai} (Lãi: {parseFloat((loai.laiSuatNam * 100).toFixed(3))}%/năm)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item 1.1: Ngày mở sổ read-only */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày mở sổ</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('vi-VN')}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Tự động lấy ngày hệ thống</p>
                </div>

                {/* Lãi suất hiển thị tự động khi chọn kỳ hạn */}
                {loaiDaChon && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lãi suất áp dụng</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {parseFloat((loaiDaChon.laiSuatNam * 100).toFixed(3))}%
                      </span>
                      <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">/năm</span>
                      <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-1 rounded-full font-semibold">
                        {loaiDaChon.tenLoai}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit" disabled={loading || cmndNotFound}
              className="mt-6 w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</>
              ) : (
                <>Mở Sổ Tiết Kiệm Mới <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Thông tin Tóm tắt */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg text-white">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2" />
              Tóm tắt thông tin
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-emerald-100 text-sm">Số tiền gốc:</p>
                <p className="text-2xl font-bold tracking-tight">
                  {form.soTienBanDau ? formatTien(form.soTienBanDau) : "0"} ₫
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-400/30">
                <p className="text-emerald-100 text-sm">Lãi suất áp dụng:</p>
                <p className="text-xl font-semibold">{laiSuatUocTinh > 0 ? `${laiSuatUocTinh}%/năm` : "---"}</p>
              </div>

              {loaiDaChon && loaiDaChon.kyHanThang > 0 && form.soTienBanDau && (
                <div className="pt-4 border-t border-emerald-400/30">
                  <p className="text-emerald-100 text-sm">Tiền lãi dự tính cuối kỳ:</p>
                  <p className="text-2xl font-bold text-yellow-300">
                    +{Math.round((Number(form.soTienBanDau) * (laiSuatUocTinh / 100) * (loaiDaChon.kyHanThang * 30)) / 365).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-emerald-100 opacity-80 text-center">
              * Ước lượng hiển thị dùng công thức: Gốc * Lãi * Kỳ hạn hiển thị thực.
            </p>
          </div>
        </div>

      </div>
    </div>

      <AlertModal {...alertProps} />
      <CustomerSelectModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSelect={handleCmndSelect}
      />
    </>
  );
}
