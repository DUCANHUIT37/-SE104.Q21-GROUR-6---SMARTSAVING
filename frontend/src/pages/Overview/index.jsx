import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, PiggyBank, CreditCard, AlertCircle, Users, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { baoCaoApi, giaoDichApi, soTietKiemApi } from '../../services/api';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' ₫';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tongQuan, setTongQuan] = useState(null);
  const [giaoDich, setGiaoDich] = useState([]);
  const [soTietKiem, setSoTietKiem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tongQuanRes, gdRes, stkRes] = await Promise.all([
          baoCaoApi.tongQuan(),
          giaoDichApi.layTatCa(),
          soTietKiemApi.layDanhSach()
        ]);
        setTongQuan(tongQuanRes.data.data);
        setGiaoDich(gdRes.data.data || []);
        setSoTietKiem(stkRes.data.data || []);
      } catch (error) {
        console.error('Lỗi lấy tổng quan', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pieData = useMemo(() => {
    const counts = {};
    soTietKiem.forEach(s => {
      const ten = s.loaiTietKiem?.tenLoai || 'Khác';
      counts[ten] = (counts[ten] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [soTietKiem]);

  const areaData = useMemo(() => {
    // Lấy 6 tháng gần nhất
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        thang: `T${d.getMonth() + 1}`,
        monthVal: d.getMonth(),
        yearVal: d.getFullYear(),
        tongThu: 0,
        vonGui: 0 // We'll just approximate vonGui with cumulative tongThu for visualization
      });
    }

    let cumulative = 0;
    months.forEach(m => {
      const gds = giaoDich.filter(g => {
        const gdDate = new Date(g.thoiGian);
        return gdDate.getMonth() === m.monthVal && gdDate.getFullYear() === m.yearVal;
      });
      
      const thuInMonth = gds
        .filter(g => g.loaiGiaoDich === 'gui_them' || g.loaiGiaoDich === 'mo_so')
        .reduce((sum, g) => sum + g.soTien, 0);
        
      m.tongThu = Math.round(thuInMonth / 1000000); // triệu VND
      cumulative += m.tongThu;
      m.vonGui = cumulative > 0 ? cumulative : Math.round((tongQuan?.tongSoDu || 0) / 1000000); 
    });

    return months;
  }, [giaoDich, tongQuan]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Tổng Dư Nợ Hiện Tại',
      value: formatTien(tongQuan?.tongSoDu),
      sub: `Toàn bộ số dư tiết kiệm hệ thống`,
      icon: PiggyBank, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
      trend: '+2.5% so với tháng trước',
    },
    {
      label: 'Khách Hàng',
      value: `${tongQuan?.tongKhachHang} khách hàng`,
      sub: `Số lượng khách hàng tham gia`,
      icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10',
    },
    {
      label: 'Tổng Số Sổ',
      value: `${tongQuan?.tongSoTietKiem} sổ`,
      sub: 'Đang lưu trữ trên hệ thống',
      icon: CreditCard, color: 'text-sky-500', bg: 'bg-sky-500/10',
    },
    {
      label: 'Doanh Số Hôm Nay',
      value: formatTien(tongQuan?.doanhThuHomNay),
      sub: 'Tổng thu từ gửi tiền và mở sổ',
      icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Tổng Quan Tài Sản</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Dữ liệu được cập nhật theo thời gian thực từ hệ thống.</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            Xin chào {user?.hoTen} · {user?.quyenHan}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between pb-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-tight">{stat.label}</p>
              <div className={cn('p-2 rounded-xl', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </div>
            <div className="mt-1">
              <div className={cn('text-2xl font-bold', stat.isAlert ? 'text-red-500' : 'text-gray-900 dark:text-white')}>
                {stat.value}
              </div>
              <p className={cn('text-xs mt-1.5 flex items-center gap-1', stat.isAlert ? 'text-red-400' : 'text-emerald-500')}>
                {stat.trend && <ArrowUpRight className="h-3 w-3" />}
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Area Chart */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tăng trưởng tài sản 6 tháng qua</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Thống kê 6 tháng gần nhất (đơn vị: triệu VNĐ)</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="thang" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f9fafb' }}
                formatter={(val, name) => [`${val} triệu`, name === 'vonGui' ? 'Vốn gửi' : 'Tổng thu']}
              />
              <Area type="monotone" dataKey="vonGui" stroke="#10b981" strokeWidth={2} fill="url(#colorVon)" />
              <Area type="monotone" dataKey="tongThu" stroke="#3b82f6" strokeWidth={2} fill="url(#colorThu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Phân bổ loại tiết kiệm</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phân bổ theo loại kỳ hạn</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f9fafb' }}
                formatter={(val) => [`${val} sổ`, '']}
              />
              <Legend iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-gray-400">{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
