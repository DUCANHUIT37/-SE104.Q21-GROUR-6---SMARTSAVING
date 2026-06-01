import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Cấu hình style theo type ───────────────────────────────────────────────
const TYPE_CONFIG = {
  success: {
    icon: <CheckCircle className="w-8 h-8" />,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    btnBg: 'bg-emerald-500 hover:bg-emerald-600',
    border: 'border-emerald-500/20',
  },
  error: {
    icon: <XCircle className="w-8 h-8" />,
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-400',
    btnBg: 'bg-red-500 hover:bg-red-600',
    border: 'border-red-500/20',
  },
  warning: {
    icon: <AlertTriangle className="w-8 h-8" />,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-600',
    border: 'border-amber-500/20',
  },
  info: {
    icon: <Info className="w-8 h-8" />,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    btnBg: 'bg-sky-500 hover:bg-sky-600',
    border: 'border-sky-500/20',
  },
};

/**
 * AlertModal – popup thông báo đồng bộ (thay thế toast toàn project)
 *
 * Props:
 *  open         {boolean}  - hiển thị / ẩn
 *  type         {string}   - 'success' | 'error' | 'warning' | 'info'
 *  title        {string}   - tiêu đề
 *  message      {string}   - nội dung
 *  confirmLabel {string}   - nhãn nút confirm (mặc định 'Xác nhận')
 *  onConfirm    {function} - callback khi bấm confirm (rồi tự đóng)
 *  onClose      {function} - callback đóng (nút X / click nền / Escape)
 *  cancelLabel  {string}   - nếu truyền → hiện thêm nút Hủy
 *  onCancel     {function} - callback khi bấm Hủy
 */
export default function AlertModal({
  open,
  type = 'info',
  title,
  message,
  confirmLabel = 'Xác nhận',
  onConfirm,
  onClose,
  cancelLabel,
  onCancel,
}) {
  // Đóng bằng phím Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  const handleConfirm = () => {
    onConfirm?.();
    onClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className={`relative bg-white dark:bg-[#1a2332] rounded-2xl border ${cfg.border} shadow-2xl w-full max-w-sm p-6 alert-modal-in`}>

        {/* Nút X đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className={`mx-auto w-14 h-14 rounded-full ${cfg.iconBg} flex items-center justify-center mb-4 ${cfg.iconColor}`}>
          {cfg.icon}
        </div>

        {/* Nội dung */}
        <div className="text-center mb-6">
          {title && (
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          {message && (
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {cancelLabel && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.97] shadow-sm ${cfg.btnBg}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Animation keyframe – inject once globally */}
      <style>{`
        .alert-modal-in {
          animation: alertModalIn 0.2s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes alertModalIn {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}

/**
 * useAlert – hook tiện ích để dùng AlertModal
 *
 * Cách dùng:
 *   const { alertProps, showAlert } = useAlert();
 *   ...
 *   showAlert({ type: 'success', title: 'Thành công', message: 'Xong!', onConfirm: () => navigate('/login') });
 *   ...
 *   <AlertModal {...alertProps} />
 */
export function useAlert() {
  const [alertProps, setAlertProps] = useState({ open: false });

  const closeAlert = useCallback(() => {
    setAlertProps((p) => ({ ...p, open: false }));
  }, []);

  const showAlert = useCallback((options) => {
    setAlertProps({
      open: true,
      type: 'info',
      confirmLabel: 'Xác nhận',
      ...options,
      onClose: closeAlert,
    });
  }, [closeAlert]);

  return { alertProps, showAlert };
}
