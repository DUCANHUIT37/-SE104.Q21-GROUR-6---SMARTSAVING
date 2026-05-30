import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Loader2 } from 'lucide-react';
import BCPTIcon from '../../assets/BaoCaoKeToan_BaoCaoPhanTich.svg';
import TVGVIcon from '../../assets/BaoCaoKeToan_TongVonGuiVao.svg';
import TCGNIcon from '../../assets/BaoCaoKeToan_TongChiGiaiNgan.svg';
import CLTIcon from '../../assets/BaoCaoKeToan_ChenhLechThuc.svg';
import BDDCDTIcon from '../../assets/BaoCaoKeToan_BieuDoDoiChieuDongTien.svg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { giaoDichApi } from '../../services/api';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

export default function FinancialReport() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [giaoDichData, setGiaoDichData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGiaoDich = async () => {
      try {
        const res = await giaoDichApi.layTatCa();
        setGiaoDichData(res.data.data || []);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu giao dịch', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGiaoDich();
  }, []);

  // WARN-05 FIX: Implement real date-range filtering for each tab
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let data = giaoDichData;
    if (activeTab === 'Hôm nay') {
      data = giaoDichData.filter(g => g.thoiGian && g.thoiGian.startsWith(todayStr));
    } else if (activeTab === 'Tuần này') {
      data = giaoDichData.filter(g => g.thoiGian && new Date(g.thoiGian) >= startOfWeek);
    } else if (activeTab === 'Tháng này') {
      data = giaoDichData.filter(g => g.thoiGian && g.thoiGian.startsWith(monthStr));
    }
    // 'Tất cả' = no filter

    const tongThu = data.filter(g => g.loaiGiaoDich === 'gui_them' || g.loaiGiaoDich === 'mo_so')
                        .reduce((a, b) => a + b.soTien, 0);
    const tongChi = data.filter(g => g.loaiGiaoDich === 'rut_tien' || g.loaiGiaoDich === 'tat_toan')
                        .reduce((a, b) => a + Math.abs(b.soTien), 0);
    const chenhLech = tongThu - tongChi;
    return { tongThu, tongChi, chenhLech, soGiaoDich: data.length };
  }, [activeTab, giaoDichData]);

  const chartData = useMemo(() => {
    // Lấy 15 ngày gần nhất
    const days = [];
    const today = new Date();
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      days.push({
        ngay: dateStr,
        fullDate: d.toISOString().split('T')[0],
        thu: 0,
        chi: 0
      });
    }

    days.forEach(d => {
      const gds = giaoDichData.filter(g => g.thoiGian && g.thoiGian.startsWith(d.fullDate));
      
      const thuInDay = gds
        .filter(g => g.loaiGiaoDich === 'gui_them' || g.loaiGiaoDich === 'mo_so')
        .reduce((sum, g) => sum + g.soTien, 0);
        
      const chiInDay = gds
        .filter(g => g.loaiGiaoDich === 'rut_tien' || g.loaiGiaoDich === 'tat_toan')
        .reduce((sum, g) => sum + Math.abs(g.soTien), 0);
        
      d.thu = Math.round(thuInDay / 1000000); // Triệu VNĐ
      d.chi = Math.round(chiInDay / 1000000);
    });

    return days;
  }, [giaoDichData]);

  const cashflowStats = [
    {
      title: "Tổng Vốn Gửi Vào",
      value: formatTien(stats.tongThu),
      status: "Dòng tiền Dương (+)",
      statusColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      icon: TVGVIcon,
    },
    {
      title: "Tổng Chi Giải Ngân",
      value: formatTien(stats.tongChi),
      status: "Dòng tiền Âm (-)",
      statusColor: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
      icon: TCGNIcon,
    },
    {
      title: "Chênh Lệch Thực (Ròng)",
      value: formatTien(stats.chenhLech),
      valueColor: stats.chenhLech >= 0 ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500",
      status: (
        <span>
          Ghi nhận <span className="font-bold text-gray-900 dark:text-white">{stats.soGiaoDich}</span> giao dịch.
        </span>
      ), 
      statusColor: "text-gray-500 dark:text-gray-400",
      icon: CLTIcon,
    }
  ];

  const tabs = ['Hôm nay', 'Tuần này', 'Tháng này', 'Tất cả'];

  const handleExportExcel = () => {
    // Xuất Excel đơn giản danh sách giao dịch
    const ws = XLSX.utils.json_to_sheet(giaoDichData.map(d => ({
      'Mã GD': d.maGiaoDich,
      'Số Tiền': d.soTien,
      'Loại': (d.loaiGiaoDich === 'gui_them' || d.loaiGiaoDich === 'mo_so') ? 'Thu' : 'Chi',
      'Thời gian': d.thoiGian
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Cashflow`);
    XLSX.writeFile(wb, `BaoCaoDongTien.xlsx`);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEADER SECTION & CONTROLS */}
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
          <p className="text-gray-500 dark:text-gray-400 text-sm">Theo dõi Cashflow (Dòng tiền thuần) nội bộ hệ thống ngân hàng.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-1"> 
          {/* Time Filter Tabs  */}
          <div className="bg-gray-100 dark:bg-[#1f2937] p-1.5 rounded-xl flex border border-gray-200 dark:border-gray-800 font-semibold text-xs shadow-sm">
            {tabs.map((tab) => (
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
          
          {/* Export Button*/}
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 border border-emerald-600/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Tải Tệp Excel
          </button>
        </div>
      </div>

      {/* 2. CASHFLOW STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cashflowStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-[#1f2937] p-7 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                {stat.title}
              </span>
        
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <img 
                  src={stat.icon} 
                  alt={stat.title} 
                  className="w-6 h-6 object-contain opacity-80 dark:opacity-90" 
                />
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

      {/* 3. BAR CHART SECTION (Static Mockup logic for now, just CSS updated) */}
      <div className="bg-white dark:bg-[#1f2937] p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
              <img src={BDDCDTIcon} alt="Title" className="w-4 h-4 object-contain opacity-70" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Biểu Đồ Đối Chiếu Dòng Tiền (Theo Ngày)</h3>
        </div>

        {/* Vùng chứa biểu đồ  */}
        <div className="h-[380px] w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
              <XAxis dataKey="ngay" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${val}M`} />
              <Tooltip 
                cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f9fafb' }}
                formatter={(val, name) => [`${val} Triệu VNĐ`, name === 'thu' ? 'Tiền Thu' : 'Tiền Chi']}
              />
              <Bar dataKey="thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="chi" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-10 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-rose-500 rounded-md shadow-sm"></div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tiền Chi (Rút Ra)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-md shadow-sm"></div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Tiền Thu (Gửi Vào)</span>
          </div>
        </div>
      </div>
    </div>
  );
}