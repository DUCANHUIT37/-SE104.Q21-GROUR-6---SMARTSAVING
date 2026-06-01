import { X, FileText } from 'lucide-react';

export default function Bm1Modal({ isOpen, onClose, passbook }) {
  if (!isOpen || !passbook) return null;

  const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val ?? 0);
  const formatNgay = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl relative overflow-hidden text-gray-900 dark:text-white animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-6 bg-emerald-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h3 className="font-bold text-xl">Sổ Tiết Kiệm (BM1)</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition bg-black/10 hover:bg-black/20 p-2 rounded-full"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Modern Grid */}
        <div className="p-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden text-sm">
            
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Mã số</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{passbook.maSo}</span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Loại tiết kiệm</span>
                <span className="font-bold text-gray-900 dark:text-white">{passbook.loaiTietKiemTen}</span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Khách hàng</span>
                <span className="font-bold text-gray-900 dark:text-white">{passbook.khachHangTen}</span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">CMND / CCCD</span>
                <span className="font-bold text-gray-900 dark:text-white">{passbook.khachHangCmnd}</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-1">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Địa chỉ</span>
              <span className="font-bold text-gray-900 dark:text-white">{passbook.khachHangDiaChi || '—'}</span>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Ngày mở sổ</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatNgay(passbook.ngayMo)}</span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-gray-500 dark:text-gray-400 font-medium">Số tiền gửi ban đầu</span>
                <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">{formatTien(passbook.soTienBanDau)} <span className="text-sm font-semibold">VNĐ</span></span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
