import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
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

  if (requiredRole === 'ADMIN' && user.quyenHan !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Không có quyền truy cập</h2>
        <p className="text-gray-500">Chức năng này chỉ dành cho Quản trị viên.</p>
      </div>
    );
  }

  return children;
}
