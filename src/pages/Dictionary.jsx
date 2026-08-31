import { useState, useMemo } from 'react';
import { searchDictionary } from '../data/dictionary.js';
import { speak } from '../lib/speech.js';
import LEVELS from '../data/index.js';

export default function Dictionary() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const results = useMemo(
    () => searchDictionary(query, level === 'ALL' ? null : level),
    [query, level]
  );

  return (
    <div>
      <div className="section-title">📖 القاموس المصغّر المدمج</div>
      <p className="subtitle">ابحث عن الكلمات والقواعد — عربي أو فرنسي. انقر على الكلمة لسماع نطقها.</p>

      <div className="card">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث... (مثال: bonjour، جامعة)"
            style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 12, border: '2px solid var(--line)' }}
          />
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, border: '2px solid var(--line)' }}>
            <option value="ALL">كل المستويات</option>
            {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.id}</option>)}
          </select>
        </div>
        <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: '.85rem' }}>{results.length} نتيجة</div>
      </div>

      <div className="vocab-card" style={{ marginTop: 18 }}>
        {results.map((r, i) => (
          <div key={i} className="vocab-item" onClick={() => speak(r.fr)}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="fr">{r.fr}</span>
              <span className="level-tag">{r.level}</span>
            </div>
            <div className="ar">{r.ar}</div>
            {r.pron && <div className="pron">🗣 {r.pron}</div>}
            {r.example && <div className="fr" style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{r.example}</div>}
          </div>
        ))}
        {results.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 30 }}>لا توجد نتائج مطابقة.</div>
        )}
      </div>
    </div>
  );
}
