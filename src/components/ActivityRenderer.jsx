import { useState, useRef, useEffect } from 'react';
import { speak, isRecognitionSupported, recognizeSpeech, gradePronunciation } from '../lib/speech.js';
import { analyzeText, essayCheck } from '../lib/feedback.js';

/* أزرار مساعدة صغيرة */
export function SpeakButton({ text, accent, label = '🔊 استمع', rate }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setPlaying(false), 4000);
    return () => clearTimeout(t);
  }, [playing]);
  return (
    <button
      className="speak-btn"
      onClick={(e) => {
        e.preventDefault();
        const ok = speak(text, accent, rate);
        if (ok) setPlaying(true);
      }}
      disabled={playing}
    >
      {playing ? '🔊 ...' : label}
    </button>
  );
}

/* -------- نشاط مفردات -------- */
function VocabActivity({ vocab }) {
  return (
    <div>
      <div className="vocab-card">
        {vocab.map((v, i) => (
          <div key={i} className="vocab-item" onClick={() => speak(v.fr)} title="انقر للاستماع">
            <div className="fr">{v.fr}</div>
            <div className="ar">{v.ar}</div>
            {v.pron && <div className="pron">🗣 {v.pron}</div>}
            {v.example && <div className="fr" style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{v.example}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- نشاط اختيار من متعدد -------- */
function MCQ({ q, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const opt = (i) => String.fromCharCode(97 + i);
  const check = () => {
    if (selected === null) return;
    setChecked(true);
    onComplete && onComplete(selected === q.correct);
  };
  return (
    <div>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>
        <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{q.qFr}</span>
        {q.qAr}
      </div>
      {q.options.map((o, i) => {
        let cls = 'option-row';
        if (checked) {
          if (i === q.correct) cls += ' correct';
          else if (i === selected) cls += ' wrong';
        } else if (i === selected) cls += ' selected';
        return (
          <div key={i} className={cls} onClick={() => !checked && setSelected(i)}>
            <span className="option-key">{opt(i)}</span>
            <span className="fr">{o}</span>
            {checked && i === q.correct && <span style={{ marginInlineStart: 'auto' }}>✅</span>}
            {checked && i === selected && i !== q.correct && <span style={{ marginInlineStart: 'auto' }}>❌</span>}
          </div>
        );
      })}
      {!checked && (
        <button className="btn btn-bleu" onClick={check} disabled={selected === null} style={{ marginTop: 10 }}>
          تحقق
        </button>
      )}
      {checked && q.explainAr && (
        <div className={`feedback-box ${selected === q.correct ? 'feedback-good' : 'feedback-bad'}`}>
          {selected === q.correct ? '✅ إجابة صحيحة! ' : '❌ الإجابة الصحيحة: '}
          {q.explainAr}
        </div>
      )}
    </div>
  );
}

/* -------- نشاط ملء الفراغ -------- */
function BlankActivity({ items, onComplete }) {
  const [answers, setAnswers] = useState(items.map(() => null));
  const [checked, setChecked] = useState(false);
  const allAnswered = answers.every((a) => a !== null);
  const check = () => {
    if (!allAnswered) return;
    setChecked(true);
    const correct = items.every((it, i) => it.answer === answers[i]);
    onComplete && onComplete(correct);
  };
  return (
    <div>
      {items.map((it, i) => {
        const isRight = checked && answers[i] === it.answer;
        const isWrong = checked && answers[i] !== it.answer;
        return (
          <div key={i} style={{ marginBottom: 14, padding: 12, border: '2px solid var(--line)', borderRadius: 12 }}>
            <div className="fr" style={{ fontWeight: 700 }}>
              {it.sentence.split('___').reduce((acc, part, idx) => {
                const sep = it.sentence.split('___')[idx + 1] !== undefined;
                return (
                  <span key={idx}>
                    {acc}
                    {sep && (
                      <select
                        value={answers[i] ?? ''}
                        disabled={checked}
                        onChange={(e) => {
                          const na = [...answers];
                          na[i] = e.target.value;
                          setAnswers(na);
                        }}
                        style={{ margin: '0 4px', padding: '4px 6px', borderRadius: 8, border: '2px solid var(--bleu)', fontWeight: 800, color: 'var(--bleu)' }}
                      >
                        <option value="">…</option>
                        {it.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                    {!sep && <span>{part}</span>}
                  </span>
                );
              }, null)}
            </div>
            {checked && (
              <div style={{ marginTop: 8 }}>
                {isRight && <div className="feedback-box feedback-good">✅ صحيح! {it.explainAr}</div>}
                {isWrong && <div className="feedback-box feedback-bad">❌ الإجابة الصحيحة: {it.answer}. {it.explainAr}</div>}
              </div>
            )}
          </div>
        );
      })}
      {!checked && (
        <button className="btn btn-bleu" onClick={check} disabled={!allAnswered}>
          تحقق من الإجابات
        </button>
      )}
    </div>
  );
}

/* -------- نشاط قواعد مع جدول -------- */
function GrammarActivity({ activity }) {
  const visual = activity.visual;
  return (
    <div>
      <div className="reading-text" style={{ borderRightColor: 'var(--gold)' }}>
        <strong>القاعدة: </strong>
        {activity.ruleAr}
      </div>
      <div style={{ marginTop: 14 }}>
        <strong>أمثلة:</strong>
        {(activity.examples || []).map((ex, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 12, marginTop: 8 }}>
            <div className="fr" style={{ fontWeight: 800, color: 'var(--bleu)' }}>
              {ex.fr} {ex.audio && <SpeakButton text={ex.fr} />}
            </div>
            <div className="ar">{ex.ar}</div>
            <div style={{ color: 'var(--muted)', fontSize: '.88rem' }}>💡 {ex.explanationAr}</div>
          </div>
        ))}
      </div>
      {visual && (
        <div style={{ marginTop: 14 }}>
          <strong>{visual.titleAr}</strong>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                {Object.keys(visual.table[0]).map((k, i) => (
                  <th key={i} style={{ textAlign: 'center', background: 'var(--bleu-soft)', padding: 10, border: '1px solid var(--line)' }}>
                    {k === 'pronoun' ? 'الضمير' : k === 'etre' ? 'être' : k === 'avoir' ? 'avoir' : 'مثال'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.table.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="fr" style={{ textAlign: 'center', padding: 8, border: '1px solid var(--line)', color: v && j > 0 ? 'var(--bleu)' : undefined, fontWeight: v && j > 0 ? 800 : 400 }}>
                      {v || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------- نشاط استماع -------- */
function ListeningActivity({ activity, onComplete }) {
  const [showTrans, setShowTrans] = useState(false);
  const [answers, setAnswers] = useState(activity.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const allAnswered = answers.every((a) => a !== null);
  const check = () => {
    if (!allAnswered) return;
    setChecked(true);
    const correct = activity.questions.every((q, i) => answers[i] === q.correct);
    onComplete && onComplete(correct);
  };
  return (
    <div>
      <SpeakButton text={activity.audio} accent={activity.accent} label="▶️ تشغيل التسجيل" />
      <div style={{ color: 'var(--muted)', marginTop: 6, fontSize: '.85rem' }}>اللّهجة: {activity.accent}</div>
      <button className="btn btn-sm btn-outline" style={{ marginTop: 8 }} onClick={() => setShowTrans(!showTrans)}>
        {showTrans ? 'إخفاء النسخة النصية' : 'إظهار النسخة النصية'}
      </button>
      {showTrans && (
        <div>
          <div className="transcript">
            <span className="fr">{activity.transcript}</span>
            {activity.transcriptAr && (
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>{activity.transcriptAr}</div>
            )}
          </div>
        </div>
      )}
      <div style={{ marginTop: 18 }}>
        {activity.questions.map((q, qi) => (
          <div key={qi} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>
              <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{q.qFr}</span>
              {q.qAr}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {q.options.map((o, oi) => {
                let cls = 'btn btn-sm ' + (checked ? (oi === q.correct ? 'btn-green' : answers[qi] === oi ? 'btn-red' : 'btn-outline') : 'btn-outline');
                return (
                  <button key={oi} className={cls} disabled={checked} onClick={() => {
                    const na = [...answers]; na[qi] = oi; setAnswers(na);
                  }}>
                    <span className="fr">{o}</span>
                  </button>
                );
              })}
            </div>
            {checked && q.explainAr && (
              <div className={`feedback-box ${answers[qi] === q.correct ? 'feedback-good' : 'feedback-bad'}`} style={{ marginTop: 8 }}>
                {answers[qi] === q.correct ? '✅ ' : '❌ '} {q.explainAr}
              </div>
            )}
          </div>
        ))}
      </div>
      {!checked && (
        <button className="btn btn-bleu" onClick={check} disabled={!allAnswered}>تحقق</button>
      )}
    </div>
  );
}

/* -------- نشاط قراءة -------- */
function ReadingActivity({ activity, onComplete }) {
  const [showTrans, setShowTrans] = useState(false);
  const [answers, setAnswers] = useState(activity.questions.map(() => null));
  const [checked, setChecked] = useState(false);
  const allAnswered = answers.every((a) => a !== null);
  const check = () => {
    if (!allAnswered) return;
    setChecked(true);
    const correct = activity.questions.every((q, i) => answers[i] === q.correct);
    onComplete && onComplete(correct);
  };
  return (
    <div>
      <div className="reading-text">
        <div className="fr">{activity.textFr}</div>
        <button className="btn btn-sm btn-outline" style={{ marginTop: 10 }} onClick={() => setShowTrans(!showTrans)}>
          {showTrans ? 'إخفاء المساعدات' : 'إظهار المساعدات'}
        </button>
        {showTrans && (
          <div className="gloss-row">
            {(activity.glosses || []).map((g, i) => (
              <span key={i}><span className="fr" style={{ fontWeight: 800 }}>{g.fr}</span> = {g.ar}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 18 }}>
        {activity.questions.map((q, qi) => (
          <div key={qi} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>
              <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{q.qFr}</span>
              {q.qAr}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {q.options.map((o, oi) => {
                let cls = 'btn btn-sm ' + (checked ? (oi === q.correct ? 'btn-green' : answers[qi] === oi ? 'btn-red' : 'btn-outline') : 'btn-outline');
                return (
                  <button key={oi} className={cls} disabled={checked} onClick={() => {
                    const na = [...answers]; na[qi] = oi; setAnswers(na);
                  }}>
                    <span className="fr">{o}</span>
                  </button>
                );
              })}
            </div>
            {checked && q.explainAr && (
              <div className={`feedback-box ${answers[qi] === q.correct ? 'feedback-good' : 'feedback-bad'}`} style={{ marginTop: 8 }}>
                {answers[qi] === q.correct ? '✅ ' : '❌ '} {q.explainAr}
              </div>
            )}
          </div>
        ))}
      </div>
      {!checked && <button className="btn btn-bleu" onClick={check} disabled={!allAnswered}>تحقق</button>}
    </div>
  );
}

/* -------- نشاط تحدث -------- */
function SpeakingActivity({ activity, onComplete }) {
  const [transcript, setTranscript] = useState('');
  const [grade, setGrade] = useState(null);
  const [recording, setRecording] = useState(false);
  const supported = isRecognitionSupported();
  const [showIdea, setShowIdea] = useState(false);

  const startRecord = async () => {
    setRecording(true);
    const res = await recognizeSpeech('fr-FR');
    setRecording(false);
    if (res.ok) {
      setTranscript(res.text);
      const g = gradePronunciation(res.text, activity.expected);
      setGrade(g);
      onComplete && onComplete(g.score >= 60);
    } else {
      setTranscript(''); setGrade({ score: 0, error: res.error });
    }
  };

  const fullExpected = (activity.expected || '');

  return (
    <div>
      <div style={{ fontWeight: 700 }}>
        <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{activity.promptFr}</span>
        {activity.promptAr}
      </div>
      <SpeakButton text={fullExpected} label="🔊 استمع للنموذج" />
      <button className="btn btn-sm btn-outline" style={{ marginTop: 8, marginInlineStart: 8 }} onClick={() => setShowIdea(!showIdea)}>
        {showIdea ? 'إخفاء نموذج الإجابة' : 'عرض نموذج الإجابة'}
      </button>
      {showIdea && <div className="transcript"><span className="fr">{fullExpected}</span></div>}

      {supported ? (
        <div style={{ marginTop: 14 }}>
          <button className={`btn btn-red record-btn ${recording ? 'recording' : ''}`} onClick={startRecord} disabled={recording}>
            {recording ? '🎙️ جارٍ التسجيل...' : '🎙️ سجّل صوتك وحدّث بالفرنسية'}
          </button>
          {transcript && <div className="transcript" style={{ marginTop: 10 }}>🗣 قلت: <span className="fr">{transcript}</span></div>}
          {grade && grade.score !== undefined && (
            <div className={`feedback-box ${grade.score >= 60 ? 'feedback-good' : 'feedback-bad'}`} style={{ marginTop: 10 }}>
              <div>تقييم النطق: <strong>{grade.score}/100</strong></div>
              {grade.missing && grade.missing.length > 0 && (
                <div style={{ marginTop: 6 }}>💡 كلمات لم تظهر في تسجيلك: <span className="fr">{grade.missing.join(', ')}</span></div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="feedback-box feedback-info" style={{ marginTop: 14 }}>
          المتصفح لا يدعم التعرف على الكلام. بدلاً من ذلك، تدرّب بصوت عالٍ ثم قيّم نفسك ذاتياً قبل الانتقال.
        </div>
      )}
    </div>
  );
}

/* -------- نشاط كتابة حرة -------- */
function FreeWriting({ activity, onComplete }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const analyze = () => {
    const r = analyzeText(text, activity.essay ? undefined : (activity.context || ''));
    if (activity.essay) {
      const checks = essayCheck(text);
      const ok = Object.values(checks).filter(Boolean).length >= 2;
      r.score = Math.min(r.score, 50 + Object.values(checks).filter(Boolean).length * 12);
      r.essayChecks = checks;
      onComplete && onComplete(ok);
    } else {
      // كلمات مفتاحية
      const kws = activity.keywords || [];
      const missing = kws.filter((k) => !text.toLowerCase().includes(k.toLowerCase()));
      if (missing.length) {
        r.feedback.push({ type: 'hint', message: 'كلمات/عبارات مهمة لم تستعملها بعد: ' + missing.join(', ') });
      }
      const kwScore = Math.max(0, 30 - missing.length * 10);
      r.score = Math.min(100, r.score * 0.6 + kwScore);
      onComplete && onComplete(r.score >= 60);
    }
    setResult(r);
  };
  return (
    <div>
      <div style={{ fontWeight: 700 }}>
        <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{activity.promptFr}</span>
        {activity.promptAr}
      </div>
      <SpeakButton text={activity.expected} label="🔊 استمع للنموذج" />
      <textarea
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب إجابتك بالفرنسية هنا..."
        style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 12, border: '2px solid var(--line)', fontFamily: 'var(--font-fr)', fontSize: '1.05rem' }}
      />
      <div className="fr" style={{ color: 'var(--muted)', fontSize: '.85rem', marginTop: 4 }}>{text.trim() ? text.trim().split(/\s+/).length : 0} mots</div>
      {result && (
        <div style={{ marginTop: 14 }}>
          <div className="feedback-box feedback-info">
            <div>الدرجة: <strong>{result.score}/100</strong></div>
            {(result.feedback || []).map((f, i) => (
              <div key={i} style={{ marginTop: 6 }}>
                {f.type === 'error' ? '⛔' : f.type === 'warn' ? '⚠️' : f.type === 'hint' ? '💡' : '📌'} {f.message}
              </div>
            ))}
          </div>
          {result.essayChecks && (
            <div className="transcript" style={{ marginTop: 10 }}>
              {Object.entries(result.essayChecks).map(([k, v]) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginInlineEnd: 14 }}>
                  {v ? '✅' : '⬜'} {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <button className="btn btn-bleu" style={{ marginTop: 12 }} onClick={analyze} disabled={!text.trim()}>
        🔍 تصحيح وتغذية راجعة
      </button>
    </div>
  );
}

/* -------- نشاط ترتيب -------- */
function OrderingActivity({ activity, onComplete }) {
  const [order, setOrder] = useState([]);
  const check = () => {
    const ok = order.length === activity.correctOrder.length && order.every((s, i) => s === activity.correctOrder[i]);
    onComplete && onComplete(ok);
    alert(ok ? '✅ ترتيب صحيح! أحسنت.' : '❌ الترتيب غير صحيح، حاول مرة أخرى.');
  };
  return (
    <div>
      <div style={{ fontWeight: 700 }}>{activity.titleAr2 || activity.titleAr}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        {order.map((s, i) => (
          <span key={i} className="badge-chip" onClick={() => setOrder(order.filter((_, j) => j !== i))}>{i + 1}. {s} ✕</span>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <strong>الجمل (انقر بالترتيب الصحيح):</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {activity.correctOrder.map((s, i) => (
            !order.includes(s) && (
              <button key={i} className="btn btn-sm btn-outline" onClick={() => setOrder([...order, s])}>
                <span className="fr">{s}</span>
              </button>
            )
          ))}
        </div>
      </div>
      <button className="btn btn-bleu" style={{ marginTop: 12 }} onClick={check} disabled={order.length !== activity.correctOrder.length}>
        تحقق
      </button>
    </div>
  );
}

/* -------- المهمة الختامية -------- */
export function TaskFinale({ task, onComplete }) {
  if (task.type === 'writing') {
    return (
      <div>
        <div style={{ fontWeight: 700 }}>
          <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{task.promptFr}</span>
          {task.promptAr}
        </div>
        <SpeakButton text={task.expected} label="🔊 استمع للنموذج" />
        <textarea
          rows={6}
          placeholder="اكتب المهمة بالفرنسية هنا..."
          style={{ width: '100%', marginTop: 10, padding: 14, borderRadius: 12, border: '2px solid var(--line)', fontFamily: 'var(--font-fr)', fontSize: '1.05rem' }}
        />
        <div className="feedback-box feedback-info" style={{ marginTop: 12 }}>
          <strong>💡 نصائح:</strong>
          <ul style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
            {(task.tips || []).map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div style={{ fontWeight: 700 }}>
        <span className="fr" style={{ color: 'var(--muted)', display: 'block', fontSize: '.9rem' }}>{task.promptFr}</span>
        {task.promptAr}
      </div>
      <SpeakButton text={task.expected} label="🔊 استمع للنموذج" />
      <div className="feedback-box feedback-info" style={{ marginTop: 12 }}>
        <strong>💡 نصائح:</strong>
        <ul style={{ margin: '8px 0 0', paddingInlineStart: 20 }}>
          {(task.tips || []).map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

/* المدخل الرئيسي */
export default function ActivityRenderer({ activity, onComplete }) {
  switch (activity.type) {
    case 'vocab': return <VocabActivity vocab={activity.vocab || []} />;
    case 'mcq': return <MCQ q={activity} onComplete={onComplete} />;
    case 'blank': return <BlankActivity items={activity.items} onComplete={onComplete} />;
    case 'grammar': return <GrammarActivity activity={activity} />;
    case 'listening': return <ListeningActivity activity={activity} onComplete={onComplete} />;
    case 'reading': return <ReadingActivity activity={activity} onComplete={onComplete} />;
    case 'speaking': return <SpeakingActivity activity={activity} onComplete={onComplete} />;
    case 'writing_free': return <FreeWriting activity={activity} onComplete={onComplete} />;
    case 'ordering': return <OrderingActivity activity={activity} onComplete={onComplete} />;
    default: return <div>نشاط غير معروف.</div>;
  }
}
