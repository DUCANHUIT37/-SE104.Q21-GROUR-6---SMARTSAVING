import { useState, useMemo, useEffect } from 'react';
import { History, Search, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { giaoDichApi } from '../../services/api';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(Math.abs(val || 0)) + ' ₫';
const formatNgay = (str) => new Date(str).toLocaleString('vi-VN');

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [loaiFilter, setLoaiFilter] = useState('ALL');
  const [giaoDichData, setGiaoDichData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiaoDich = async () => {
      try {
        const res = await giaoDichApi.layTatCa();
        setGiaoDichData(res.data.data);
      } catch (error) {
        console.error('Lỗi lấy danh sách giao dịch:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGiaoDich();
  }, []);

  const enriched = useMemo(() => {
    return giaoDichData.map(gd => {
      let uiType = 'DEPOSIT';
      if (gd.loaiGiaoDich === 'tat_toan' || gd.loaiGiaoDich === 'rut_tien') {
        uiType = 'WITHDRAWAL';
      }
      
      return { 
        ...gd, 
        maSo: gd.soTietKiemMaSo || '—', 
        uiType 
      };
    });
  }, [giaoDichData]);

  const filtered = useMemo(() => enriched.filter(gd => {
    const q = search.toLowerCase();
    const matchSearch = 
      gd.maSo.toLowerCase().includes(q) || 
      (gd.maGiaoDich || '').toLowerCase().includes(q) ||
      (gd.ghiChu || '').toLowerCase().includes(q);
    
    const matchLoai = loaiFilter === 'ALL' || gd.uiType === loaiFilter;
    return matchSearch && matchLoai;
  }), [enriched, search, loaiFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <History className="w-8 h-8 mr-3 text-orange-500" />
          Lịch Sử Giao Dịch
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Tra cứu toàn bộ lịch sử gửi tiền, rút tiền được ghi nhận trong hệ thống.</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1f2937] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã giao dịch hoặc mã sổ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
        </div>
        <select
          value={loaiFilter}
          onChange={(e) => setLoaiFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
        >
          <option value="ALL">Tất cả loại giao dịch</option>
          <option value="DEPOSIT">Chỉ Nộp tiền (Mở sổ/Gửi thêm)</option>
          <option value="WITHDRAWAL">Chỉ Rút tiền (Tất toán)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Mã GD</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Thời gian</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Mã Sổ</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Loại Giao Dịch</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Số Tiền (VNĐ)</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Ghi Chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-4 font-mono text-gray-500 dark:text-gray-500">
                      #{t.maGiaoDich.slice(-8)}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatNgay(t.thoiGian)}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-emerald-500 whitespace-nowrap">
                      #{t.maSo.slice(-6)}
                    </td>
                    <td className="px-4 py-4">
                      {t.uiType === "DEPOSIT" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <ArrowDownRight className="w-3 h-3" /> Nộp tiền
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-800">
                          <ArrowUpRight className="w-3 h-3" /> Rút / Tất toán
                        </span>
                      )}
                    </td>
                    <td className={cn(
                      'text-right px-4 py-4 font-bold whitespace-nowrap',
                      t.uiType === 'WITHDRAWAL' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    )}>
                      {t.uiType === 'WITHDRAWAL' ? '-' : '+'}{formatTien(t.soTien)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-gray-900 dark:text-gray-300 max-w-xs truncate">{t.ghiChu}</div>
                      {/* Neu co lai trong ghi chu, hien thi dong phu (Gia lap tu fakeDb) */}
                      {t.ghiChu.includes('Lãi:') && (
                        <div className="text-xs text-emerald-500 font-medium">
                          + {t.ghiChu.split('Lãi:')[1]}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
          Hiển thị {filtered.length} / {enriched.length} giao dịch
        </div>
      </div>
    </div>
  );
}
