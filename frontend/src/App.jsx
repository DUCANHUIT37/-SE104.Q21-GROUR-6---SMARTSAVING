import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootLayout from './layouts/RootLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import OpenSavings from './pages/OpenSavings';
import Passbooks from './pages/Passbooks';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/overview" />} />

        {/* Protected routes (cần đăng nhập) */}
        <Route element={<ProtectedRoute><RootLayout /></ProtectedRoute>}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
          
          <Route path="/open-savings" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien']}><OpenSavings /></ProtectedRoute>} />
          <Route path="/passbooks" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien']}><Passbooks /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien']}><Transactions /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien', 'ROLE_giao_dich_vien']}><Reports /></ProtectedRoute>} />
          
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien']}><Settings /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['ROLE_quan_tri_vien']}><Users /></ProtectedRoute>} />
          
          <Route path="/my-passbooks" element={<ProtectedRoute allowedRoles={['ROLE_khach_hang']}><Passbooks /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;