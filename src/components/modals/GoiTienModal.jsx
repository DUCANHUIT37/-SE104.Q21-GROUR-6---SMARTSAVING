import { useState } from 'react';
import { XCircle, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loaiTietKiemData, thamSoData, soTietKiemData, lichSuGiaoDichData, generateMaGiaoDich } from '../../data/fakeDb';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' ₫';

export default function GoiTienModal({ so, onClose, onSuccess }) {
  const loai = loaiTietKiemData.find(lt => lt.id === so.loaiTietKiemId);
  const [soTien, setSoTien] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra điều kiện kỳ hạn (chỉ cảnh báo, không chặn với sổ không kỳ hạn)
  const kiemTraKyHan = () => {
    if (!loai || loai.kyHanThang === 0) return null; // KKH: không cần kiểm tra
    if (!so.ngayDaoHan) return null;
    const today = new Date();
    const daoHan = new Date(so.ngayDaoHan);
    if (today < daoHan) {
      const ngayConLai = Math.ceil((daoHan - today) / (1000 * 60 * 60 * 24));
      return `Sổ này chưa đến kỳ hạn. Còn ${ngayConLai} ngày nữa (${daoHan.toLocaleDateString('vi-VN')}).`;
    }
    return null;
  };

  const canhBaoKyHan = kiemTraKyHan();

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(soTien);
    if (!amount || amount < thamSoData.soTienGuiThemToiThieu) {
      setError(`Số tiền tối thiểu là ${formatTien(thamSoData.soTienGuiThemToiThieu)}`);
      return;
    }
    if (canhBaoKyHan) { setError('Không thể gởi thêm khi chưa đến kỳ hạn tính lãi.'); return; }
    setLoading(true);
    setTimeout(() => {
      // Cập nhật fakeDb
      const idx = soTietKiemData.findIndex(s => s.id === so.id);
      if (idx !== -1) {
        soTietKiemData[idx].soDuHienTai += amount;
        // Cập nhật ngày đáo hạn tiếp theo
        if (loai && loai.kyHanThang > 0 && so.ngayDaoHan) {
          const newDaoHan = new Date(so.ngayDaoHan);
          newDaoHan.setMonth(newDaoHan.getMonth() + loai.kyHanThang);
          soTietKiemData[idx].ngayDaoHan = newDaoHan.toISOString().split('T')[0];
        }
      }
      lichSuGiaoDichData.push({
        id: lichSuGiaoDichData.length + 1,
        maGiaoDich: generateMaGiaoDich('PG'),
        soTietKiemId: so.id,
        loaiGiaoDich: 'goi_them',
        soTien: amount,
        soDuTruoc: so.soDuHienTai,
        soDuSau: so.soDuHienTai + amount,
        ghiChu: 'Gởi thêm tiền',
        thoiGian: new Date().toISOString(),
      });
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <ModalHeader icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} title="Lập Phiếu Gởi Tiền" color="emerald" />

        <InfoRow label="Mã sổ:" value={<span className="font-mono font-bold text-emerald-400">{so.maSo}</span>} />
        <InfoRow label="Loại TK:" value={loai?.tenLoai} />
        <InfoRow label="Số dư hiện tại:" value={formatTien(so.soDuHienTai)} />
        {so.ngayDaoHan && <InfoRow label="Ngày đáo hạn:" value={new Date(so.ngayDaoHan).toLocaleDateString('vi-VN')} />}

        {canhBaoKyHan && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{canhBaoKyHan}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Số tiền gởi thêm * (tối thiểu {formatTien(thamSoData.soTienGuiThemToiThieu)})
          </label>
          <input
            type="number" value={soTien} onChange={e => { setSoTien(e.target.value); setError(''); }}
            placeholder="100,000" min={thamSoData.soTienGuiThemToiThieu} step={100000}
            className={inputCls(!!error)}
          />
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3" />{error}</p>}
        </div>

        {soTien > 0 && (
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-sm">
            <p className="text-gray-400">Số dư sau khi gởi:</p>
            <p className="font-bold text-emerald-400 text-lg">{formatTien(so.soDuHienTai + Number(soTien))}</p>
          </div>
        )}

        <ModalActions loading={loading} onClose={onClose} submitLabel="Xác Nhận Gởi Tiền" submitColor="emerald" />
      </form>
    </Overlay>
  );
}

// Shared components
export function Overlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1f2937] rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
          <XCircle className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ icon, title, color }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
      <div className={`p-2 bg-${color}-500/10 rounded-xl`}>{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function ModalActions({ loading, onClose, submitLabel, submitColor = 'emerald' }) {
  const colorMap = { emerald: 'bg-emerald-500 hover:bg-emerald-600', rose: 'bg-rose-500 hover:bg-rose-600' };
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        Hủy
      </button>
      <button type="submit" disabled={loading} className={cn('flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60', colorMap[submitColor])}>
        {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {loading ? 'Đang xử lý...' : submitLabel}
      </button>
    </div>
  );
}

const inputCls = (error) => cn(
  'w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all',
  'bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white placeholder-gray-400',
  error ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500/30'
    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30'
);
