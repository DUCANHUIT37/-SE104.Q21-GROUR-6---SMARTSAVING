import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, PiggyBank, CreditCard, Users, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { baoCaoApi, giaoDichApi, soTietKiemApi } from '../../services/api';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899'];
const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' ₫';
const formatNgay = (str) => str ? new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Skeleton Components ────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div className="skeleton h-3.5 w-28 rounded" />
        <div className="skeleton h-8 w-8 rounded-xl" />
      </div>
      <div className="skeleton h-7 w-36 rounded mt-2" />
      <div className="skeleton h-3 w-24 rounded mt-2" />
    </div>
  );
}

function ChartSkeleton({ height = 280 }) {
  return (
    <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm">
      <div className="skeleton h-5 w-40 rounded mb-2" />
      <div className="skeleton h-3 w-56 rounded mb-6" />
      <div className="skeleton rounded-2xl" style={{ height }} />
    </div>
  );
}

// ── Transaction type label ─────────────────────────────────────────────────
const GD_LABEL = {
  mo_so: { label: 'Mở sổ', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', icon: ArrowDownLeft },
  goi_them: { label: 'Gửi thêm', color: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400', icon: ArrowDownLeft },
  rut_tien: { label: 'Rút tiền', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400', icon: ArrowUpRight },
  tat_toan: { label: 'Tất toán', color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400', icon: ArrowUpRight },
};

export default function Dashboard() {
  const { user, isKhachHang } = useAuth();
  const navigate = useNavigate();

  const [tongQuan, setTongQuan] = useState(null);
  const [giaoDich, setGiaoDich] = useState([]);
  const [soTietKiem, setSoTietKiem] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isKhachHang && isKhachHang()) {
          const res = await soTietKiemApi.layTheoKhachHang(user?.id);
          const stks = res.data.data || [];
          setSoTietKiem(stks);
          const tongSoDu = stks.reduce((acc, curr) => acc + parseFloat(curr.soDuHienTai ?? 0), 0);
          setTongQuan({ tongSoDu, tongKhachHang: 1, tongSoTietKiem: stks.length, doanhThuHomNay: 0 });
        } else {
          const [tongQuanRes, gdRes, stkRes] = await Promise.all([
            baoCaoApi.tongQuan(),
            giaoDichApi.layTatCa(),
            soTietKiemApi.layDanhSach()
          ]);
          setTongQuan(tongQuanRes.data.data);
          setGiaoDich(gdRes.data.data || []);
          setSoTietKiem(stkRes.data.data || []);
        }
      } catch (error) {
        console.error('Lỗi lấy tổng quan', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, isKhachHang]);

  const pieData = useMemo(() => {
    const counts = {};
    soTietKiem.forEach(s => {
      const ten = s.loaiTietKiemTen || s.loaiTietKiem?.tenLoai || 'Khác';
      counts[ten] = (counts[ten] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [soTietKiem]);

  const areaData = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({ thang: `T${d.getMonth() + 1}`, monthVal: d.getMonth(), yearVal: d.getFullYear(), tongThu: 0, vonGui: 0 });
    }
    let cumulative = 0;
    months.forEach(m => {
      const gds = giaoDich.filter(g => {
        const gdDate = new Date(g.thoiGian);
        return gdDate.getMonth() === m.monthVal && gdDate.getFullYear() === m.yearVal;
      });
      const thuInMonth = gds.filter(g => g.loaiGiaoDich === 'goi_them' || g.loaiGiaoDich === 'mo_so').reduce((sum, g) => sum + g.soTien, 0);
      m.tongThu = Math.round(thuInMonth / 1000000);
      cumulative += m.tongThu;
      m.vonGui = cumulative > 0 ? cumulative : Math.round((tongQuan?.tongSoDu || 0) / 1000000);
    });
    return months;
  }, [giaoDich, tongQuan]);

  // Recent transactions — last 8
  const recentGD = useMemo(() => [...giaoDich].sort((a, b) => new Date(b.thoiGian) - new Date(a.thoiGian)).slice(0, 8), [giaoDich]);

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 page-enter">
        <div>
          <div className="skeleton h-8 w-56 rounded mb-2" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="lg:col-span-4"><ChartSkeleton height={280} /></div>
          <div className="lg:col-span-3"><ChartSkeleton height={280} /></div>
        </div>
      </div>
    );
  }

  const stats = (isKhachHang && isKhachHang()) ? [
    { label: 'Tổng Tài Sản Hiện Tại', value: formatTien(tongQuan?.tongSoDu), sub: 'Tất cả sổ tiết kiệm của bạn', icon: PiggyBank, color: 'text-emerald-500', bg: 'from-emerald-400 to-emerald-600' },
    { label: 'Tổng Số Sổ Tiết Kiệm', value: `${tongQuan?.tongSoTietKiem || 0} sổ`, sub: 'Đang mở tại hệ thống', icon: CreditCard, color: 'text-sky-500', bg: 'from-sky-400 to-sky-600' },
  ] : [
    { label: 'Tổng Dư Nợ Hiện Tại', value: formatTien(tongQuan?.tongSoDu), sub: 'Toàn bộ số dư tiết kiệm', icon: PiggyBank, color: 'text-emerald-500', bg: 'from-emerald-400 to-emerald-600', trend: true },
    { label: 'Khách Hàng', value: `${tongQuan?.tongKhachHang || 0}`, sub: 'Số lượng khách hàng', icon: Users, color: 'text-violet-500', bg: 'from-violet-400 to-violet-600' },
    { label: 'Tổng Số Sổ', value: `${tongQuan?.tongSoTietKiem || 0}`, sub: 'Đang lưu trong hệ thống', icon: CreditCard, color: 'text-sky-500', bg: 'from-sky-400 to-sky-600' },
    { label: 'Doanh Số Hôm Nay', value: formatTien(tongQuan?.doanhThuHomNay), sub: 'Tổng thu từ gửi tiền & mở sổ', icon: TrendingUp, color: 'text-amber-500', bg: 'from-amber-400 to-amber-600' },
  ];

  return (
    <div className="space-y-8 page-enter">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Tổng Quan Tài Sản</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Dữ liệu cập nhật theo thời gian thực từ hệ thống.</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            Xin chào, {user?.hoTen}
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default overflow-hidden relative"
          >
            {/* Subtle gradient glow on hover */}
            <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br', stat.bg)} />
            <div className="flex items-center justify-between pb-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide leading-tight">{stat.label}</p>
              <div className={cn('p-2.5 rounded-xl bg-gradient-to-br shadow-sm', stat.bg)}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="mt-1">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className={cn('text-xs mt-1.5 flex items-center gap-1', stat.trend ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500')}>
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Tăng trưởng tài sản 6 tháng</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Đơn vị: triệu VNĐ</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.12)" vertical={false} />
              <XAxis dataKey="thang" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
                formatter={(val, name) => [`${val} triệu`, name === 'vonGui' ? 'Vốn gửi' : 'Tổng thu']}
              />
              <Area type="monotone" dataKey="vonGui" stroke="#10b981" strokeWidth={2.5} fill="url(#colorVon)" dot={false} />
              <Area type="monotone" dataKey="tongThu" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorThu)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-3 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Phân bổ loại tiết kiệm</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Theo loại kỳ hạn</p>
          </div>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56 gap-3">
              <PiggyBank className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">Chưa có sổ tiết kiệm</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f9fafb', fontSize: 12 }}
                  formatter={(val) => [`${val} sổ`]}
                />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs text-gray-400">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* RECENT TRANSACTIONS (admin/teller only) */}
      {!isKhachHang?.() && recentGD.length > 0 && (
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1f2937] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Giao Dịch Gần Đây</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">{recentGD.length} giao dịch mới nhất</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-50 dark:border-gray-800/60">
                  {['Mã GD', 'Mã Sổ', 'Loại', 'Số Tiền', 'Thời Gian'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                {recentGD.map(gd => {
                  const meta = GD_LABEL[gd.loaiGiaoDich] || { label: gd.loaiGiaoDich, color: 'bg-gray-100 text-gray-600', icon: ArrowUpRight };
                  const Icon = meta.icon;
                  const isIncome = gd.loaiGiaoDich === 'mo_so' || gd.loaiGiaoDich === 'goi_them';
                  return (
                    <tr key={gd.id || gd.maGiaoDich} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{(gd.maGiaoDich || '—').slice(0, 12)}…</td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">#{(gd.soTietKiemMaSo || '—').slice(-6)}</td>
                      <td className="px-5 py-3">
                        <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold', meta.color)}>
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </td>
                      <td className={cn('px-5 py-3 font-bold text-sm', isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500')}>
                        {isIncome ? '+' : '-'}{new Intl.NumberFormat('vi-VN').format(Math.abs(gd.soTien || 0))} ₫
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-400">{formatNgay(gd.thoiGian)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
