import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react';
import { thamSoApi, loaiTietKiemApi } from '../../services/api';
import { cn } from '../../lib/utils';

export default function Settings() {
  const [thamSo, setThamSo] = useState({});
  const [laiSuat, setLaiSuat] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [tsRes, lsRes] = await Promise.all([
          thamSoApi.layTatCa(),
          loaiTietKiemApi.layTatCa()
        ]);
        
        // Convert thamSo array to object for easier state management
        const tsObj = {};
        tsRes.data.data.forEach(item => {
          tsObj[item.khoa] = item.giaTri;
        });
        setThamSo(tsObj);
        setLaiSuat(lsRes.data.data);
      } catch (error) {
        toast.error('Không thể tải cấu hình từ máy chủ');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    // In a real implementation, you would loop through changes and call PUT /api/thamso/{khoa}
    toast.error('Tính năng lưu đang được cập nhật (Backend cần API cập nhật hàng loạt)');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Cài Đặt Tham Số</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Thay đổi các qui định vận hành hệ thống (QĐ6 — chỉ Admin)</p>
      </div>

      {/* Tham số chung */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl"><SettingsIcon className="w-5 h-5 text-emerald-400" /></div>
          <h3 className="font-bold text-gray-900 dark:text-white">Tham Số Giao Dịch</h3>
        </div>
        <SField label="Tiền gởi tối thiểu khi mở sổ (₫)" value={thamSo.soTienGuiToiThieu} onChange={v => setThamSo(t => ({ ...t, soTienGuiToiThieu: Number(v) }))} />
        <SField label="Tiền gởi thêm tối thiểu (₫)" value={thamSo.soTienGuiThemToiThieu} onChange={v => setThamSo(t => ({ ...t, soTienGuiThemToiThieu: Number(v) }))} />
        <SField label="Số ngày gởi tối thiểu trước khi rút (KKH)" value={thamSo.soNgayGuiToiThieu} onChange={v => setThamSo(t => ({ ...t, soNgayGuiToiThieu: Number(v) }))} suffix="ngày" />
      </div>

      {/* Lãi suất */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Lãi Suất Theo Kỳ Hạn</h3>
        {laiSuat.map((lt, i) => (
          <SField key={lt.id} label={lt.tenLoai} value={lt.laiSuatNam} onChange={v => setLaiSuat(arr => arr.map((x, j) => j === i ? { ...x, laiSuatNam: Number(v) } : x))} suffix="%/năm" step={0.1} />
        ))}
      </div>

      <div className="flex gap-3 justify-end">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold transition-colors">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </button>
      </div>
    </div>
  );
}

function SField({ label, value, onChange, suffix = '₫', step = 1 }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-600 dark:text-gray-400 flex-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={e => onChange(e.target.value)} step={step} min={0}
          className="w-36 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm text-right outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
        <span className="text-xs text-gray-400 w-12">{suffix}</span>
      </div>
    </div>
  );
}
