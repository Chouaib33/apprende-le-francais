import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function TestModal({ title, questions, passingScore, levelId, onClose }) {
  const { user, updateProgress, notify } = useApp();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // إجابات [i]
  const [finished, setFinished] = useState(false);
  const q = questions[idx];

  const pick = (oi) => {
    const na = [...answers];
    na[idx] = oi;
    setAnswers(na);
  };

  const next = () => {
    if (idx < questions.length - 1) setIdx(idx + 1);
    else finish();
  };

  const finish = () => {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= passingScore;
    setFinished(true);
    // تحديث التقدم: ندمج نتيجة الاختبار في سجل المستوى
    const cur = user?.progress || {};
    const patch = {
      levelTests: { ...(cur.levelTests || {}), [levelId]: { score, passed, completedAt: Date.now() } },
    };
    updateProgress(patch);
    notify(passed ? `🎉 نجحت في الاختبار بنسبة ${score}%!` : `نسبة ${score}%. أنت بحاجة إلى ${passingScore}% للمرور.`);
  };

  const score = finished ? Math.round((answers.filter((a, i) => a === questions[i].correct).length / questions.length) * 100) : 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,40,.6)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(3px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
        {!finished ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</div>
              <button className="btn btn-sm btn-outline" onClick={onClose}>✕ إغلاق</button>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: ((idx + 1) / questions.length) * 100 + '%', background: 'var(--bleu)' }} />
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: 10 }}>السؤال {idx + 1} من {questions.length}</div>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>
              <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{q.qFr}</span>
              {q.qAr}
            </div>
            {q.options.map((o, oi) => {
              let cls = 'option-row';
              if (answers[idx] === oi) cls += ' selected';
              return (
                <div key={oi} className={cls} onClick={() => pick(oi)}>
                  <span className="option-key">{String.fromCharCode(97 + oi)}</span>
                  <span className="fr">{o}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-sm btn-outline" onClick={() => idx > 0 && setIdx(idx - 1)} disabled={idx === 0}>السابق</button>
              <button className="btn btn-bleu" onClick={next} disabled={answers[idx] === undefined}>
                {idx === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: '3rem' }}>{score >= passingScore ? '🎉' : '📚'}</div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{score >= passingScore ? 'ممتاز! نجحت!' : 'حاول مرة أخرى'}</div>
              <div className="fr" style={{ color: 'var(--muted)' }}>نتيجتك: {score}% (المطلوب {passingScore}%)</div>
              <div className="progress-track" style={{ maxWidth: 300, margin: '16px auto' }}>
                <div className="progress-fill" style={{ width: score + '%', background: score >= passingScore ? 'var(--green)' : 'var(--rouge)' }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: 14 }}>
                {questions.map((q, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: 10, background: answers[i] === q.correct ? 'var(--green-soft)' : 'var(--rouge-soft)', borderRadius: 10 }}>
                    <div style={{ fontWeight: 700 }}>{answers[i] === q.correct ? '✅' : '❌'} {q.qAr}</div>
                    <div className="feedback-box" style={{ background: 'transparent', padding: 0, marginTop: 4 }}>{q.explainAr}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-bleu" onClick={onClose} style={{ marginTop: 10 }}>إغلاق النتيجة</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
