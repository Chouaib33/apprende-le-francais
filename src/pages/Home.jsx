import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import LEVELS from '../data/index.js';
import { levelProgress } from '../lib/progress.js';

export default function Home() {
  const { user } = useApp();

  return (
    <div>
      <section className="hero">
        <h1>🎓 منصة متكاملة لتعليم الفرنسية للناطقين بالعربية</h1>
        <p>
          من الصفر حتى المستوى الجامعي المتقدم، وفق الإطار الأوروبي المرجعي (CECRL).
          تعلّم المهارات الأربع بمقاربة تواصلية ومهام واقعية، مع تتبّع تقدّمك وتكرار متباعد ذكي.
        </p>
        <div className="hero-actions">
          <Link to="/levels" className="btn btn-primary">🚀 ابدأ التعلم الآن</Link>
          {!user && <Link to="/auth" className="btn btn-ghost">إنشاء حساب مجاني</Link>}
          <Link to="/chat" className="btn btn-ghost">💬 جرّب شريك المحادثة</Link>
        </div>
      </section>

      <div className="section-title">مساراتك الأربعة</div>
      <div className="grid grid-2">
        {LEVELS.map((lv) => {
          const prog = user ? levelProgress(user.progress, lv) : 0;
          return (
            <Link to={`/level/${lv.id}`} key={lv.id} className="card level-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="top">
                <div className="level-badge" style={{ background: lv.color }}>{lv.id}</div>
                <span className="level-tag">الغمر اللغوي {lv.immersion}%</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{lv.titleAr}</div>
              <div className="fr" style={{ color: 'var(--muted)', fontSize: '.9rem' }}>{lv.titleFr}</div>
              <p className="subtitle" style={{ fontSize: '.9rem' }}>{lv.subtitleAr}</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: prog + '%', background: lv.color }} /></div>
              <div style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{prog}% مكتمل</div>
            </Link>
          );
        })}
      </div>

      <div className="section-title">✨ ماذا ستحصل عليه؟</div>
      <div className="grid grid-3">
        {[
          { icon: '🗣️', t: 'المهارات الأربع', d: 'استماع، قراءة، تحدّث، وكتابة في كل وحدة.' },
          { icon: '🧠', t: 'تكرار متباعد SRS', d: 'بطاقات ذكية على غرار Anki تحفظ ما تنساه.' },
          { icon: '🎮', t: 'تعلّم ممتع', d: 'نقاط، شارات، وسلاسل أيام متتالية.' },
          { icon: '🤖', t: 'شريك محادثة', d: 'تدرّب على مواقف حقيقية بالفرنسية.' },
          { icon: '📊', t: 'لوحة تحكم', d: 'تقدمك، نقاط ضعفك، ومفرداتك المكتسبة.' },
          { icon: '🎯', t: 'مهام واقعية', d: 'احجز فندقاً، اكتب بريداً، قدّم عرضاً جامعياً.' },
        ].map((f, i) => (
          <div key={i} className="card">
            <div style={{ fontSize: '1.8rem' }}>{f.icon}</div>
            <div style={{ fontWeight: 800, marginTop: 6 }}>{f.t}</div>
            <div className="subtitle" style={{ fontSize: '.9rem' }}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
