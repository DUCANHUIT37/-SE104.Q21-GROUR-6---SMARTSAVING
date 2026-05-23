import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/overview" />} />

        {/* Protected routes (cần đăng nhập) */}
        <Route element={<ProtectedRoute><RootLayout /></ProtectedRoute>}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/open-savings" element={<OpenSavings />} />
          <Route path="/passbooks" element={<Passbooks />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="ADMIN"><Settings /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute requiredRole="ADMIN"><Users /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/overview" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;