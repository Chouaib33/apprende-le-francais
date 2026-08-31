import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import LEVELS from '../data/index.js';
import { levelProgress, levelUnlocked } from '../lib/progress.js';

export default function Levels() {
  const { user } = useApp();
  const progress = user?.progress;

  return (
    <div>
      <div className="section-title">🗺️ رحلة تعلمك — من A1 إلى B2</div>
      <p className="subtitle">
        تتقدّم مستوى تلو الآخر. لا يمكنك الانتقال إلى مستوى جديد قبل اجتياز اختبار الخروج للمستوى السابق بنجاح.
      </p>

      <div className="grid" style={{ gap: 22 }}>
        {LEVELS.map((lv, i) => {
          const unlocked = user ? levelUnlocked(progress, lv.id, LEVELS) : false;
          const prog = user ? levelProgress(progress, lv) : 0;
          const test = progress?.levelTests?.[lv.id];

          return (
            <div key={lv.id} className="card level-card">
              {!unlocked && (
                <div className="lock-overlay">
                  <span className="lock-pill">🔒 أتمّ المستوى السابق واختبار الخروج</span>
                </div>
              )}
              <div className="top">
                <div className="level-badge" style={{ background: lv.color }}>{lv.id}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{lv.titleAr}</div>
                  <div className="fr" style={{ color: 'var(--muted)' }}>{lv.titleFr}</div>
                </div>
                <div style={{ marginInlineStart: 'auto', textAlign: 'left' }}>
                  <span className="level-tag">الغمر {lv.immersion}%</span>
                  {test && (
                    <div className="level-tag" style={{ marginTop: 4, background: test.passed ? 'var(--green-soft)' : 'var(--rouge-soft)', color: test.passed ? 'var(--green)' : 'var(--rouge)' }}>
                      {test.passed ? '✅ ناجح' : `الاختبار: ${test.score}%`}
                    </div>
                  )}
                </div>
              </div>
              <p className="subtitle">{lv.description}</p>
              <div className="grid grid-3" style={{ marginTop: 8 }}>
                {lv.units.map((u) => (
                  <div key={u.id} className="card" style={{ padding: 14, boxShadow: 'none' }}>
                    <div style={{ fontSize: '1.4rem' }}>{u.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '.95rem' }}>{u.titleAr}</div>
                    <div className="fr" style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{u.titleFr}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{u.lessons.length} دروس</div>
                  </div>
                ))}
              </div>
              <div className="progress-track" style={{ marginTop: 14 }}>
                <div className="progress-fill" style={{ width: (user ? prog : 0) + '%', background: lv.color }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: '.88rem', color: 'var(--muted)' }}>{user ? prog + '% مكتمل' : 'سجّل دخولك لتتبع التقدم'}</span>
                {unlocked && <Link to={`/level/${lv.id}`} className="btn btn-bleu btn-sm">ابدأ المستوى →</Link>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
