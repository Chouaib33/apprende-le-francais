import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import Home from './pages/Home.jsx';
import Levels from './pages/Levels.jsx';
import LevelDetail from './pages/LevelDetail.jsx';
import Lesson from './pages/Lesson.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SRS from './pages/SRS.jsx';
import Dictionary from './pages/Dictionary.jsx';
import Chat from './pages/Chat.jsx';
import Auth from './pages/Auth.jsx';
import Report from './pages/Report.jsx';

function Navbar() {
  const { user, logout } = useApp();
  const location = useLocation();
  const isActive = (p) => location.pathname.startsWith(p);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <span className="brand-flag" />
          <span>
            تعلّم الفرنسية
            <span className="fr" style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'block', fontWeight: 600 }}>
              Apprendre le français
            </span>
          </span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/levels" className={isActive('/levels') || isActive('/level/') ? 'active' : ''}>المستويات</NavLink>
          <NavLink to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>لوحة التحكم</NavLink>
          <NavLink to="/srs" className={isActive('/srs') ? 'active' : ''}>التكرار المتباعد</NavLink>
          <NavLink to="/dictionary" className={isActive('/dictionary') ? 'active' : ''}>القاموس</NavLink>
          <NavLink to="/chat" className={isActive('/chat') ? 'active' : ''}>شريك المحادثة</NavLink>
          {user ? (
            <div className="nav-user">
              <span>👤 {user.name}</span>
              <span className="nav-xp">⭐ {user.progress.xp} XP</span>
              <button className="btn btn-sm btn-outline" onClick={logout} style={{ marginInlineStart: 6 }}>
                خروج
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className={isActive('/auth') ? 'active' : ''}>دخول</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBottom: 60 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/levels" element={<Levels />} />
          <Route path="/level/:levelId" element={<LevelDetail />} />
          <Route path="/lesson/:levelId/:unitId/:lessonId" element={<Lesson />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/srs" element={<SRS />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/report" element={<Report />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
