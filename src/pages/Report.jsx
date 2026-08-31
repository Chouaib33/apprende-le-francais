import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import LEVELS from '../data/index.js';
import { levelProgress, totalXp, totalTimeMin } from '../lib/progress.js';
import { srsStats } from '../lib/srs.js';

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildText(user) {
  const p = user.progress;
  const srs = srsStats(p.srs || {});
  const date = new Date().toLocaleDateString('fr-FR');
  const lines = [];
  lines.push('══════════════════════════════════════');
  lines.push('RAPPORT DE PROGRÈS — تقرير التقدم');
  lines.push('══════════════════════════════════════');
  lines.push('');
  lines.push(`Étudiant / الطالب : ${user.name}`);
  lines.push(`Email / البريد : ${user.email}`);
  lines.push(`Date : ${date}`);
  lines.push('');
  lines.push(`Niveau / المستوى :`);
  LEVELS.forEach((l) => {
    lines.push(`  ${l.id} — ${levelProgress(p, l)}%`);
  });
  lines.push('');
  lines.push(`XP : ${totalXp(p)}`);
  lines.push(`Temps d'apprentissage / وقت التعلم : ${totalTimeMin(p)} min`);
  lines.push(`Leçons terminées / الدروس المكتملة : ${Object.keys(p.lessonsCompleted || {}).length}`);
  lines.push(`Mots SRS / الكلمات : ${srs.total} (matures: ${srs.mature})`);
  lines.push('');
  lines.push('Tests de niveau / اختبارات المستويات :');
  LEVELS.forEach((l) => {
    const t = p.levelTests?.[l.id];
    lines.push(`  ${l.id}: ${t ? t.score + '% (' + (t.passed ? 'réussi ✅' : 'pas encore ❌') + ')' : 'non passé'}`);
  });
  lines.push('');
  lines.push('— Apprendre le français —');
  return lines.join('\n');
}

export default function Report() {
  const { user } = useApp();
  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem' }}>📄</div>
        <h2>سجّل دخولك لتصدير تقرير التقدم</h2>
        <Link to="/auth" className="btn btn-bleu">تسجيل الدخول</Link>
      </div>
    );
  }

  const text = buildText(user);

  const doDownload = (period) => {
    download(`rapport-progres-${period}.txt`, text);
  };

  return (
    <div>
      <div className="section-title">📄 تصدير تقرير التقدم</div>
      <div className="grid grid-2">
        <div className="card">
          <h3>التقرير الأسبوعي / الشهري</h3>
          <p className="subtitle">صدّر تقريرك كملف نصي بسيط يمكن مشاركته أو حفظه.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-bleu" onClick={() => doDownload('hebdo')}>📅 الأسبوعي</button>
            <button className="btn btn-outline" onClick={() => doDownload('mensuel')}>📆 الشهري</button>
          </div>
        </div>
        <div className="report-box">
          <pre dir="ltr" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '.82rem', margin: 0 }}>
            {text}
          </pre>
        </div>
      </div>
    </div>
  );
}
