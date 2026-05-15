import { useState, useMemo, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, PlusCircle, Download, PiggyBank,
  X, ArrowDownLeft, ArrowUpRight, Loader2, AlertTriangle,
  ChevronUp, ChevronDown, ArrowUpDown, RefreshCw, WifiOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { soTietKiemApi } from '../../services/api';
import { thamSoData, generateMaGiaoDich, tinhTienLai, soNgayGiua, lichSuGiaoDichData, loaiTietKiemData } from '../../data/fakeDb';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val ?? 0) + ' ₫';
const formatNgay = (str) => str ? new Date(str).toLocaleDateString('vi-VN') : '—';

// Mapper: DTO từ Backend → format mà UI cần
const mapDtoToUi = (dto) => ({
  id: dto.id,
  maSo: dto.maSo,
  soDuHienTai: parseFloat(dto.soDuHienTai ?? 0),
  soTienBanDau: parseFloat(dto.soTienBanDau ?? 0),
  laiSuatMoSo: parseFloat(dto.laiSuatMoSo ?? 0) * 100, // Backend lưu 0.07 → hiển thị 7
  ngayMo: dto.ngayMo,
  ngayDaoHan: dto.ngayDaoHan,
  trangThai: dto.trangThai,
  // Flattened relations từ Backend DTO
  khachHang: dto.khachHangId ? {
    id: dto.khachHangId,
    hoTen: dto.khachHangTen,
    cmnd: dto.khachHangCmnd,
  } : null,
  loaiTietKiem: dto.loaiTietKiemId ? {
    id: dto.loaiTietKiemId,
    tenLoai: dto.loaiTietKiemTen,
    kyHanThang: dto.kyHanThang ?? 0,
  } : null,
});

export default function Passbooks() {
  const { isTeller } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('ALL');

  // ─── API State ───────────────────────────────────────────────────────────────
  const [danhSach, setDanhSach] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Sorting State ───────────────────────────────────────────────────────────
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Action Modal State
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, so: null });
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  // ─── Fetch dữ liệu từ Backend ─────────────────────────────────────────────────
  const fetchDanhSach = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await soTietKiemApi.layDanhSach();
      const apiData = response.data?.data ?? [];
      setDanhSach(apiData.map(mapDtoToUi));
    } catch (err) {
      console.error('Lỗi tải danh sách sổ:', err);
      setError(
        err.response?.data?.message ??
        'Không thể kết nối đến Backend. Vui lòng kiểm tra server và thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDanhSach();
  }, [fetchDanhSach]);

  const filtered = useMemo(() => {
    return danhSach.filter(so => {
      const q = search.toLowerCase();
      const matchSearch =
        (so.maSo ?? '').toLowerCase().includes(q) ||
        (so.khachHang?.hoTen ?? '').toLowerCase().includes(q) ||
        (so.khachHang?.cmnd ?? '').includes(q);
      
      let matchStatus = true;
      if (trangThaiFilter === 'DANG_HOAT_DONG') matchStatus = so.trangThai === 'dang_hoat_dong';
      if (trangThaiFilter === 'DA_TAT_TOAN') matchStatus = so.trangThai === 'da_tat_toan';
      
      return matchSearch && matchStatus;
    });
  }, [danhSach, search, trangThaiFilter]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
        key = null;
      }
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...filtered];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'maSo':
            aValue = a.maSo;
            bValue = b.maSo;
            break;
          case 'khachHang':
            aValue = a.khachHang?.hoTen || '';
            bValue = b.khachHang?.hoTen || '';
            break;
          case 'soDu':
            aValue = a.soDuHienTai;
            bValue = b.soDuHienTai;
            break;
          case 'ngayDaoHan':
            aValue = a.ngayDaoHan ? new Date(a.ngayDaoHan).getTime() : 0;
            bValue = b.ngayDaoHan ? new Date(b.ngayDaoHan).getTime() : 0;
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filtered, sortConfig]);

  const renderSortableHeader = (label, key) => {
    const isSorted = sortConfig.key === key;
    return (
      <th 
        className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none group"
        onClick={() => handleSort(key)}
      >
        <div className="flex items-center gap-1">
          {label}
          <div className="flex flex-col text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">
            {isSorted ? (
              sortConfig.direction === 'asc' ? (
                <ChevronUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-emerald-500" />
              )
            ) : (
              <ArrowUpDown className="w-3 h-3 opacity-50" />
            )}
          </div>
        </div>
      </th>
    );
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = ["Mã Sổ", "Tên Khách Hàng", "CMND/CCCD", "Tiền Gốc", "Loại Kỳ Hạn", "Lãi Suất (%)", "Ngày Đáo Hạn", "Trạng Thái"];
    const csvRows = filtered.map(s => [
      s.maSo,
      s.khachHang?.hoTen || "",
      s.khachHang?.cmnd || "",
      s.soDuHienTai,
      s.loaiTietKiem?.tenLoai || "",
      s.laiSuatMoSo || 0,
      s.ngayDaoHan ? new Date(s.ngayDaoHan).toLocaleDateString("vi-VN") : "",
      s.trangThai === "dang_hoat_dong" ? "Đang hoạt động" : "Đã tất toán"
    ].map(v => `"${v}"`).join(","));

    const csvData = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `BaoCao_SoTietKiem_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openActionModal = (so, type) => {
    setActionModal({ isOpen: true, type, so });
    setAmount(type === 'WITHDRAWAL' && so.loaiTietKiem?.kyHanThang > 0 ? so.soDuHienTai.toString() : '');
    setActionError('');
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, so: null });
    setAmount('');
  };

  const handleTransaction = (e) => {
    e.preventDefault();
    const { so, type } = actionModal;
    if (!so || !type) return;
    
    setIsSubmitting(true);
    setActionError('');

    // Giả lập xử lý backend
    setTimeout(() => {
      const val = Number(amount);
      const now = new Date().toISOString().split('T')[0];

      if (type === 'DEPOSIT') {
        if (val < thamSoData.soTienGuiThemToiThieu) {
          setActionError(`Số tiền gởi thêm tối thiểu là ${formatTien(thamSoData.soTienGuiThemToiThieu)}`);
          setIsSubmitting(false);
          return;
        }
        
        const soDuTruoc = so.soDuHienTai;
        so.soDuHienTai += val;
        lichSuGiaoDichData.push({
          id: lichSuGiaoDichData.length + 1,
          maGiaoDich: generateMaGiaoDich(),
          soTietKiemId: so.id,
          loaiGiaoDich: 'goi_them',
          soTien: val,
          soDuTruoc,
          soDuSau: so.soDuHienTai,
          thoiGian: new Date().toISOString(),
          ghiChu: 'Gởi thêm tiền vào sổ'
        });
        toast.success('Gởi thêm tiền thành công!');
      } else {
        // Rút tiền / Tất toán
        const ngayMo = so.ngayMo;
        const soNgayThucTe = soNgayGiua(ngayMo, now);
        
        if (soNgayThucTe < thamSoData.soNgayGuiToiThieu) {
          setActionError(`Chưa đủ thời gian gởi tối thiểu (${thamSoData.soNgayGuiToiThieu} ngày).`);
          setIsSubmitting(false);
          return;
        }

        let laiSuatApDung = so.laiSuatMoSo;
        let ghiChu = 'Rút tiền đúng hạn';

        if (so.loaiTietKiem?.kyHanThang > 0) {
          if (so.ngayDaoHan && now < so.ngayDaoHan) {
            laiSuatApDung = loaiTietKiemData.find(lt => lt.kyHanThang === 0).laiSuatNam;
            ghiChu = 'Tất toán trước hạn (Phạt lãi KKH)';
          } else {
            ghiChu = 'Tất toán đúng hạn';
          }
        }

        const tienLai = tinhTienLai(so.soDuHienTai, laiSuatApDung, soNgayThucTe);
        const tongNhan = so.soDuHienTai + tienLai;

        lichSuGiaoDichData.push({
          id: lichSuGiaoDichData.length + 1,
          maGiaoDich: generateMaGiaoDich(),
          soTietKiemId: so.id,
          loaiGiaoDich: 'tat_toan',
          soTien: -tongNhan,
          soDuTruoc: so.soDuHienTai,
          soDuSau: 0,
          thoiGian: new Date().toISOString(),
          ghiChu: `${ghiChu}. Lãi: ${formatTien(tienLai)}`
        });

        so.soDuHienTai = 0;
        so.trangThai = 'da_tat_toan';
        toast.success(`Tất toán thành công! Tổng nhận: ${formatTien(tongNhan)}`);
      }

      setIsSubmitting(false);
      closeActionModal();
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Đang tải danh sách sổ tiết kiệm...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <WifiOff className="w-12 h-12 text-red-400" />
          <p className="font-semibold text-gray-900 dark:text-white">Lỗi kết nối Backend</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">{error}</p>
          <button
            onClick={fetchDanhSach}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
            <PiggyBank className="w-8 h-8 mr-3 text-emerald-500" />
            Danh Sách Sổ Tiết Kiệm
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Dữ liệu sổ tiết kiệm đồng bộ trực tiếp từ hệ thống của bạn.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center px-4 py-2 border border-emerald-200 text-emerald-700 bg-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-50 rounded-xl font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Xuất Danh Sách
          </button>
          <button
            onClick={fetchDanhSach}
            title="Tải lại dữ liệu"
            className="inline-flex items-center justify-center p-2 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {isTeller() && (
            <Link 
              to="/mo-so"
              className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Mở Sổ Mới
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1f2937] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã sổ, tên KH hoặc CMND..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>
        <select
          className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
          value={trangThaiFilter}
          onChange={(e) => setTrangThaiFilter(e.target.value)}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DANG_HOAT_DONG">Đang hoạt động</option>
          <option value="DA_TAT_TOAN">Đã tất toán (Đóng)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">STT</th>
                {renderSortableHeader('Mã Sổ', 'maSo')}
                {renderSortableHeader('Khách Hàng (CMND)', 'khachHang')}
                {renderSortableHeader('Số Dư Hiện Tại', 'soDu')}
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Loại Sổ</th>
                {renderSortableHeader('Ngày Đáo Hạn', 'ngayDaoHan')}
                <th className="text-left px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Trạng Thái</th>
                <th className="text-right px-4 py-4 font-semibold text-gray-900 dark:text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {sortedData.length > 0 ? (
                sortedData.map((s, index) => {
                  const isActive = s.trangThai === 'dang_hoat_dong';
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-emerald-500 whitespace-nowrap">
                        #{s.maSo.slice(-6)}
                      </td>
                      <td className="px-4 py-4 font-medium">
                        <div className="text-gray-900 dark:text-white">{s.khachHang?.hoTen}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">{s.khachHang?.cmnd}</div>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-900 dark:text-white">
                        {formatTien(s.soDuHienTai)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 dark:text-gray-200">{s.loaiTietKiem?.tenLoai}</span>
                          <span className="text-xs text-emerald-500 font-medium">{s.laiSuatMoSo}% / năm</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                        {s.ngayDaoHan ? formatNgay(s.ngayDaoHan) : "---"}
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                          isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400'
                        )}>
                          {isActive ? 'Đang hoạt động' : 'Đã tất toán'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isActive && isTeller() && (
                          <div className="flex justify-end gap-2">
                            {s.loaiTietKiem?.kyHanThang === 0 && (
                              <button
                                onClick={() => openActionModal(s, "DEPOSIT")}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition-colors"
                              >
                                <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Gửi thêm
                              </button>
                            )}
                            <button
                              onClick={() => openActionModal(s, "WITHDRAWAL")}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 rounded-lg hover:bg-orange-100 transition-colors"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Rút / Tất toán
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    Chưa có sổ tiết kiệm nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> / <span className="font-semibold text-gray-900 dark:text-white">{danhSach.length}</span> sổ
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50">
              Trang trước
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-xs font-medium rounded-lg transition-all",
                    page === 1 
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                      : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                  )}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* ACTION MODAL OVERLAY */}
      {actionModal.isOpen && actionModal.so && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={cn(
              "p-6 text-white flex justify-between items-center",
              actionModal.type === 'DEPOSIT' ? 'bg-emerald-600' : 'bg-orange-600'
            )}>
              <div className="flex items-center gap-3">
                {actionModal.type === 'DEPOSIT' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                <h3 className="font-bold text-xl">
                  {actionModal.type === 'DEPOSIT' ? 'Gửi Thêm Tiền' : 'Rút Tiền / Tất Toán'}
                </h3>
              </div>
              <button onClick={closeActionModal} className="text-white/80 hover:text-white transition bg-black/10 hover:bg-black/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-6 border border-gray-100 dark:border-gray-800 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mã Số:</span>
                  <span className="font-bold text-gray-900 dark:text-white">#{actionModal.so.maSo.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Khách Hàng:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{actionModal.so.khachHang?.hoTen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Số Dư Hiện Tại:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatTien(actionModal.so.soDuHienTai)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Loại Kỳ Hạn:</span>
                  <span className="font-semibold text-sky-600 dark:text-sky-400">{actionModal.so.loaiTietKiem?.tenLoai}</span>
                </div>
              </div>

              {actionModal.type === "WITHDRAWAL" && actionModal.so.loaiTietKiem?.kyHanThang > 0 && (
                <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                    <b>Quy định:</b> Sổ có kỳ hạn yêu cầu rút toàn bộ gốc. Nếu rút trước hạn (đáo hạn: {formatNgay(actionModal.so.ngayDaoHan)}), lãi suất sẽ tự động bị phạt về mức Không Kỳ Hạn (0.5%).
                  </p>
                </div>
              )}

              {actionError && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-4 rounded-2xl border border-red-200 dark:border-red-800 text-center font-bold">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleTransaction} className="flex flex-col gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Nhập Số Tiền (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="VD: 1000000"
                      value={amount ? Number(amount).toLocaleString('vi-VN') : ''}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                      readOnly={actionModal.type === "WITHDRAWAL" && actionModal.so.loaiTietKiem?.kyHanThang > 0}
                      className="w-full px-5 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none text-xl font-bold text-gray-900 dark:text-white disabled:opacity-70 transition-all"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">VNĐ</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={closeActionModal}
                    className="flex-1 px-6 py-4 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "flex-[1.5] px-6 py-4 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2",
                      actionModal.type === 'DEPOSIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'
                    )}
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Xác nhận xử lý"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
