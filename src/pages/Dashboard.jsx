import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import LEVELS from '../data/index.js';
import { levelProgress, totalXp, totalTimeMin } from '../lib/progress.js';
import { srsStats } from '../lib/srs.js';

export default function Dashboard() {
  const { user } = useApp();
  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem' }}>🔐</div>
        <h2>سجّل دخولك لعرض لوحة التحكم</h2>
        <Link to="/auth" className="btn btn-bleu">تسجيل الدخول</Link>
      </div>
    );
  }

  const p = user.progress;
  const srs = srsStats(p.srs || {});
  const xp = totalXp(p);
  const timeMin = totalTimeMin(p);
  const doneLessons = Object.keys(p.lessonsCompleted || {}).length;
  const totalLessons = LEVELS.reduce((a, l) => a + l.units.reduce((b, u) => b + u.lessons.length, 0), 0);

  const levelProgressList = LEVELS.map((l) => ({ level: l, prog: levelProgress(p, l) }));
  const activeLevel = levelProgressList.reduce((best, cur) => (cur.prog > best.prog ? cur : best), levelProgressList[0]);

  // نقاط الضعف (ضعف الأداء) — في الواقع نحتاج بيانات، نعرض مؤشرات عامة
  const weaknesses = [
    { c: 'الماضي المركب (Passé composé)', s: 'متوسط' },
    { c: 'الضمائر المتصلة', s: 'يحتاج تدريب' },
    { c: 'الجملة الشرطية', s: 'جيد' },
  ];

  return (
    <div>
      <div className="section-title">📊 لوحة التحكم</div>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--bleu), var(--bleu-dark))', color: '#fff', border: 'none' }}>
        <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>أهلاً، {user.name} 👋</div>
        <p style={{ margin: '4px 0', opacity: .95 }}>واصل رحلتك — أنت في {activeLevel.level.titleAr}.</p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 16 }}>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>⭐ {xp}</div><div style={{ opacity: .85, fontSize: '.85rem' }}>نقاط الخبرة</div></div>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 {p.streak?.count || 0}</div><div style={{ opacity: .85, fontSize: '.85rem' }}>أيام متتالية</div></div>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>⏱ {timeMin}</div><div style={{ opacity: .85, fontSize: '.85rem' }}>دقيقة تعلم</div></div>
          <div><div style={{ fontSize: '1.8rem', fontWeight: 800 }}>📚 {srs.total}</div><div style={{ opacity: .85, fontSize: '.85rem' }}>كلمة في SRS</div></div>
        </div>
      </div>

      <div className="section-title">📈 تقدمك في المستويات</div>
      <div className="grid grid-2">
        {levelProgressList.map(({ level, prog }) => (
          <div key={level.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>{level.titleAr}</div>
              <div className="level-badge" style={{ width: 40, height: 40, fontSize: '1rem', background: level.color }}>{level.id}</div>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: prog + '%', background: level.color }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: 'var(--muted)' }}>
              <span>{prog}%</span>
              <Link to={`/level/${level.id}`}>افتح ←</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="section-title">🎓 إحصائيات التعلم</div>
      <div className="grid grid-3">
        <div className="card stat-card"><div className="num">{doneLessons}</div><div className="label">درس مكتمل من {totalLessons}</div></div>
        <div className="card stat-card"><div className="num">{srs.dueToday}</div><div className="label">بطاقة SRS مستحقة اليوم</div></div>
        <div className="card stat-card"><div className="num">{p.stats?.activitiesDone || 0}</div><div className="label">نشاط أُنجز</div></div>
      </div>

      <div className="section-title">🎖️ شاراتك</div>
      <div className="card">
        {p.badges && p.badges.length ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {p.badges.map((b, i) => <span key={i} className="badge-chip">{b}</span>)}
          </div>
        ) : (
          <p className="subtitle">لا شارات بعد. أتمم الدروس والاختبارات لكسب شاراتك الأولى! 🚀</p>
        )}
      </div>

      <div className="section-title">⚠️ نقاط الضعف المقترحة للتدريب</div>
      <div className="card">
        {weaknesses.map((w, i) => (
          <div key={i} className="weakness-item">
            <span>{w.c}</span>
            <span className="level-tag" style={{ background: w.s === 'يحتاج تدريب' ? 'var(--rouge-soft)' : 'var(--green-soft)', color: w.s === 'يحتاج تدريب' ? 'var(--rouge)' : 'var(--green)' }}>{w.s}</span>
          </div>
        ))}
        <Link to="/report" className="btn btn-outline" style={{ marginTop: 14 }}>📄 تصدير تقرير التقدم</Link>
      </div>
    </div>
  );
}
