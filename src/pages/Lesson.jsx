import { useParams, Link } from 'react-router-dom';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { levelById } from '../data/index.js';
import ActivityRenderer from '../components/ActivityRenderer.jsx';
import { speak } from '../lib/speech.js';

export default function Lesson() {
  const { levelId, unitId, lessonId } = useParams();
  const level = levelById(levelId);
  const { user, notify, updateProgress } = useApp();
  const startTime = useRef(Date.now());
  const [done, setDone] = useState(!!user?.progress?.lessonsCompleted?.[lessonId]);

  // تحديد الدرس الحالي والوحدة
  const lesson = useMemo(
    () => level?.units?.find((u) => u.id === unitId)?.lessons?.find((l) => l.id === lessonId),
    [level, unitId, lessonId]
  );
  const unit = useMemo(() => level?.units?.find((u) => u.id === unitId), [level, unitId]);
  const unitIndex = useMemo(() => level?.units?.findIndex((u) => u.id === unitId) || 0, [level, unitId]);
  const lessonIndex = useMemo(() => unit?.lessons?.findIndex((l) => l.id === lessonId) || 0, [unit, lessonId]);

  const nextLesson = unit?.lessons?.[lessonIndex + 1];
  const nextUnitFirst = level?.units?.[unitIndex + 1]?.lessons?.[0];
  const totalActivities = lesson?.activities?.length || 0;
  const [completed, setCompleted] = useState(0);
  const xpAwarded = useRef(false);

  useEffect(() => {
    if (completed === totalActivities && totalActivities > 0 && !xpAwarded.current && !done) {
      xpAwarded.current = true;
      const timeSpent = Date.now() - startTime.current;
      const xp = 20 + completed * 5;
      const cur = user?.progress || {};
      updateProgress({
        lessonsCompleted: { ...cur.lessonsCompleted, [lessonId]: { doneAt: Date.now(), xp } },
        xp: (cur.xp || 0) + xp,
        stats: { ...(cur.stats || {}), timeSpent: (cur.stats?.timeSpent || 0) + timeSpent, activitiesDone: (cur.stats?.activitiesDone || 0) + completed },
      });
      setDone(true);
      notify(`🎉 أتممت الدرس! +${xp} نقطة`);
    }
  }, [completed, totalActivities, lessonId, done, user, updateProgress]);

  if (!lesson || !level || !unit) return <div className="card">الدرس غير موجود.</div>;

  const markActivityDone = (correct) => {
    setCompleted((c) => Math.min(totalActivities, c + 1));
  };

  return (
    <div>
      <div className="crumbs">
        <Link to="/levels">المستويات</Link> /{' '}
        <Link to={`/level/${level.id}`}>{level.id}</Link> / {unit.titleAr} / {lesson.titleAr}
      </div>

      <div className="card" style={{ marginBottom: 18, background: level.color, color: '#fff', border: 'none' }}>
        <h1 style={{ margin: 0 }}>📘 {lesson.titleAr}</h1>
        <div className="fr">{lesson.titleFr}</div>
        <div style={{ marginTop: 8, opacity: .95 }}>🎯 {lesson.objectiveAr}</div>
        <div className="level-tag" style={{ background: 'rgba(255,255,255,.22)', color: '#fff', display: 'inline-block', marginTop: 8 }}>
          ⏱ ~{lesson.minutes} دقيقة • {totalActivities} أنشطة
        </div>
      </div>

      {done && (
        <div className="feedback-box feedback-good" style={{ marginBottom: 16 }}>
          ✅ تم إكمال هذا الدرس وأُضيفت نقاطه إلى تقدمك.
        </div>
      )}

      <div className="section-title">🔊 المفردات</div>
      {lesson.vocab?.length > 0 ? (
        <div className="vocab-card" style={{ marginBottom: 18 }}>
          {lesson.vocab.map((v, i) => (
            <div key={i} className="vocab-item" onClick={() => speakSafe(v.fr)}>
              <div className="fr">{v.fr}</div>
              <div className="ar">{v.ar}</div>
              {v.pron && <div className="pron">🗣 {v.pron}</div>}
              {v.example && <div className="fr" style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{v.example}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="subtitle">لا توجد مفردات جديدة في هذا الدرس.</p>
      )}

      <div className="section-title">📝 الأنشطة</div>
      {lesson.activities?.map((act, i) => (
        <div key={i}>
          <ActivityRenderer activity={act} onComplete={markActivityDone} />
        </div>
      ))}

      {/* التنقل */}
      <div className="lesson-nav card" style={{ boxShadow: 'none' }}>
        <div>
          {lessonIndex > 0 && (
            <Link to={`/lesson/${level.id}/${unit.id}/${unit.lessons[lessonIndex - 1].id}`} className="btn btn-outline">→ الدرس السابق</Link>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {nextLesson ? (
            <Link to={`/lesson/${level.id}/${unit.id}/${nextLesson.id}`} className="btn btn-bleu">الدرس التالي ←</Link>
          ) : nextUnitFirst ? (
            <Link to={`/lesson/${level.id}/${level.units[unitIndex + 1].id}/${nextUnitFirst.id}`} className="btn btn-bleu">
              الوحدة التالية: {level.units[unitIndex + 1].titleAr} ←
            </Link>
          ) : (
            <Link to={`/level/${level.id}`} className="btn btn-green">✅ انتهيت من الوحدة — عد إلى المستوى</Link>
          )}
        </div>
      </div>
    </div>
  );
}

// مساعد نطق بسيط
function speakSafe(text) {
  try {
    speak(text);
  } catch {}
}
