import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, Loader2, Plus } from 'lucide-react';
import { thamSoApi, loaiTietKiemApi } from '../../services/api';
import { cn } from '../../lib/utils';

export default function Settings() {
  const [thamSo, setThamSo] = useState({});
  const [originalThamSo, setOriginalThamSo] = useState({});
  const [laiSuat, setLaiSuat] = useState([]);
  
  const [newTerm, setNewTerm] = useState({ tenLoai: '', kyHanThang: '', laiSuatNam: '' });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const [tsRes, lsRes] = await Promise.all([
        thamSoApi.layTatCa(),
        loaiTietKiemApi.layTatCa()
      ]);
      
      const tsObj = {};
      tsRes.data.data.forEach(item => {
        tsObj[item.khoa] = item.giaTri;
      });
      setThamSo(tsObj);
      setOriginalThamSo(tsObj);
      
      const enrichedLaiSuat = lsRes.data.data.map(lt => ({
        ...lt,
        laiSuatNam: Number((lt.laiSuatNam * 100).toFixed(2)),
        originalLaiSuatNam: Number((lt.laiSuatNam * 100).toFixed(2)),
        originalDangApDung: lt.dangApDung
      }));
      // Sort to show active first or by kyHanThang
      enrichedLaiSuat.sort((a, b) => a.kyHanThang - b.kyHanThang);
      setLaiSuat(enrichedLaiSuat);
    } catch (error) {
      toast.error('Không thể tải cấu hình từ máy chủ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const promises = [];
      
      // Save Tham So
      for (const key of Object.keys(thamSo)) {
        if (Number(thamSo[key]) !== Number(originalThamSo[key])) {
          if (Number(thamSo[key]) < 0) throw new Error(`Tham số ${key} không được âm!`);
          promises.push(thamSoApi.capNhat(key, Number(thamSo[key])));
        }
      }

      // Save Lai Suat & Toggles
      for (const lt of laiSuat) {
        if (Number(lt.laiSuatNam) !== Number(lt.originalLaiSuatNam)) {
          if (Number(lt.laiSuatNam) < 0) {
            throw new Error(`Lãi suất của ${lt.tenLoai} không được âm!`);
          }
          promises.push(loaiTietKiemApi.capNhatLaiSuat(lt.id, Number(lt.laiSuatNam) / 100));
        }
        if (lt.dangApDung !== lt.originalDangApDung) {
          promises.push(loaiTietKiemApi.batTatLoai(lt.id));
        }
      }

      if (promises.length === 0) {
        toast('Không có thay đổi nào để lưu.', { icon: 'ℹ️' });
        setSaving(false);
        return;
      }

      await Promise.all(promises);
      toast.success('Lưu thay đổi thành công!');
      fetchSettings(); // Refresh
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Lưu thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTerm = async () => {
    if (!newTerm.tenLoai.trim() || newTerm.kyHanThang === '' || newTerm.laiSuatNam === '') {
      toast.error('Vui lòng nhập đầy đủ thông tin kỳ hạn mới!');
      return;
    }
    if (Number(newTerm.laiSuatNam) < 0 || Number(newTerm.kyHanThang) < 0) {
      toast.error('Kỳ hạn và Lãi suất không được âm!');
      return;
    }
    
    setSaving(true);
    try {
      await loaiTietKiemApi.themLoai({
        tenLoai: newTerm.tenLoai,
        kyHanThang: Number(newTerm.kyHanThang),
        laiSuatNam: Number(newTerm.laiSuatNam) / 100,
        dangApDung: true
      });
      toast.success('Thêm kỳ hạn mới thành công!');
      setNewTerm({ tenLoai: '', kyHanThang: '', laiSuatNam: '' });
      fetchSettings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Có lỗi khi thêm kỳ hạn');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
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
        <SField label="Tiền gởi tối thiểu khi mở sổ (₫)" value={thamSo.soTienGuiToiThieu} onChange={v => setThamSo(t => ({ ...t, soTienGuiToiThieu: v }))} />
        <SField label="Tiền gởi thêm tối thiểu (₫)" value={thamSo.soTienGuiThemToiThieu} onChange={v => setThamSo(t => ({ ...t, soTienGuiThemToiThieu: v }))} />
        <SField label="Số ngày gởi tối thiểu trước khi rút (KKH)" value={thamSo.soNgayGuiToiThieu} onChange={v => setThamSo(t => ({ ...t, soNgayGuiToiThieu: v }))} suffix="ngày" />
      </div>

      {/* Lãi suất */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-900 dark:text-white">Danh Sách Kỳ Hạn & Lãi Suất</h3>
        </div>
        
        <div className="space-y-3">
          {laiSuat.map((lt, i) => (
            <TermField 
              key={lt.id} 
              label={lt.tenLoai} 
              value={lt.laiSuatNam} 
              isActive={lt.dangApDung}
              onChange={v => setLaiSuat(arr => arr.map((x, j) => j === i ? { ...x, laiSuatNam: v } : x))}
              onToggle={() => setLaiSuat(arr => arr.map((x, j) => j === i ? { ...x, dangApDung: !x.dangApDung } : x))}
            />
          ))}
          {laiSuat.length === 0 && <p className="text-sm text-gray-500 text-center py-2">Chưa có kỳ hạn nào.</p>}
        </div>
      </div>

      {/* Form Thêm Mới Kỳ Hạn */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-5 space-y-4">
        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Thêm kỳ hạn mới
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tên loại (VD: Kỳ hạn 15 tháng)</label>
            <input type="text" value={newTerm.tenLoai} onChange={e => setNewTerm({ ...newTerm, tenLoai: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Số tháng</label>
            <input type="number" min="0" value={newTerm.kyHanThang} onChange={e => setNewTerm({ ...newTerm, kyHanThang: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lãi suất (%/năm)</label>
            <input type="number" step="0.1" min="0" value={newTerm.laiSuatNam} onChange={e => setNewTerm({ ...newTerm, laiSuatNam: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-sm outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>
        <button onClick={handleAddTerm} disabled={saving}
          className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 dark:text-emerald-400 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2">
          Thêm Mới
        </button>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl font-bold transition-colors shadow-sm shadow-emerald-500/20">
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Đang xử lý...' : 'Lưu Tất Cả Thay Đổi'}
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
        <input type="number" value={value || ''} onChange={e => onChange(e.target.value)} step={step} min={0}
          className="w-36 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm text-right outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all" />
        <span className="text-xs text-gray-400 w-12">{suffix}</span>
      </div>
    </div>
  );
}

function TermField({ label, value, isActive, onChange, onToggle }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors", isActive ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937]" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-50 grayscale")}>
      <div className="flex items-center gap-3 flex-1">
        <button onClick={onToggle} type="button"
          className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none", isActive ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600")}>
          <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform", isActive ? "translate-x-2" : "-translate-x-2")} />
        </button>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", !isActive && "line-through text-gray-500")}>{label}</span>
          {!isActive && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-500/10 rounded-md">Đã vô hiệu hóa</span>}
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <label className="text-xs text-gray-500 mr-1">Lãi suất:</label>
        <input type="number" value={value || ''} onChange={e => onChange(e.target.value)} step="0.1" min={0} disabled={!isActive}
          className="w-24 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm text-right outline-none focus:border-emerald-500 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800" />
        <span className="text-xs text-gray-400 w-10">%/năm</span>
      </div>
    </div>
  );
}
