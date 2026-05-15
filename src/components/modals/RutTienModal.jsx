import { useState, useMemo } from 'react';
import { TrendingDown, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { loaiTietKiemData, thamSoData, soTietKiemData, lichSuGiaoDichData, generateMaGiaoDich, tinhTienLai, soNgayGiua } from '../../data/fakeDb';
import { Overlay, ModalHeader, InfoRow, ModalActions } from './GoiTienModal';

const formatTien = (val) => new Intl.NumberFormat('vi-VN').format(val) + ' ₫';

export default function RutTienModal({ so, onClose, onSuccess }) {
  const loai = loaiTietKiemData.find(lt => lt.id === so.loaiTietKiemId);
  const [soTienRut, setSoTienRut] = useState(so.soDuHienTai);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const ngayMo = so.ngayMo;
  const soNgayDaGui = soNgayGiua(ngayMo, today);

  // Kiểm tra điều kiện
  const kiemTra = useMemo(() => {
    const isKKH = loai?.kyHanThang === 0;
    if (isKKH) {
      if (soNgayDaGui < thamSoData.soNgayGuiToiThieu)
        return { ok: false, msg: `Sổ không kỳ hạn phải gởi trên ${thamSoData.soNgayGuiToiThieu} ngày mới được rút. Hiện tại: ${soNgayDaGui} ngày.` };
      if (Number(soTienRut) > so.soDuHienTai)
        return { ok: false, msg: 'Số tiền rút không được vượt quá số dư hiện có.' };
    } else {
      const daoHan = so.ngayDaoHan ? new Date(so.ngayDaoHan) : null;
      const isQuaHan = daoHan && new Date(today) > daoHan;
      if (!isQuaHan) {
        const ngayConLai = daoHan ? Math.ceil((daoHan - new Date(today)) / (1000 * 60 * 60 * 24)) : 0;
        return { ok: false, msg: `Sổ kỳ hạn chưa đến ngày đáo hạn. Còn ${ngayConLai} ngày. Nếu rút trước hạn, lãi suất sẽ tính theo lãi suất KKH (0.5%).`, warn: true };
      }
    }
    return { ok: true, msg: '' };
  }, [loai, soNgayDaGui, soTienRut, so, today]);

  // Tính lãi dự tính
  const tinhKetQua = useMemo(() => {
    const isKKH = loai?.kyHanThang === 0;
    const isQuaHan = so.ngayDaoHan ? new Date(today) > new Date(so.ngayDaoHan) : true;
    const laiSuatApDung = (!isKKH && !isQuaHan) ? 0.5 : (loai?.laiSuatNam || 0.5);
    const tienLai = tinhTienLai(so.soDuHienTai, laiSuatApDung, soNgayDaGui);
    const tatToan = isKKH ? (Number(soTienRut) >= so.soDuHienTai) : true;
    return { laiSuatApDung, tienLai, tatToan, tongNhan: Number(soTienRut) + tienLai };
  }, [loai, so, soNgayDaGui, soTienRut, today]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!kiemTra.ok && !kiemTra.warn) { setErrorMsg(kiemTra.msg); return; }
    if (!confirmed && kiemTra.warn) { setConfirmed(true); return; }
    setLoading(true);
    setTimeout(() => {
      const idx = soTietKiemData.findIndex(s => s.id === so.id);
      if (idx !== -1) {
        const soDuMoi = tinhKetQua.tatToan ? 0 : so.soDuHienTai - Number(soTienRut);
        soTietKiemData[idx].soDuHienTai = soDuMoi;
        if (soDuMoi === 0) soTietKiemData[idx].trangThai = 'da_tat_toan';
      }
      lichSuGiaoDichData.push({
        id: lichSuGiaoDichData.length + 1,
        maGiaoDich: generateMaGiaoDich('PR'),
        soTietKiemId: so.id,
        loaiGiaoDich: tinhKetQua.tatToan ? 'tat_toan' : 'rut_tien',
        soTien: -Number(soTienRut),
        soDuTruoc: so.soDuHienTai,
        soDuSau: so.soDuHienTai - Number(soTienRut),
        ghiChu: `Rút tiền, lãi: ${formatTien(tinhKetQua.tienLai)}`,
        thoiGian: new Date().toISOString(),
      });
      setLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <Overlay onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModalHeader icon={<TrendingDown className="w-5 h-5 text-rose-400" />} title="Lập Phiếu Rút Tiền" color="rose" />

        <InfoRow label="Mã sổ:" value={<span className="font-mono font-bold text-emerald-400">{so.maSo}</span>} />
        <InfoRow label="Loại TK:" value={loai?.tenLoai} />
        <InfoRow label="Số dư hiện tại:" value={formatTien(so.soDuHienTai)} />
        <InfoRow label="Số ngày đã gởi:" value={`${soNgayDaGui} ngày`} />

        {!kiemTra.ok && !kiemTra.warn && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{kiemTra.msg}</span>
          </div>
        )}
        {kiemTra.warn && !confirmed && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-sm text-amber-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{kiemTra.msg}</span>
          </div>
        )}

        {loai?.kyHanThang === 0 && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Số tiền muốn rút</label>
            <input
              type="number" value={soTienRut} onChange={e => { setSoTienRut(e.target.value); setErrorMsg(''); }}
              max={so.soDuHienTai} min={1} step={100000}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] text-gray-900 dark:text-white text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all"
            />
          </div>
        )}

        {/* Preview kết quả */}
        <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-xl space-y-2 text-sm border border-gray-100 dark:border-gray-800">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Kết quả dự tính</p>
          <InfoRow label="Lãi suất áp dụng:" value={`${tinhKetQua.laiSuatApDung}%/năm`} />
          <InfoRow label="Tiền lãi ước tính:" value={<span className="text-emerald-400 font-bold">{formatTien(tinhKetQua.tienLai)}</span>} />
          <InfoRow label="Số tiền rút:" value={formatTien(Number(soTienRut))} />
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <InfoRow label="Tổng thực nhận:" value={<span className="text-lg font-bold text-emerald-400">{formatTien(tinhKetQua.tongNhan)}</span>} />
          </div>
          {tinhKetQua.tatToan && (
            <p className="text-xs text-amber-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> Sổ sẽ tự động đóng sau khi rút
            </p>
          )}
        </div>

        <ModalActions loading={loading} onClose={onClose} submitLabel={confirmed || !kiemTra.warn ? 'Xác Nhận Rút Tiền' : 'Tôi Đã Hiểu, Tiếp Tục'} submitColor="rose" />
      </form>
    </Overlay>
  );
}
