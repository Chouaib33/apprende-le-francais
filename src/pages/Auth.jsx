import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function Auth() {
  const { user, login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem' }}>👋</div>
        <h2>مرحباً، {user.name}!</h2>
        <p className="subtitle">أنت مسجّل الدخول الآن.</p>
        <button className="btn btn-bleu" onClick={() => navigate('/dashboard')}>الذهاب إلى لوحة التحكم</button>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const res = mode === 'login'
      ? login(email, password)
      : register(name, email, password);
    if (!res.ok) setError(res.error);
    else navigate('/dashboard');
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: '2.5rem' }}>🇫🇷</div>
          <h2 style={{ margin: '6px 0' }}>{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
          <p className="subtitle">نظام حسابات يوفّر حفظ تقدمك في هذا المتصفح.</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>دخول</button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>حساب جديد</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="field">
              <label>الاسم</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك" required />
            </div>
          )}
          <div className="field">
            <label>البريد الإلكتروني</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" dir="ltr" required />
          </div>
          <div className="field">
            <label>كلمة المرور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" dir="ltr" required />
          </div>
          {error && <div className="feedback-box feedback-bad" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-bleu btn-block" type="submit">
            {mode === 'login' ? 'دخول' : 'إنشاء الحساب وبدء التعلم'}
          </button>
        </form>
        <div className="feedback-box feedback-info" style={{ marginTop: 14 }}>
          💡 هذا تطبيق تجريبي: تُحفظ البيانات محلياً على جهازك (localStorage). لا تُرسل كلمات مرور حساسة.
        </div>
      </div>
    </div>
  );
}
