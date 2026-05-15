import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, PiggyBank, CreditCard, AlertCircle, Users, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { soTietKiemData, loaiTietKiemData, lichSuGiaoDichData, khachHangData } from '../../data/fakeDb';

const areaData = [
  { thang: 'T1', vonGui: 380, tongThu: 45 },
  { thang: 'T2', vonGui: 450, tongThu: 60 },
  { thang: 'T3', vonGui: 420, tongThu: 55 },
  { thang: 'T4', vonGui: 520, tongThu: 80 },
  { thang: 'T5', vonGui: 490, tongThu: 72 },
  { thang: 'T6', vonGui: 620, tongThu: 95 },
];

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' ₫';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const soHoatDong = soTietKiemData.filter(s => s.trangThai === 'dang_hoat_dong');
  const tongVon = soHoatDong.reduce((acc, s) => acc + s.soDuHienTai, 0);
  const today = new Date();
  const soSapDaoHan = soHoatDong.filter(s => {
    if (!s.ngayDaoHan) return false;
    const days = Math.floor((new Date(s.ngayDaoHan) - today) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  }).length;

  const pieData = loaiTietKiemData.map(lt => ({
    name: lt.tenLoai,
    value: soHoatDong.filter(s => s.loaiTietKiemId === lt.id).length,
  })).filter(d => d.value > 0);

  const stats = [
    {
      label: 'Tổng Vốn Gửi Hiện Tại',
      value: formatTien(tongVon),
      sub: `Từ ${soHoatDong.length} sổ đang hoạt động`,
      icon: PiggyBank, color: 'text-emerald-500', bg: 'bg-emerald-500/10',
      trend: '+12.5% so với tháng trước',
    },
    {
      label: 'Trạng thái sinh lời',
      value: `${soHoatDong.length} sổ`,
      sub: `Đang hoạt động trong hệ thống`,
      icon: CreditCard, color: 'text-sky-500', bg: 'bg-sky-500/10',
    },
    {
      label: 'Tổng số sổ của khách hàng',
      value: `${soTietKiemData.length} sổ`,
      sub: 'Tổng số sổ được phát hành',
      icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10',
    },
    {
      label: 'Sổ Sắp Đến Hạn (7 ngày)',
      value: `${soSapDaoHan} sổ`,
      sub: 'Cần chuẩn bị thanh toán tất toán',
      icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10',
      isAlert: true,
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
