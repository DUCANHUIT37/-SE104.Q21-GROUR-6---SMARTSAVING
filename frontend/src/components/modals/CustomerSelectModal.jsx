import { useState, useEffect, useRef } from 'react';
import { Search, X, UserCheck, Loader2, Users, ChevronRight } from 'lucide-react';
import { nguoiDungApi } from '../../services/api';

/**
 * CustomerSelectModal – popup chọn khách hàng từ DB
 *
 * Props:
 *   open      {boolean}   – hiển thị/ẩn
 *   onClose   {function}  – đóng modal
 *   onSelect  {function}  – callback(customer) khi chọn xong
 */
export default function CustomerSelectModal({ open, onClose, onSelect }) {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const searchRef = useRef(null);

  // Fetch danh sách khách hàng khi mở modal
  useEffect(() => {
    if (!open) return;
    setSearch('');
    setError('');
    fetchCustomers();
    // Auto-focus ô tìm kiếm
    setTimeout(() => searchRef.current?.focus(), 100);
  }, [open]);

  // Filter realtime theo search
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(customers);
      return;
    }
    const q = search.toLowerCase().trim();
    setFiltered(
      customers.filter(c =>
        c.hoTen?.toLowerCase().includes(q) ||
        c.cmnd?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.soDienThoai?.includes(q)
      )
    );
  }, [search, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await nguoiDungApi.layKhachHang();
      const data = res.data?.data ?? [];
      setCustomers(data);
      setFiltered(data);
    } catch (err) {
      setError('Không thể tải danh sách khách hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (customer) => {
    onSelect(customer);
    onClose();
  };

  // Đóng bằng Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-2xl flex flex-col customer-modal-in"
        style={{ maxHeight: '85vh', animation: 'customerModalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Chọn Khách Hàng</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {loading ? 'Đang tải...' : `${filtered.length} khách hàng`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm theo tên, CMND, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách khách hàng */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải danh sách khách hàng...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={fetchCustomers}
                className="text-xs text-emerald-500 hover:text-emerald-400 underline"
              >
                Thử lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {search ? `Không tìm thấy khách hàng phù hợp với "${search}"` : 'Chưa có khách hàng nào trong hệ thống'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors text-left group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      {c.hoTen?.charAt(0)?.toUpperCase() ?? '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {c.hoTen}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          CMND: {c.cmnd}
                        </span>
                        {c.email && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {c.email}
                          </span>
                        )}
                      </div>
                      {c.soDienThoai && c.soDienThoai !== '' && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          📞 {c.soDienThoai}
                        </p>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {c.kichHoat ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          Đã khóa
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Chọn khách hàng để tự động điền thông tin vào form
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @keyframes customerModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
