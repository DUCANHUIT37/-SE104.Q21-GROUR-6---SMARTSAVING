import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.quyenHan)) {
    // If user is a customer, send them to their dashboard
    if (user.quyenHan === 'ROLE_khach_hang') {
        return <Navigate to="/dashboard" replace />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#05080D] gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-white">403 Forbidden</h2>
        <p className="text-gray-500">Bạn không có quyền truy cập vào chức năng này.</p>
      </div>
    );
  }

  return children;
}
