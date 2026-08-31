import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { buildSRSQueue, answerCard, srsStats } from '../lib/srs.js';
import { speak } from '../lib/speech.js';
import LEVELS from '../data/index.js';

export default function SRS() {
  const { user, notify, updateProgress } = useApp();
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [reveal, setReveal] = useState(false);

  const allVocab = useMemo(() => {
    const v = [];
    LEVELS.forEach((l) =>
      l.units.forEach((u) =>
        u.lessons.forEach((les) => (les.vocab || []).forEach((x) => v.push({ ...x, level: l.id })))
      )
    );
    return v;
  }, []);

  const vocabForFilter = useMemo(
    () => (levelFilter === 'ALL' ? allVocab : allVocab.filter((v) => v.level === levelFilter)),
    [allVocab, levelFilter]
  );

  const queue = useMemo(() => (user ? buildSRSQueue(user.progress, vocabForFilter, 15) : null), [user, vocabForFilter]);
  const [session, setSession] = useState([]);
  const [pos, setPos] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);
  const filterRef = useRef(null);

  // نبني الجلسة فقط عند تغيير الفلتر (لا عند تحديث التقدم أثناء الجلسة)
  useEffect(() => {
    if (queue && levelFilter !== filterRef.current) {
      filterRef.current = levelFilter;
      const list = [...queue.due, ...queue.new];
      setSession(list);
      setPos(0);
      setReveal(false);
      setSessionResults([]);
    }
  }, [queue, levelFilter]);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem' }}>🧠</div>
        <h2>سجّل دخولك لبدء جلسة التكرار المتباعد</h2>
        <Link to="/auth" className="btn btn-bleu">تسجيل الدخول</Link>
      </div>
    );
  }

  const stats = srsStats(user.progress.srs || {});
  const card = session[pos];

  const grade = (quality) => {
    const known = quality >= 3;
    const cur = user.progress.srs || {};
    const newSrs = answerCard({ ...cur }, card.fr, quality, known);
    updateProgress({ srs: newSrs });
    setSessionResults((r) => [...r, { fr: card.fr, known }]);
    setReveal(false);
    if (pos + 1 < session.length) setPos(pos + 1);
    else notify('🎉 انتهت الجلسة! إجاباتك محفوظة.');
  };

  const speakCard = () => {
    if (card) speak(card.fr + '. ' + (card.example || ''), '', 0.9);
  };

  return (
    <div>
      <div className="section-title">🧠 التكرار المتباعد (SRS)</div>
      <p className="subtitle">
        بطاقات ذكية على غرار Anki تعرض الكلمات التي تحتاج مراجعتها في الوقت المناسب.
        الكلمات التي تنسها ستظهر لك مجدداً بشكل أكثر تكراراً.
      </p>

      <div className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card stat-card"><div className="num">{stats.total}</div><div className="label">إجمالي البطاقات</div></div>
        <div className="card stat-card"><div className="num">{stats.mature}</div><div className="label">مكتسبة (متقنة)</div></div>
        <div className="card stat-card"><div className="num">{stats.dueToday}</div><div className="label">مستحقة اليوم</div></div>
      </div>

      <div className="field">
        <label>تصفية حسب المستوى</label>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
          <option value="ALL">كل المستويات</option>
          {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.id} — {l.titleAr}</option>)}
        </select>
      </div>

      {session.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h3>لا توجد بطاقات للاستعراض الآن!</h3>
          <p className="subtitle">أكمل الدروس لتضاف المفردات إلى مجموعة بطاقاتك، ثم عد هنا للمراجعة.</p>
        </div>
      ) : !card ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <h3>🎉 انتهت جلسة المراجعة!</h3>
          <p className="subtitle">راجعت {sessionResults.length} بطاقة.</p>
          <button className="btn btn-bleu" onClick={() => setPos(0)}>جولة جديدة</button>
        </div>
      ) : (
        <div className="card srs-card">
          <div className="level-tag" style={{ marginBottom: 12 }}>{card.level}</div>
          <div className="fr-big">{card.fr}</div>
          <button className="speak-btn" onClick={speakCard}>🔊 استمع</button>
          <div style={{ color: 'var(--muted)', marginTop: 4 }}>الجلسة: {pos + 1} / {session.length}</div>

          {!reveal ? (
            <button className="btn btn-bleu" onClick={() => setReveal(true)} style={{ marginTop: 20 }}>🔍 إظهار المعنى</button>
          ) : (
            <>
              <div className="srs-reveal">
                <div className="ar" style={{ fontWeight: 800 }}>{card.ar}</div>
                {card.pron && <div className="pron">🗣 {card.pron}</div>}
                {card.example && <div className="fr" style={{ color: 'var(--bleu)', marginTop: 8 }}>{card.example}</div>}
              </div>
              <div className="srs-buttons">
                <button className="btn btn-red" onClick={() => grade(1)}>😟 نسيتها</button>
                <button className="btn btn-outline" onClick={() => grade(3)}>🤔 صعبة</button>
                <button className="btn btn-green" onClick={() => grade(5)}>😄 أعرفها</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
