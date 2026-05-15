import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserPlus, CheckCircle, XCircle, Shield } from 'lucide-react';
import { taiKhoanData } from '../../data/fakeDb';
import { cn } from '../../lib/utils';

const ROLE_COLOR = { ADMIN: 'bg-rose-500/10 text-rose-400', TELLER: 'bg-sky-500/10 text-sky-400', USER: 'bg-gray-500/10 text-gray-400' };
const ROLE_LABEL = { ADMIN: 'Quản trị viên', TELLER: 'Giao dịch viên', USER: 'Khách hàng' };

export default function Users() {
  const [users, setUsers] = useState([...taiKhoanData]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: '', hoTen: '', quyenHan: 'TELLER', kichHoat: true });

  const handleToggle = (id) => {
    setUsers(arr => arr.map(u => u.id === id ? { ...u, kichHoat: !u.kichHoat } : u));
    toast.success('Đã cập nhật trạng thái tài khoản');
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const newUser = { ...form, id: users.length + 1 };
    setUsers(arr => [...arr, newUser]);
    taiKhoanData.push(newUser);
    toast.success(`Đã tạo tài khoản ${form.email}`);
    setShowForm(false);
    setForm({ email: '', hoTen: '', quyenHan: 'TELLER', kichHoat: true });
  };

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
          <h3 className="font-bold text-gray-900 dark:text-white">Tạo Tài Khoản Mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['Email *', 'email', 'email', 'admin@example.com'], ['Họ Tên *', 'hoTen', 'text', 'Nguyễn Văn X']].map(([label, key, type, ph]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} required
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Vai trò *</label>
              <select value={form.quyenHan} onChange={e => setForm(f => ({ ...f, quyenHan: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all">
                {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Hủy</button>
            <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-colors">Tạo Tài Khoản</button>
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
                  <button onClick={() => handleToggle(u.id)}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors', u.kichHoat ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400')}>
                    {u.kichHoat ? 'Khóa' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
