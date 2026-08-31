import { createContext, useContext, useState, useCallback } from 'react';
import {
  currentUser,
  loginUser,
  registerUser,
  logoutUser,
  saveProgress,
} from '../lib/storage.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(currentUser());
  const [toast, setToast] = useState(null);

  const notify = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const login = (email, password) => {
    const res = loginUser(email, password);
    if (res.ok) {
      setUser(res.user);
      notify('تم تسجيل الدخول بنجاح 🎉');
    }
    return res;
  };

  const register = (name, email, password) => {
    const res = registerUser(name, email, password);
    if (res.ok) {
      setUser(res.user);
      notify('تم إنشاء حسابك بنجاح 🎉');
    }
    return res;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    notify('تم تسجيل الخروج.');
  };

  const updateProgress = (patch) => {
    saveProgress(patch);
    setUser(currentUser());
  };

  return (
    <AppContext.Provider
      value={{ user, setUser, login, register, logout, notify, updateProgress }}
    >
      {children}
      {toast && (
        <div
          key={toast.id}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: toast.type === 'error' ? '#d9534f' : toast.type === 'warn' ? '#f0ad4e' : '#2e8b57',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: 12,
            boxShadow: '0 6px 20px rgba(0,0,0,.25)',
            zIndex: 10000,
            fontWeight: 600,
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {toast.msg}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
