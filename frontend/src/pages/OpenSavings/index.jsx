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

  // â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        console.error('Lá»—i láº¥y dá»¯ liá»‡u ban Ä‘áº§u', error);
        showAlert({ type: 'error', title: 'Lá»—i káº¿t ná»‘i', message: 'KhÃ´ng thá»ƒ káº¿t ná»‘i mÃ¡y chá»§. Vui lÃ²ng thá»­ láº¡i!' });
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
          diaChi: (found.diaChi && found.diaChi !== "ChÆ°a cáº­p nháº­t") ? found.diaChi : '', 
          soDienThoai: found.soDienThoai || '' 
        }));
        showAlert({ type: 'success', title: 'TÃ¬m tháº¥y khÃ¡ch hÃ ng', message: `âœ… ${found.hoTen} â€” CMND: ${form.cmnd}` });
      }
    } catch (e) {
      if (e.response?.status === 404) {
        setKhachHangTimThay(null);
        setCmndNotFound(true);
        // Reset form for safety
        setForm(f => ({ ...f, hoTen: '', diaChi: '', soDienThoai: '' }));
        showAlert({ type: 'error', title: 'KhÃ´ng tÃ¬m tháº¥y khÃ¡ch hÃ ng', message: 'KhÃ¡ch hÃ ng chÆ°a cÃ³ tÃ i khoáº£n trong há»‡ thá»‘ng. Vui lÃ²ng Ä‘Äƒng kÃ½ trÆ°á»›c!' });
      } else {
        showAlert({ type: 'error', title: 'Lá»—i tra cá»©u', message: 'Lá»—i tra cá»©u CMND. Vui lÃ²ng thá»­ láº¡i.' });
        console.error('CMND lookup error:', e);
      }
    }
  };

  const handleCmndSelect = (selectedCustomer) => {
    setKhachHangTimThay(selectedCustomer);
    setCmndNotFound(false);
    setForm(f => ({
      ...f,
      cmnd: selectedCustomer.cmnd,
      hoTen: selectedCustomer.hoTen,
      diaChi: (selectedCustomer.diaChi && selectedCustomer.diaChi !== 'ChÆ°a cáº­p nháº­t') ? selectedCustomer.diaChi : '',
      soDienThoai: selectedCustomer.soDienThoai || ''
    }));
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
          console.error("Lá»—i khi táº£i danh sÃ¡ch gá»£i Ã½ CMND:", error);
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
      showAlert({ type: 'warning', title: 'Sá»‘ tiá»n khÃ´ng há»£p lá»‡', message: `Sá»‘ tiá»n gá»­i pháº£i lá»›n hÆ¡n hoáº·c báº±ng ${soTienToiThieu.toLocaleString('vi-VN')} VNÄ!` });
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
      // khÃ´ng dÃ¹ng alert á»Ÿ Ä‘Ã¢y vÃ¬ Ä‘Ã£ cÃ³ success screen riÃªng
    } catch (error) {
      console.error(error);
      showAlert({ type: 'error', title: 'Lá»—i má»Ÿ sá»•', message: error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi má»Ÿ sá»•. Vui lÃ²ng thá»­ láº¡i!' });
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Má»Ÿ Sá»• ThÃ nh CÃ´ng!</h2>
          <p className="text-gray-500 dark:text-gray-400">Sá»• tiáº¿t kiá»‡m Ä‘Ã£ Ä‘Æ°á»£c táº¡o trong há»‡ thá»‘ng.</p>
        </div>
        <div className="bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-3">
          <div className="flex justify-between"><span className="text-gray-500">MÃ£ sá»•:</span><span className="font-bold text-emerald-400 text-lg">{success.maSo}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Loáº¡i TK:</span><span className="font-semibold text-gray-900 dark:text-white">{success.loaiTietKiem}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Sá»‘ tiá»n gá»Ÿi:</span><span className="font-semibold text-gray-900 dark:text-white">{formatTien(success.soTienBanDau)} â‚«</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors">Má»Ÿ Sá»• Má»›i</button>
          <button onClick={() => navigate('/passbooks')} className="px-6 py-2.5 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-[#283547] transition-colors">Xem Danh SÃ¡ch Sá»•</button>
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
          Má»Ÿ Sá»• Tiáº¿t Kiá»‡m Má»›i (BM1)
        </h2>
        <p className="text-gray-500 mt-2">Äiá»n thÃ´ng tin CMND Ä‘á»ƒ há»‡ thá»‘ng táº¡o hoáº·c tá»± Ä‘á»™ng tra cá»©u khÃ¡ch hÃ ng hiá»‡n táº¡i.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-[#1f2937] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* THÃ”NG TIN KHÃCH HÃ€NG */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-sky-500" />
                ThÃ´ng tin cÃ¡ nhÃ¢n
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CMND / CÄƒn cÆ°á»›c cÃ´ng dÃ¢n</label>
                  <div className="flex gap-2">
                    <input
                      type="text" name="cmnd" required
                      value={form.cmnd} onChange={handleCmndChange} onBlur={handleCmndBlur}
                      list="cmnd-suggestions"
                      autoComplete="off"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                      placeholder="VD: 079123456789"
                    />
                    {/* NÃºt chá»n tá»« danh sÃ¡ch â€” chá»‰ hiá»‡n cho Admin vÃ  Teller */}
                    {user?.quyenHan !== 'ROLE_khach_hang' && (
                      <button
                        type="button"
                        onClick={() => setShowCustomerModal(true)}
                        title="Chá»n khÃ¡ch hÃ ng tá»« danh sÃ¡ch"
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Chá»n KH
                      </button>
                    )}
                  </div>
                  
                  <datalist id="cmnd-suggestions">
                    {suggestedUsers.map(u => (
                      <option key={u.id} value={u.cmnd}>
                        {u.hoTen} - {u.diaChi && u.diaChi !== 'ChÆ°a cáº­p nháº­t' ? u.diaChi : 'ChÆ°a cáº­p nháº­t Ä‘á»‹a chá»‰'}
                      </option>
                    ))}
                  </datalist>
                  {khachHangTimThay && (
                    <p className="text-xs text-emerald-500 font-medium">âœ“ KhÃ¡ch hÃ ng Ä‘Ã£ cÃ³ tÃ i khoáº£n</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Há» vÃ  tÃªn khÃ¡ch hÃ ng</label>
                  <input
                    type="text" name="hoTen" required
                    value={form.hoTen} onChange={handleChange}
                    disabled={!!khachHangTimThay}
                    className={cn(
                      "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500",
                      khachHangTimThay ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-400" : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}
                    placeholder="VD: NGUYEN VAN A"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Äá»‹a chá»‰ hiá»‡n táº¡i</label>
                  <input
                    type="text" name="diaChi" required
                    value={form.diaChi} onChange={handleChange}
                    disabled={!!(khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "ChÆ°a cáº­p nháº­t")}
                    className={cn(
                      "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg outline-none transition focus:ring-2 focus:ring-emerald-500",
                      (khachHangTimThay && khachHangTimThay.diaChi && khachHangTimThay.diaChi !== "ChÆ°a cáº­p nháº­t") ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-70 text-gray-700 dark:text-gray-400" : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    )}
                    placeholder="VD: Sá»‘ 123, PhÆ°á»ng A, Quáº­n B"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* THÃ”NG TIN GÃ“I Gá»¬I */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <ReceiptText className="w-5 h-5 mr-2 text-indigo-500" />
                Chi tiáº¿t tiá»n gá»­i
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sá»‘ tiá»n gá»­i ban Ä‘áº§u (VNÄ)</label>
                  <div className="relative">
                    <input
                      type="text" name="soTienBanDau" required
                      value={formatTien(form.soTienBanDau)} onChange={handleMoneyChange}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 outline-none transition"
                      placeholder="1,000,000"
                    />
                    <span className="absolute right-4 top-3 text-gray-500 font-medium">VNÄ</span>
                  </div>
                  <p className="text-xs text-gray-500">Tá»‘i thiá»ƒu: {soTienToiThieu.toLocaleString('vi-VN')} VNÄ</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loáº¡i hÃ¬nh / Ká»³ háº¡n</label>
                  <select
                    name="loaiTietKiemId" required
                    value={form.loaiTietKiemId} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>-- Chá»n ká»³ háº¡n gá»­i --</option>
                    {loaiDangApDung.map((loai) => (
                      <option key={loai.id} value={loai.id}>
                        {loai.tenLoai} (LÃ£i: {parseFloat((loai.laiSuatNam * 100).toFixed(3))}%/nÄƒm)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item 1.1: NgÃ y má»Ÿ sá»• read-only */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">NgÃ y má»Ÿ sá»•</label>
                  <input
                    type="text"
                    readOnly
                    value={new Date().toLocaleDateString('vi-VN')}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400">Tá»± Ä‘á»™ng láº¥y ngÃ y há»‡ thá»‘ng</p>
                </div>

                {/* LÃ£i suáº¥t hiá»ƒn thá»‹ tá»± Ä‘á»™ng khi chá»n ká»³ háº¡n */}
                {loaiDaChon && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">LÃ£i suáº¥t Ã¡p dá»¥ng</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {parseFloat((loaiDaChon.laiSuatNam * 100).toFixed(3))}%
                      </span>
                      <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">/nÄƒm</span>
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
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Äang xá»­ lÃ½...</>
              ) : (
                <>Má»Ÿ Sá»• Tiáº¿t Kiá»‡m Má»›i <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar ThÃ´ng tin TÃ³m táº¯t */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-lg text-white">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <CalendarDays className="w-5 h-5 mr-2" />
              TÃ³m táº¯t thÃ´ng tin
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-emerald-100 text-sm">Sá»‘ tiá»n gá»‘c:</p>
                <p className="text-2xl font-bold tracking-tight">
                  {form.soTienBanDau ? formatTien(form.soTienBanDau) : "0"} â‚«
                </p>
              </div>

              <div className="pt-4 border-t border-emerald-400/30">
                <p className="text-emerald-100 text-sm">LÃ£i suáº¥t Ã¡p dá»¥ng:</p>
                <p className="text-xl font-semibold">{laiSuatUocTinh > 0 ? `${laiSuatUocTinh}%/nÄƒm` : "---"}</p>
              </div>

              {loaiDaChon && loaiDaChon.kyHanThang > 0 && form.soTienBanDau && (
                <div className="pt-4 border-t border-emerald-400/30">
                  <p className="text-emerald-100 text-sm">Tiá»n lÃ£i dá»± tÃ­nh cuá»‘i ká»³:</p>
                  <p className="text-2xl font-bold text-yellow-300">
                    +{Math.round((Number(form.soTienBanDau) * (laiSuatUocTinh / 100) * (loaiDaChon.kyHanThang * 30)) / 365).toLocaleString('vi-VN')} â‚«
                  </p>
                </div>
              )}
            </div>

            <p className="mt-6 text-xs text-emerald-100 opacity-80 text-center">
              * Æ¯á»›c lÆ°á»£ng hiá»ƒn thá»‹ dÃ¹ng cÃ´ng thá»©c: Gá»‘c * LÃ£i * Ká»³ háº¡n hiá»ƒn thá»‹ thá»±c.
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
