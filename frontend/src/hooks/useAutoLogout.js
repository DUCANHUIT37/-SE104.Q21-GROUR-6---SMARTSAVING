import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const useAutoLogout = (timeoutMs = 1200000) => {
  const { logout, user } = useAuth();
  const timeoutId = useRef(null);

  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    const handleInactivity = () => {
      logout();
      toast.error('Đã đăng xuất do không có hoạt động trong 20 phút.');
      window.location.href = '/login';
    };

    const resetTimer = () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      timeoutId.current = setTimeout(handleInactivity, timeoutMs);
    };

    // Initialize timer
    resetTimer();

    // Events to track activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    const activityListener = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, activityListener);
    });

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, activityListener);
      });
    };
  }, [logout, user, timeoutMs]);
};
