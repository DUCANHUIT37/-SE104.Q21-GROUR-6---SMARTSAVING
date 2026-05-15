import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import BCPTIcon from '../../assets/BaoCaoKeToan_BaoCaoPhanTich.svg';
import TVGVIcon from '../../assets/BaoCaoKeToan_TongVonGuiVao.svg';
import TCGNIcon from '../../assets/BaoCaoKeToan_TongChiGiaiNgan.svg';
import CLTIcon from '../../assets/BaoCaoKeToan_ChenhLechThuc.svg';
import BDDCDTIcon from '../../assets/BaoCaoKeToan_BieuDoDoiChieuDongTien.svg';
import { lichSuGiaoDichData } from '../../data/fakeDb';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';

export default function FinancialReport() {
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Tính toán dữ liệu thật từ fakeDb
  const stats = useMemo(() => {
    let data = lichSuGiaoDichData;
    // Tạm thời bỏ qua filter thời gian phức tạp để focus vào UI, hoặc filter nhẹ
    
    const tongThu = data.filter(g => g.soTien > 0).reduce((a, b) => a + b.soTien, 0);
    const tongChi = data.filter(g => g.soTien < 0).reduce((a, b) => a + Math.abs(b.soTien), 0);
    const chenhLech = tongThu - tongChi;

    return {
      tongThu,
      tongChi,
      chenhLech,
      soGiaoDich: data.length
    };
  }, [activeTab]);

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
    const ws = XLSX.utils.json_to_sheet(lichSuGiaoDichData.map(d => ({
      'Mã GD': d.id,
      'Số Tiền': d.soTien,
      'Loại': d.soTien > 0 ? 'Thu' : 'Chi',
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
        <div className="h-[380px] w-full relative flex items-end pl-14 pr-4 pb-10">
          
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-14 pr-4 pb-10 pt-2">
            {[60, 45, 30, 15, 0].map((val) => (
              <div key={val} className="relative flex items-center w-full">
                <span className="absolute -left-14 text-xs font-bold text-gray-400 dark:text-gray-500 w-10 text-right">
                  {val}M
                </span>
                <div className={`flex-1 border-t border-dashed ${val === 0 ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-800/80'}`}></div>
              </div>
            ))}
          </div>

          {/* Vùng vẽ cột */}
          <div className="flex-1 flex justify-center items-end gap-1 h-full z-10">
             {[...Array(8)].map((_, i) => <div key={i} className="flex-1 h-full"></div>)}
             
             <div className="flex items-end gap-1.5 px-3 h-full group cursor-pointer relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-xl scale-95 group-hover:scale-100 pointer-events-none">
                  Thu: 21M | Chi: 45M
                </div>
                <div className="w-6 bg-emerald-500 rounded-t-md h-[35%] shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group-hover:bg-emerald-400"></div>
                <div className="w-6 bg-rose-500 rounded-t-md h-[75%] shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all group-hover:bg-rose-400"></div>
             </div>

             {[...Array(10)].map((_, i) => <div key={i} className="flex-1 h-full"></div>)}
          </div>

          <div className="absolute bottom-0 left-14 right-4 flex justify-between text-xs font-bold text-gray-400 dark:text-gray-600">
            {["01/03", "02/03", "03/03", "04/03", "05/03", "06/03", "07/03", "08/03", "09/03", "10/03", "11/03", "12/03", "13/03", "14/03", "15/03", "16/03", "17/03", "18/03", "19/03"].map(d => (
              <span key={d} className={d === "09/03" ? "text-emerald-600 dark:text-emerald-400" : ""}>{d}</span>
            ))}
          </div>
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