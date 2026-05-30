import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, Save, Loader2, Plus } from 'lucide-react';
import { thamSoApi, loaiTietKiemApi } from '../../services/api';
import { cn } from '../../lib/utils';

export default function Settings() {
  const [thamSo, setThamSo] = useState({});
  const [laiSuat, setLaiSuat] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newTerm, setNewTerm] = useState({ tenLoai: '', kyHanThang: '', laiSuatNam: '' });
  const [addingTerm, setAddingTerm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
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
      setLaiSuat(lsRes.data.data);
    } catch (error) {
      toast.error('Không thể tải cấu hình từ máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await loaiTietKiemApi.toggleTrangThai(id);
      setLaiSuat(prev => prev.map(lt => lt.id === id ? { ...lt, dangApDung: !lt.dangApDung } : lt));
      toast.success('Đã thay đổi trạng thái kỳ hạn');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi đổi trạng thái');
    }
  };

  const handleUpdateRate = async (id, val) => {
    const ratePercent = Number(val);
    if (isNaN(ratePercent)) return;
    try {
      await loaiTietKiemApi.capNhatLaiSuat(id, ratePercent / 100);
      setLaiSuat(prev => prev.map(lt => lt.id === id ? { ...lt, laiSuatNam: ratePercent / 100 } : lt));
      toast.success('Đã cập nhật lãi suất');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật lãi suất');
    }
  };

  const handleAddTerm = async () => {
    if (!newTerm.tenLoai || !newTerm.kyHanThang || !newTerm.laiSuatNam) {
      toast.error('Vui lòng điền đầy đủ thông tin kỳ hạn mới');
      return;
    }
    setAddingTerm(true);
    try {
      const payload = {
        tenLoai: newTerm.tenLoai,
        kyHanThang: Number(newTerm.kyHanThang),
        laiSuatNam: Number(newTerm.laiSuatNam) / 100,
        dangApDung: true,
        soTienGuiToiThieu: Number(thamSo.so_tien_gui_toi_thieu) || 1000000
      };
      await loaiTietKiemApi.taoMoi(payload);
      toast.success('Thêm kỳ hạn mới thành công');
      setNewTerm({ tenLoai: '', kyHanThang: '', laiSuatNam: '' });
      fetchSettings(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thêm kỳ hạn mới');
    } finally {
      setAddingTerm(false);
    }
  };

  // WARN-04 FIX: Implement real save using thamSoApi.capNhat
  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { khoa: 'so_tien_gui_toi_thieu',      value: thamSo.so_tien_gui_toi_thieu },
        { khoa: 'so_tien_gui_them_toi_thieu', value: thamSo.so_tien_gui_them_toi_thieu },
        { khoa: 'thoi_gian_gui_toi_thieu_ngay', value: thamSo.thoi_gian_gui_toi_thieu_ngay },
      ].filter(u => u.value !== undefined && u.value !== '');

      await Promise.all(
        updates.map(u => thamSoApi.capNhat(u.khoa, u.value))
      );
      toast.success('Đã lưu cài đặt thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu tham số');
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
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
        {/* WARN-04 FIX: Use actual DB key names (snake_case) matching API response */}
        <SField label="Tiền gời tối thiểu khi mở sổ (₫)" value={thamSo.so_tien_gui_toi_thieu} onChange={v => setThamSo(t => ({ ...t, so_tien_gui_toi_thieu: v }))} />
        <SField label="Tiền gời thêm tối thiểu (₫)" value={thamSo.so_tien_gui_them_toi_thieu} onChange={v => setThamSo(t => ({ ...t, so_tien_gui_them_toi_thieu: v }))} />
        <SField label="Số ngày gời tối thiểu trước khi rút (KKH)" value={thamSo.thoi_gian_gui_toi_thieu_ngay} onChange={v => setThamSo(t => ({ ...t, thoi_gian_gui_toi_thieu_ngay: v }))} suffix="ngày" step={1} />
        
        <div className="flex justify-end mt-4">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg font-semibold transition-colors text-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Tham Số
          </button>
        </div>
      </div>

      {/* Danh Sách Kỳ Hạn & Lãi Suất */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg">Danh Sách Kỳ Hạn & Lãi Suất</h3>
        
        <div className="space-y-4">
          {laiSuat.map((lt) => {
            const displayRate = parseFloat((lt.laiSuatNam * 100).toFixed(3));
            return (
              <div key={lt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111827]/50">
                <div className="flex items-center gap-4">
                  {/* Toggle Switch */}
                  <button 
                    onClick={() => handleToggle(lt.id)}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      lt.dangApDung ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600"
                    )}
                  >
                    <span 
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        lt.dangApDung ? "translate-x-5" : "translate-x-0"
                      )} 
                    />
                  </button>
                  <span className={cn("font-semibold", lt.dangApDung ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500")}>
                    {lt.tenLoai}
                  </span>
                  {!lt.dangApDung && (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                      Đã vô hiệu hóa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Lãi suất:</span>
                  <input 
                    type="number" step="0.01" min="0"
                    disabled={!lt.dangApDung}
                    defaultValue={displayRate}
                    onBlur={(e) => {
                      if (e.target.value != displayRate) {
                        handleUpdateRate(lt.id, e.target.value);
                      }
                    }}
                    className="w-24 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-900 dark:text-white text-sm text-center outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">%/năm</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Thêm kỳ hạn mới */}
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-[#111827]/30">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm kỳ hạn mới
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tên loại (VD: Kỳ hạn 15 tháng)</label>
            <input 
              type="text" 
              value={newTerm.tenLoai} onChange={e => setNewTerm({...newTerm, tenLoai: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Số tháng</label>
            <input 
              type="number" min="0"
              value={newTerm.kyHanThang} onChange={e => setNewTerm({...newTerm, kyHanThang: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Lãi suất (%/năm)</label>
            <input 
              type="number" step="0.01" min="0"
              value={newTerm.laiSuatNam} onChange={e => setNewTerm({...newTerm, laiSuatNam: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        <button 
          onClick={handleAddTerm} disabled={addingTerm}
          className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {addingTerm ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Thêm Mới'}
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
