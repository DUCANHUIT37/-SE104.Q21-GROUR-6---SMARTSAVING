import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Loader2, RefreshCw } from 'lucide-react';
import BCPTIcon from '../../assets/BaoCaoKeToan_BaoCaoPhanTich.svg';
import TVGVIcon from '../../assets/BaoCaoKeToan_TongVonGuiVao.svg';
import TCGNIcon from '../../assets/BaoCaoKeToan_TongChiGiaiNgan.svg';
import CLTIcon from '../../assets/BaoCaoKeToan_ChenhLechThuc.svg';
import BDDCDTIcon from '../../assets/BaoCaoKeToan_BieuDoDoiChieuDongTien.svg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { baoCaoApi } from '../../services/api';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val ?? 0) + ' đ';

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = ['Hôm nay', 'Tháng này', 'Tháng trước'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getTodayStr = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const getYearMonth = (offset = 0) => {
  const d = new Date();
  d.setDate(1); // FIX: Set to 1st to prevent overflow on the 31st
  d.setMonth(d.getMonth() + offset);
  return { nam: d.getFullYear(), thang: d.getMonth() + 1 };
};

export default function FinancialReport() {
  const [activeTab, setActiveTab] = useState('Hôm nay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // BM5.1 — daily report rows: [{tenLoaiTietKiem, tongThu, tongChi, chenhLech}]
  const [ngayData, setNgayData] = useState([]);

  // BM5.2 — monthly report rows: [{tenLoaiTietKiem, ngay, soSoMo, soSoDong, chenhLech}]
  const [thangData, setThangData] = useState([]);

  // ─── Aggregate stats from server response ─────────────────────────────────
  const statsFromNgay = () => {
    const tongThu = ngayData.reduce((s, r) => s + Number(r.tongThu ?? 0), 0);
    const tongChi = ngayData.reduce((s, r) => s + Number(r.tongChi ?? 0), 0);
    return { tongThu, tongChi, chenhLech: tongThu - tongChi, soGiaoDich: ngayData.length };
  };

  const statsFromThang = () => {
    const soSoMo  = thangData.reduce((s, r) => s + Number(r.soSoMo  ?? 0), 0);
    const soSoDong = thangData.reduce((s, r) => s + Number(r.soSoDong ?? 0), 0);
    // Use soSoMo as proxy for tongThu & soSoDong as proxy for tongChi (for display parity)
    return { tongThu: soSoMo, tongChi: soSoDong, chenhLech: soSoMo - soSoDong, soGiaoDich: thangData.length };
  };

  const isNgayTab = activeTab === 'Hôm nay';
  const stats = isNgayTab ? statsFromNgay() : statsFromThang();

  // ─── Fetch logic ──────────────────────────────────────────────────────────
  const fetchReport = useCallback(async (tab) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'Hôm nay') {
        // BM5.1: server-side daily aggregation
        const res = await baoCaoApi.theo_ngay(getTodayStr());
        setNgayData(res.data?.data ?? []);
        setThangData([]);
      } else if (tab === 'Tháng này') {
        // BM5.2: current month
        const { nam, thang } = getYearMonth(0);
        const res = await baoCaoApi.theo_thang(nam, thang);
        setThangData(res.data?.data ?? []);
        setNgayData([]);
      } else if (tab === 'Tháng trước') {
        // BM5.2: previous month
        const { nam, thang } = getYearMonth(-1);
        const res = await baoCaoApi.theo_thang(nam, thang);
        setThangData(res.data?.data ?? []);
        setNgayData([]);
      } else {
        // Tất cả: use current year's data (year-to-date) via current month
        const { nam, thang } = getYearMonth(0);
        const res = await baoCaoApi.theo_thang(nam, thang);
        setThangData(res.data?.data ?? []);
        setNgayData([]);
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu báo cáo từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on tab change
  useEffect(() => {
    fetchReport(activeTab);
  }, [activeTab, fetchReport]);

  // ─── Chart data ───────────────────────────────────────────────────────────
  const chartData = isNgayTab
    // Daily: one bar per savings type
    ? ngayData.map(r => ({
        ngay: r.tenLoaiTietKiem,
        thu: Math.round(Number(r.tongThu ?? 0) / 1_000_000),
        chi: Math.round(Number(r.tongChi ?? 0) / 1_000_000),
      }))
    // Monthly: one bar per date
    : Object.values(
        thangData.reduce((acc, r) => {
          const key = r.ngay;
          if (!acc[key]) acc[key] = { ngay: r.ngay?.slice(8, 10) + '/' + r.ngay?.slice(5, 7), thu: 0, chi: 0 };
          acc[key].thu += Number(r.soSoMo ?? 0);
          acc[key].chi += Number(r.soSoDong ?? 0);
          return acc;
        }, {})
      );

  // ─── Excel Export ─────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const exportData = isNgayTab
      ? ngayData.map(r => ({
          'Loại Tiết Kiệm': r.tenLoaiTietKiem,
          'Tổng Thu (đ)': Number(r.tongThu ?? 0),
          'Tổng Chi (đ)': Number(r.tongChi ?? 0),
          'Chênh Lệch (đ)': Number(r.chenhLech ?? 0),
        }))
      : thangData.map(r => ({
          'Loại Tiết Kiệm': r.tenLoaiTietKiem,
          'Ngày': r.ngay,
          'Số Sổ Mở': r.soSoMo,
          'Số Sổ Đóng': r.soSoDong,
          'Chênh Lệch': r.chenhLech,
        }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab);
    XLSX.writeFile(wb, `BaoCao_${activeTab.replace(/ /g,'_')}.xlsx`);
  };

  // ─── Summary cards config ─────────────────────────────────────────────────
  const cashflowStats = [
    {
      title: isNgayTab ? "Tổng Vốn Gửi Vào" : "Tổng Sổ Mở Mới",
      value: isNgayTab ? formatTien(stats.tongThu) : `${stats.tongThu} sổ`,
      status: "Dòng tiền Dương (+)",
      statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      icon: TVGVIcon,
    },
    {
      title: isNgayTab ? "Tổng Chi Giải Ngân" : "Tổng Sổ Tất Toán",
      value: isNgayTab ? formatTien(stats.tongChi) : `${stats.tongChi} sổ`,
      status: "Dòng tiền Âm (-)",
      statusColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
      icon: TCGNIcon,
    },
    {
      title: "Chênh Lệch Thực (Ròng)",
      value: isNgayTab ? formatTien(stats.chenhLech) : `${stats.chenhLech} sổ`,
      valueColor: stats.chenhLech >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500",
      status: (
        <span>
          Ghi nhận <span className="font-bold text-gray-900 dark:text-white">{stats.soGiaoDich}</span> bản ghi.
        </span>
      ),
      statusColor: "text-gray-500 dark:text-gray-400",
      icon: CLTIcon,
    }
  ];

  return (
    <div className="space-y-6">

      {/* HEADER SECTION & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20">
               <span className="text-emerald-500">
                  <img src={BCPTIcon} alt="Title" className="w-6 h-6 object-contain opacity-90" />
                </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Báo Cáo Phân Tích</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Tổng hợp Cashflow (Dòng tiền thuần) — dữ liệu thực từ máy chủ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-1">
          {/* Time Filter Tabs */}
          <div className="bg-gray-100 dark:bg-[#1f2937] p-1.5 rounded-xl flex border border-gray-200 dark:border-gray-800 font-semibold text-xs shadow-sm">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === tab
                  ? 'bg-white dark:bg-[#374151] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200/50 dark:border-gray-700/50'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchReport(activeTab)}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 dark:bg-[#1f2937] hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>

          {/* Export Button */}
          <button onClick={handleExportExcel} disabled={loading} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 border border-emerald-600/50 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Tải Tệp Excel
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">Đang tải dữ liệu từ máy chủ...</span>
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/20">
          <span className="text-4xl">⚠️</span>
          <p className="font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <button onClick={() => fetchReport(activeTab)} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors">
            Thử lại
          </button>
        </div>
      )}

      {/* CASHFLOW STATS CARDS */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cashflowStats.map((stat, index) => (
              <div key={index} className="bg-white dark:bg-[#1f2937] p-7 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <img src={stat.icon} alt={stat.title} className="w-6 h-6 object-contain opacity-80 dark:opacity-90" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className={`text-2xl lg:text-3xl font-black tracking-tight ${stat.valueColor || 'text-gray-900 dark:text-white'}`}>
                    {stat.value}
                  </h2>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold tracking-widest ${stat.statusColor}`}>
                    {stat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* BAR CHART SECTION */}
          <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
                <img src={BDDCDTIcon} alt="Chart" className="w-4 h-4 object-contain opacity-70" />
              </div>
              <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {isNgayTab ? 'Biểu Đồ Thu/Chi Theo Loại Tiết Kiệm (Hôm Nay)' : 'Biểu Đồ Mở/Đóng Sổ Theo Ngày (Trong Tháng)'}
              </h3>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                Không có dữ liệu giao dịch trong khoảng thời gian này.
              </div>
            ) : (
              <div className="h-[380px] w-full mt-8">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                    <XAxis dataKey="ngay" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10}
                      tickFormatter={(val) => isNgayTab ? `${val}M` : `${val}`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                      contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f9fafb' }}
                      formatter={(val, name) => [
                        isNgayTab ? `${val} Triệu VNĐ` : `${val} sổ`,
                        name === 'thu' ? (isNgayTab ? 'Tiền Thu' : 'Sổ Mở') : (isNgayTab ? 'Tiền Chi' : 'Sổ Đóng')
                      ]}
                    />
                    <Bar dataKey="thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="chi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex justify-center gap-10 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-rose-500 rounded-md shadow-sm"></div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {isNgayTab ? 'Tiền Chi (Rút Ra)' : 'Sổ Đóng (Tất Toán)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 bg-emerald-500 rounded-md shadow-sm"></div>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {isNgayTab ? 'Tiền Thu (Gửi Vào)' : 'Sổ Mở (Mới)'}
                </span>
              </div>
            </div>
          </div>

          {/* DETAIL TABLE */}
          {(isNgayTab ? ngayData : thangData).length > 0 && (
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {isNgayTab ? 'Chi Tiết Doanh Số Theo Loại (BM5.1)' : 'Chi Tiết Sổ Mở/Đóng Theo Ngày (BM5.2)'}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-[#111827]">
                    <tr>
                      {isNgayTab ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại Tiết Kiệm</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng Thu</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tổng Chi</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Chênh Lệch</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Loại Tiết Kiệm</th>
                          <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Sổ Mở</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Sổ Đóng</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Chênh Lệch</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {isNgayTab
                      ? ngayData.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#111827] transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{r.tenLoaiTietKiem}</td>
                            <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatTien(r.tongThu)}</td>
                            <td className="px-6 py-3 text-right text-rose-500 font-semibold">{formatTien(r.tongChi)}</td>
                            <td className={`px-6 py-3 text-right font-bold ${Number(r.chenhLech) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatTien(r.chenhLech)}</td>
                          </tr>
                        ))
                      : thangData.map((r, i) => (
                          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#111827] transition-colors">
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{r.tenLoaiTietKiem}</td>
                            <td className="px-6 py-3 text-center text-gray-500">{r.ngay}</td>
                            <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{r.soSoMo}</td>
                            <td className="px-6 py-3 text-right text-rose-500 font-semibold">{r.soSoDong}</td>
                            <td className={`px-6 py-3 text-right font-bold ${r.chenhLech >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{r.chenhLech}</td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}