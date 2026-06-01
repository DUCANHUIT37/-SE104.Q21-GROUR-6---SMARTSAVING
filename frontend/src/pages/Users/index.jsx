import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, XCircle, Shield, Loader2, X, Edit2, Save, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { nguoiDungApi } from '../../services/api';
import { cn } from '../../lib/utils';
import AlertModal, { useAlert } from '../../components/AlertModal';

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

export default function Users() {
  const { alertProps, showAlert } = useAlert();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hoTen: '', cmnd: '', soDienThoai: '', diaChi: '', loaiNguoiDung: 'nhan_vien', email: '', matKhau: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserForm, setEditUserForm] = useState({});
  const [updatingUser, setUpdatingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuth();

  const handleOpenEdit = () => {
    setEditUserForm({
      hoTen: selectedUser.hoTen || '',
      soDienThoai: selectedUser.soDienThoai || '',
      diaChi: selectedUser.diaChi || '',
      taoLuc: selectedUser.taoLuc ? selectedUser.taoLuc.substring(0, 16) : ''
    });
    setIsEditingUser(true);
  };

  const handleUpdateUser = async () => {
    try {
      setUpdatingUser(true);
      const payload = { ...editUserForm };
      if (payload.taoLuc) {
         payload.taoLuc = payload.taoLuc + ':00';
      } else {
         delete payload.taoLuc;
      }
      const res = await nguoiDungApi.capNhat(selectedUser.id, payload);
      showAlert({ type: 'success', title: 'Cập nhật thành công', message: 'Thông tin người dùng đã được lưu lại.' });
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? res.data.data : u));
      setSelectedUser(res.data.data);
      setIsEditingUser(false);
    } catch (error) {
      showAlert({ type: 'error', title: 'Lỗi cập nhật', message: error.response?.data?.message || 'Không thể cập nhật thông tin.' });
    } finally {
      setUpdatingUser(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await nguoiDungApi.layTatCa();
      setUsers(res.data.data || []);
    } catch (error) {
      showAlert({ type: 'error', title: 'Lỗi tải dữ liệu', message: 'Không thể tải danh sách người dùng. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (u) => {
    try {
      await nguoiDungApi.toggleKichHoat(u.id);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, kichHoat: !x.kichHoat } : x));
      showAlert({
        type: 'success',
        title: u.kichHoat ? 'Đã khóa tài khoản' : 'Đã kích hoạt tài khoản',
        message: u.kichHoat ? `Tài khoản ${u.hoTen} đã bị khóa thành công.` : `Tài khoản ${u.hoTen} đã được kích hoạt trở lại.`,
      });
    } catch (error) {
      showAlert({ type: 'error', title: 'Lỗi cập nhật', message: error.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản.' });
    }
  };

  const handleXoa = (u) => {
    showAlert({
      type: 'warning',
      title: 'Xác nhận xóa tài khoản',
      message: `Bạn có chắc chắn muốn xóa tài khoản của "${u.hoTen}"? Hành động này không thể hoàn tác và chỉ thực hiện được nếu người dùng chưa có dữ liệu giao dịch.`,
      confirmLabel: 'Xóa ngay',
      cancelLabel: 'Hủy',
      onConfirm: async () => {
        try {
          await nguoiDungApi.xoa(u.id);
          setUsers(prev => prev.filter(x => x.id !== u.id));
          showAlert({ type: 'success', title: 'Xóa thành công', message: 'Tài khoản đã được xóa khỏi hệ thống.' });
        } catch (error) {
          showAlert({ type: 'error', title: 'Không thể xóa', message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản.' });
        }
      }
    });
  };

  const handlePromote = (u) => {
    showAlert({
      type: 'warning',
      title: 'Xác nhận thăng cấp',
      message: `Bạn có chắc chắn muốn thăng cấp "${u.hoTen}" thành Giao Dịch Viên không?`,
      confirmLabel: 'Thăng cấp',
      cancelLabel: 'Hủy',
      onConfirm: async () => {
        try {
          const res = await nguoiDungApi.thangCapTeller(u.id);
          setUsers(prev => prev.map(x => x.id === u.id ? res.data.data : x));
          showAlert({ type: 'success', title: 'Thăng cấp thành công', message: `${u.hoTen} đã được thăng cấp thành Giao Dịch Viên.` });
        } catch (error) {
          showAlert({ type: 'error', title: 'Lỗi thăng cấp', message: error.response?.data?.message || 'Không thể thực hiện thăng cấp.' });
        }
      },
    });
  };

  const handleDemote = (u) => {
    showAlert({
      type: 'warning',
      title: 'Xác nhận hạ cấp',
      message: `Bạn có chắc chắn muốn hạ cấp "${u.hoTen}" xuống thành Khách Hàng không?`,
      confirmLabel: 'Hạ cấp',
      cancelLabel: 'Hủy',
      onConfirm: async () => {
        try {
          const res = await nguoiDungApi.haQuyenUser(u.id);
          setUsers(prev => prev.map(x => x.id === u.id ? res.data.data : x));
          showAlert({ type: 'success', title: 'Hạ cấp thành công', message: `${u.hoTen} đã được hạ cấp xuống Khách Hàng.` });
        } catch (error) {
          showAlert({ type: 'error', title: 'Lỗi hạ cấp', message: error.response?.data?.message || 'Không thể thực hiện hạ cấp.' });
        }
      },
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.hoTen || !form.cmnd) {
      showAlert({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập đủ Họ Tên và CMND/CCCD.' });
      return;
    }
    if (!form.email || !form.matKhau) {
      showAlert({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập Email và Mật khẩu.' });
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
        email: form.email,
        matKhau: form.matKhau,
      });
      showAlert({ type: 'success', title: 'Tạo hồ sơ thành công', message: `Hồ sơ người dùng "${form.hoTen}" đã được tạo thành công trong hệ thống.` });
      setForm({ hoTen: '', cmnd: '', soDienThoai: '', diaChi: '', loaiNguoiDung: 'nhan_vien', email: '', matKhau: '' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      showAlert({ type: 'error', title: 'Lỗi tạo hồ sơ', message: error.response?.data?.message || 'Không thể tạo hồ sơ người dùng. Vui lòng thử lại.' });
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
              <input type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@smartsaving.vn" required
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu *</label>
              <input type="password" value={form.matKhau || ''} onChange={e => setForm(f => ({ ...f, matKhau: e.target.value }))} placeholder="••••••••" required
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-all" />
            </div>
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

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo họ tên, email hoặc vai trò..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
        />
      </div>

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
            {users.filter(u => {
              const q = searchQuery.toLowerCase();
              return (u.hoTen || '').toLowerCase().includes(q) ||
                     (u.email || '').toLowerCase().includes(q) ||
                     (ROLE_LABEL[u.quyenHan] || '').toLowerCase().includes(q);
            }).sort((a, b) => {
              const rank = { 'ADMIN': 1, 'TELLER': 2, 'USER': 3 };
              const rA = rank[a.quyenHan] || 4;
              const rB = rank[b.quyenHan] || 4;
              if (rA !== rB) return rA - rB;
              return (a.hoTen || '').localeCompare(b.hoTen || '');
            }).map(u => (
              <tr key={u.id} onClick={() => currentUser?.quyenHan === 'ROLE_quan_tri_vien' ? setSelectedUser(u) : null} className={cn("transition-colors", currentUser?.quyenHan === 'ROLE_quan_tri_vien' ? "cursor-pointer hover:bg-gray-50/50 dark:hover:bg-white/[0.02]" : "")}>
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
                    {u.quyenHan !== 'ADMIN' && (
                      <button onClick={(e) => { e.stopPropagation(); handleToggle(u); }}
                        className={cn('w-[85px] text-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors', u.kichHoat ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400')}>
                        {u.kichHoat ? 'Khóa' : 'Kích hoạt'}
                      </button>
                    )}
                    {u.quyenHan === 'USER' && (
                      <button onClick={(e) => { e.stopPropagation(); handlePromote(u); }}
                        className="w-[135px] text-center px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold transition-colors">
                        Nâng quyền Teller
                      </button>
                    )}
                    {u.quyenHan === 'TELLER' && (
                      <button onClick={(e) => { e.stopPropagation(); handleDemote(u); }}
                        className="w-[135px] text-center px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold transition-colors">
                        Hạ quyền User
                      </button>
                    )}
                    {u.quyenHan !== 'ADMIN' && (
                      <button onClick={(e) => { e.stopPropagation(); handleXoa(u); }}
                        className="w-[60px] text-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-semibold transition-colors">
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertModal {...alertProps} />

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setSelectedUser(null); setIsEditingUser(false); }}>
          <div className="bg-white dark:bg-[#1f2937] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{isEditingUser ? 'Chỉnh sửa Người Dùng' : 'Chi tiết Người Dùng'}</h3>
              <button onClick={() => { setSelectedUser(null); setIsEditingUser(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-2xl">
                  {selectedUser.hoTen?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  {isEditingUser ? (
                    <input type="text" value={editUserForm.hoTen} onChange={e => setEditUserForm(f => ({ ...f, hoTen: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white font-bold text-lg outline-none focus:border-emerald-500 mb-1" placeholder="Họ và tên" />
                  ) : (
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedUser.hoTen}</h4>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email || 'Chưa cập nhật email'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">CMND/CCCD</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.cmnd || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Số điện thoại</p>
                  {isEditingUser ? (
                    <input type="text" value={editUserForm.soDienThoai} onChange={e => setEditUserForm(f => ({ ...f, soDienThoai: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white font-semibold outline-none focus:border-emerald-500" placeholder="Số điện thoại" />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.soDienThoai || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Vai trò</p>
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', ROLE_COLOR[selectedUser.quyenHan])}>
                    <Shield className="w-3 h-3" />{ROLE_LABEL[selectedUser.quyenHan]}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Địa chỉ</p>
                  {isEditingUser ? (
                    <input type="text" value={editUserForm.diaChi} onChange={e => setEditUserForm(f => ({ ...f, diaChi: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white font-semibold outline-none focus:border-emerald-500" placeholder="Địa chỉ" />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedUser.diaChi || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Trạng thái</p>
                  <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold', selectedUser.kichHoat ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400')}>
                    {selectedUser.kichHoat ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {selectedUser.kichHoat ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Ngày tạo</p>
                  {isEditingUser ? (
                    <input type="datetime-local" value={editUserForm.taoLuc} onChange={e => setEditUserForm(f => ({ ...f, taoLuc: e.target.value }))} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white font-semibold outline-none focus:border-emerald-500" />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedUser.taoLuc ? new Date(selectedUser.taoLuc).toLocaleString('vi-VN') : 'Không rõ'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              {isEditingUser ? (
                <>
                  <button onClick={() => setIsEditingUser(false)} className="px-4 py-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors">
                    Hủy
                  </button>
                  <button onClick={handleUpdateUser} disabled={updatingUser} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-50">
                    {updatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleOpenEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-colors">
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                  <button onClick={() => { setSelectedUser(null); setIsEditingUser(false); }} className="px-4 py-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm transition-colors">
                    Đóng
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
