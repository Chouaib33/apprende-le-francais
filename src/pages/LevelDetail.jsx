import { Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { levelById, nextLevel } from '../data/index.js';
import { levelUnlocked, levelProgress, unitProgress } from '../lib/progress.js';
import LEVELS from '../data/index.js';
import { useMemo, useState } from 'react';
import TestModal from '../components/TestModal.jsx';

export default function LevelDetail() {
  const { levelId } = useParams();
  const level = levelById(levelId);
  const { user, notify } = useApp();
  const navigate = useNavigate();
  const [testMode, setTestMode] = useState(null); // 'unit' | 'level'
  const [testUnit, setTestUnit] = useState(null);

  const progress = user?.progress;
  const unlocked = user ? levelUnlocked(progress, levelId, LEVELS) : false;
  const prog = user ? levelProgress(progress, level) : 0;
  const testDone = progress?.levelTests?.[levelId];

  const allVocab = useMemo(() => {
    const v = [];
    level.units.forEach((u) => u.lessons.forEach((l) => (l.vocab || []).forEach((x) => v.push(x))));
    return v;
  }, [level]);

  if (!level) return <div className="card">المستوى غير موجود.</div>;

  return (
    <div>
      <div className="crumbs">
        <Link to="/levels">المستويات</Link> / {level.id}
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, ' + level.color + ', #253a7a)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="level-badge" style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>{level.id}</div>
          <div>
            <h1 style={{ margin: 0 }}>{level.titleAr}</h1>
            <div className="fr">{level.titleFr}</div>
            <p style={{ margin: '6px 0 0', opacity: .95 }}>{level.description}</p>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
            <span>تقدمك: {user ? prog + '%' : '—'}</span>
            <span>الغمر اللغوي: {level.immersion}%</span>
          </div>
          <div className="progress-track" style={{ background: 'rgba(255,255,255,.2)' }}>
            <div className="progress-fill" style={{ width: (user ? prog : 0) + '%', background: '#fff' }} />
          </div>
        </div>
      </div>

      {!user ? (
        <div className="card" style={{ marginTop: 18 }}>
          <Link to="/auth">سجّل دخولك</Link> لتتبع تقدمك وفتح الاختبارات.
        </div>
      ) : !unlocked ? (
        <div className="card" style={{ marginTop: 18, background: 'var(--rouge-soft)', borderColor: '#f2cdcc' }}>
          🔒 هذا المستوى مقفل. أتمم المستوى السابق واجتز اختبار الخروج بنجاح.
        </div>
      ) : (
        <>
          <div className="section-title">📚 الوحدات ({level.units.length})</div>
          <div className="grid">
            {level.units.map((u) => {
              const up = user ? unitProgress(progress, u) : 0;
              const uTest = progress.unitTests?.[u.id];
              return (
                <div key={u.id} className="card">
                  <div className="top">
                    <div style={{ fontSize: '1.8rem' }}>{u.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>الوحدة {u.number}: {u.titleAr}</div>
                      <div className="fr" style={{ color: 'var(--muted)' }}>{u.titleFr}</div>
                    </div>
                    <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{up}%</span>
                  </div>
                  <p className="subtitle" style={{ fontSize: '.9rem' }}>🎯 {u.objectiveAr}</p>

                  <div className="grid" style={{ gap: 10 }}>
                    {u.lessons.map((l, li) => {
                      const done = progress.lessonsCompleted?.[l.id];
                      return (
                        <div key={l.id} className={`lesson-card card ${done ? 'done' : ''}`} style={{ padding: 12, boxShadow: 'none' }}>
                          <div className="lesson-num">{done ? '✓' : li + 1}</div>
                          <Link to={`/lesson/${level.id}/${u.id}/${l.id}`}>
                            <div style={{ fontWeight: 700 }}>{l.titleAr}</div>
                            <div className="fr" style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{l.titleFr}</div>
                            <div className="lesson-meta">⏱ {l.minutes} دقيقة • {l.objectiveAr}</div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 14, borderTop: '1px dashed var(--line)', paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <strong>🏁 المهمة الختامية:</strong> {u.tacheFinale.titleAr}
                        <div className="fr" style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{u.tacheFinale.titleFr}</div>
                      </div>
                    </div>
                    {uTest ? (
                      <div className={`level-tag`} style={{ marginTop: 8, background: uTest.passed ? 'var(--green-soft)' : 'var(--rouge-soft)', color: uTest.passed ? 'var(--green)' : 'var(--rouge)' }}>
                        اختبار الوحدة: {uTest.score}% {uTest.passed ? '✅' : '(الأفضل 60%)'}
                      </div>
                    ) : (
                      <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={() => { setTestMode('unit'); setTestUnit(u); }}>
                        🧪 اختبار الوحدة (إعادة مراجعة)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ marginTop: 22, background: level.color, color: '#fff', border: 'none' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>🏆 اختبار الخروج للمستوى {level.id}</div>
            <p style={{ margin: '6px 0', opacity: .95 }}>للمرور إلى المستوى التالي، عليك اجتياز هذا الاختبار بنسبة 60% على الأقل.</p>
            {testDone && testDone.passed && (
              <div className="level-tag" style={{ background: 'rgba(255,255,255,.25)', color: '#fff', display: 'inline-block', marginBottom: 8 }}>
                ✅ نجحت بنسبة {testDone.score}%
              </div>
            )}
            <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setTestMode('level')}>
                {testDone ? '🔄 إعادة الاختبار' : '🚀 ابدأ اختبار الخروج'}
              </button>
              {testDone?.passed && nextLevel(level.id) && (
                <Link to={`/level/${nextLevel(level.id).id}`} className="btn btn-ghost">
                  المستوى التالي: {nextLevel(level.id).id} →
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      {testMode && (
        <TestModal
          title={testMode === 'level' ? level.testSortie.titleAr : testUnit.titleAr + ' — اختبار'}
          questions={testMode === 'level' ? level.testSortie.questions : makeUnitQuiz(testUnit)}
          passingScore={60}
          levelId={level.id}
          onClose={() => { setTestMode(null); setTestUnit(null); }}
        />
      )}
    </div>
  );
}

// توليد اختبار وحدة بسيط من المحتوى (أول سؤال MCQ في الدروس)
function makeUnitQuiz(unit) {
  const qs = [];
  unit.lessons.forEach((l) => {
    const mcq = (l.activities || []).find((a) => a.type === 'mcq');
    if (mcq) qs.push(mcq);
  });
  // أضف سؤالاً عن المفردات
  const vocab = [];
  unit.lessons.forEach((l) => (l.vocab || []).forEach((v) => vocab.push(v)));
  if (vocab.length >= 2) {
    const v = vocab[0];
    const distractors = vocab.slice(1).map((x) => x.ar).filter((a) => a !== v.ar).slice(0, 3);
    if (distractors.length >= 1) {
      const options = shuffle([v.ar, ...distractors]);
      qs.push({
        qAr: 'ما معنى «' + v.fr + '»؟',
        qFr: 'Que signifie «' + v.fr + '» ?',
        options,
        correct: options.indexOf(v.ar),
        explainAr: '«' + v.fr + '» تعني: ' + v.ar,
      });
    }
  }
  return qs.length ? qs : [{ qAr: 'مثال', qFr: 'ex', options: ['a', 'b'], correct: 0, explainAr: '' }];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
