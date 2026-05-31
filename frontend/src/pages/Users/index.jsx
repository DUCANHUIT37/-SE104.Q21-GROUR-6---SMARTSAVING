import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import { nguoiDungApi } from '../../services/api';
import { cn } from '../../lib/utils';

const ROLE_COLOR = {
  ADMIN:  'bg-rose-500/10 text-rose-400',
  TELLER: 'bg-sky-500/10 text-sky-400',
  USER:   'bg-gray-500/10 text-gray-400',
};
const ROLE_LABEL = {
  ADMIN:  'Quản trị viên',
  TELLER: 'Giao dịch viên',
  USER:   'Khách hàng',
};
const ROLE_OPTIONS = [
  { value: 'ADMIN',  label: 'Quản trị viên' },
  { value: 'TELLER', label: 'Giao dịch viên' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hoTen: '', cmnd: '', soDienThoai: '', diaChi: '', loaiNguoiDung: 'nhan_vien' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await nguoiDungApi.layTatCa();
      setUsers(res.data.data || []);
    } catch (error) {
      toast.error('Lỗi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  // WARN-03 FIX: Implement real toggle using PUT API
  const handleToggle = async (u) => {
    try {
      await nguoiDungApi.capNhat(u.id, { ...u, kichHoat: !u.kichHoat });
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, kichHoat: !x.kichHoat } : x));
      toast.success(u.kichHoat ? `Đã khóa tài khoản ${u.hoTen}` : `Đã kích hoạt ${u.hoTen}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi cập nhật trạng thái');
    }
  };
  const handlePromote = async (u) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thăng cấp ${u.hoTen} thành Giao Dịch Viên không?`)) return;
    try {
      const res = await nguoiDungApi.thangCapTeller(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? res.data.data : x));
      toast.success(`Đã thăng cấp ${u.hoTen} thành Giao Dịch Viên thành công!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi thăng cấp người dùng');
    }
  };

  // WARN-03 FIX: Implement create using POST /api/nguoidung
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.hoTen || !form.cmnd) {
      toast.error('Vui lòng nhập đủ Họ Tên và CMND/CCCD');
      return;
    }
    setSubmitting(true);
    try {
      await nguoiDungApi.taoMoi({
        hoTen: form.hoTen,
        cmnd: form.cmnd,
        soDienThoai: form.soDienThoai,
        diaChi: form.diaChi,
        loaiNguoiDung: form.loaiNguoiDung,
      });
      toast.success(`Đã tạo hồ sơ ${form.hoTen} thành công!`);
      setForm({ hoTen: '', cmnd: '', soDienThoai: '', diaChi: '', loaiNguoiDung: 'nhan_vien' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi tạo hồ sơ người dùng');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quản Lý Tài Khoản</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Quản lý người dùng và phân quyền hệ thống</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors">
          <UserPlus className="w-4 h-4" /> Thêm Tài Khoản
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Tạo Hồ Sơ Người Dùng Mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['Họ Tên *', 'hoTen', 'text', 'Nguyễn Văn X'], ['CMND/CCCD *', 'cmnd', 'text', '0123456789'], ['Số Điện Thoại', 'soDienThoai', 'text', '0900000000'], ['Địa Chỉ', 'diaChi', 'text', '123 Đường ABC']].map(([label, key, type, ph]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Loại</label>
              <select value={form.loaiNguoiDung} onChange={e => setForm(f => ({ ...f, loaiNguoiDung: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all">
                <option value="nhan_vien">Nhân viên</option>
                <option value="khach_hang">Khách hàng</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Hủy</button>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Tạo Hồ Sơ
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {['Họ Tên', 'Email', 'Vai Trò', 'Trạng Thái', 'Thao Tác'].map(h => (
                <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm">
                      {u.hoTen?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{u.hoTen}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">{u.email}</td>
                <td className="px-4 py-3.5">
                  <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit', ROLE_COLOR[u.quyenHan])}>
                    <Shield className="w-3 h-3" />{ROLE_LABEL[u.quyenHan]}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', u.kichHoat ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
                    {u.kichHoat ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.kichHoat ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(u)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors', u.kichHoat ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400')}>
                      {u.kichHoat ? 'Khóa' : 'Kích hoạt'}
                    </button>
                    {u.quyenHan === 'USER' && (
                      <button onClick={() => handlePromote(u)}
                        className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors">
                        Nâng quyền Teller
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
