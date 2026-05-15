import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PiggyBank, CalendarDays, ReceiptText, ShieldCheck, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  loaiTietKiemData, khachHangData, soTietKiemData, thamSoData,
  generateMaSo,
} from '../../data/fakeDb';

const formatTien = (val) => {
  if (!val) return '';
  const num = Number(val.toString().replace(/\D/g, ''));
  return num > 0 ? num.toLocaleString('vi-VN') : '';
};

export default function MoSo() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cmnd: '', hoTen: '', diaChi: '',
    loaiTietKiemId: '', soTienBanDau: '',
  });
  const [khachHangTimThay, setKhachHangTimThay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const loaiDangApDung = loaiTietKiemData.filter(lt => lt.dangApDung);
  const loaiDaChon = loaiDangApDung.find(lt => lt.id === Number(form.loaiTietKiemId));
  const laiSuatUocTinh = loaiDaChon ? loaiDaChon.laiSuatNam : 0;

  const handleCmndBlur = () => {
    const found = khachHangData.find(kh => kh.cmnd === form.cmnd.trim());
    if (found) {
      setKhachHangTimThay(found);
      setForm(f => ({ ...f, hoTen: found.hoTen, diaChi: found.diaChi }));
      toast.success(`Đã tìm thấy khách hàng: ${found.hoTen}`);
    } else {
      setKhachHangTimThay(null);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMoneyChange = (e) => {
    setForm({ ...form, soTienBanDau: e.target.value.replace(/\D/g, '') });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const minDeposit = thamSoData.soTienGuiToiThieu || 1000000;
    if (Number(form.soTienBanDau) < minDeposit) {
      toast.error(`Số tiền gửi phải lớn hơn hoặc bằng ${minDeposit.toLocaleString('vi-VN')} VNĐ!`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const maSo = generateMaSo();
      const ngayMo = new Date().toISOString().split('T')[0];
      const ngayDaoHan = loaiDaChon?.kyHanThang > 0
        ? new Date(new Date(ngayMo).setMonth(new Date(ngayMo).getMonth() + loaiDaChon.kyHanThang)).toISOString().split('T')[0]
        : null;

      const soMoi = {
        id: soTietKiemData.length + 1, maSo,
        khachHangId: khachHangTimThay?.id || null, // Trong thực tế sẽ cần tạo KH mới nếu chưa có
        loaiTietKiemId: Number(form.loaiTietKiemId),
        soTienBanDau: Number(form.soTienBanDau),
        soDuHienTai: Number(form.soTienBanDau),
        laiSuatMoSo: loaiDaChon?.laiSuatNam,
        ngayMo: ngayMo, ngayDaoHan,
        trangThai: 'dang_hoat_dong',
      };
      soTietKiemData.push(soMoi);

      setLoading(false);
      setSuccess({ maSo, soTienBanDau: form.soTienBanDau, loaiTietKiem: loaiDaChon?.tenLoai });
      toast.success(`Mở sổ tiết kiệm thành công!`);
    }, 1000);
  };

  const handleReset = () => {
    setForm({ cmnd: '', hoTen: '', diaChi: '', loaiTietKiemId: '', soTienBanDau: '' });
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <PiggyBank className="w-8 h-8 mr-3 text-emerald-500" />
          Mở Sổ Tiết Kiệm Mới (BM1)
        </h2>
        <p className="text-gray-500 mt-2">Điền thông tin CMND để hệ thống tạo hoặc tự động tra cứu khách hàng hiện tại.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Form Nhập Liệu */}
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
                  <input
                    type="text" name="cmnd" required
                    value={form.cmnd} onChange={handleChange} onBlur={handleCmndBlur}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    placeholder="VD: 079123456789"
                  />
                  {khachHangTimThay && (
                    <p className="text-xs text-emerald-500 font-medium">✓ Khách hàng cũ</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên khách hàng</label>
                  <input
                    type="text" name="hoTen" required
                    value={form.hoTen} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    placeholder="VD: NGUYEN VAN A"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ hiện tại</label>
                  <input
                    type="text" name="diaChi" required
                    value={form.diaChi} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    placeholder="VD: Số 123, Phường A, Quận B"
                  />
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
                  <p className="text-xs text-gray-500">Tối thiểu: {thamSoData.soTienGuiToiThieu.toLocaleString('vi-VN')} VNĐ</p>
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
                        {loai.tenLoai} (Lãi: {loai.laiSuatNam}%/năm)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
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
  );
}
