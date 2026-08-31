import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { speak } from '../lib/speech.js';
import LEVELS from '../data/index.js';

// ====== شريك المحادثة: يحاكي مواقف حقيقية بالفرنسية ويصحح الأخطاء ======
// هذا الإصدار يعمل بدون مفتاح API عبر منطق مبني على السيناريوهات.
// يمكن استبداله بدمج Claude API (انظر الملاحظة أسفل الكود).

const SCENARIOS = [
  {
    id: 'cafe',
    title: '☕ في المقهى',
    fr: 'Au café',
    level: 'A1',
    bot: "Bonjour ! Bienvenue au café. Qu'est-ce que je vous sers ?",
    ar: 'مرحباً! أهلاً بك في المقهى. ماذا تطلب؟',
    vocab: ['café', 'thé', 'jus', 'addition', "s'il vous plaît"],
  },
  {
    id: 'hotel',
    title: '🏨 حجز فندق',
    fr: 'Réserver un hôtel',
    level: 'A2',
    bot: "Bonjour, hôtel du centre. En quoi puis-je vous aider ?",
    ar: 'مرحباً، فندق المركز. كيف أساعدك؟',
    vocab: ['chambre', 'nuit', 'prix', 'réserver', 'personnes'],
  },
  {
    id: 'opinion',
    title: '💬 التعبير عن الرأي',
    fr: "Exprimer son avis",
    level: 'B1',
    bot: "Bonjour ! Quel est votre avis sur les réseaux sociaux ?",
    ar: 'مرحباً! ما رأيك في شبكات التواصل الاجتماعي؟',
    vocab: ['avis', 'pense', "d'accord", 'parce que', 'cependant'],
  },
  {
    id: 'academic',
    title: '🎓 نقاش جامعي',
    fr: 'Débat universitaire',
    level: 'B2',
    bot: "Bonjour. Nous parlons aujourd'hui du e-learning à l'université. Qu'en pensez-vous ?",
    ar: 'مرحباً. نتحدث اليوم عن التعليم عن بُعد في الجامعة. ما رأيك؟',
    vocab: ['soutiens', 'argument', 'd\'une part', 'en conclusion', 'cependant'],
  },
];

// كشف أخطاء شائعة وإرجاع تصحيح
function detectError(text) {
  const t = ' ' + text.toLowerCase() + ' ';
  const rules = [
    { re: /\bje suis\s+(\d+)\s+ans\b/, fix: 'Pour l\'âge, utilise «avoir» : «J\'ai … ans» (et non «je suis»).' },
    { re: /\b(je|tu|il|elle|on|nous|vous|ils|elles)\s+alle\b/, fix: 'Attention au verbe «aller» : je vais, tu vas, il va.' },
    { re: /\bje\s+ne\s+pas\s+aim\b/, fix: 'La négation : «Je n\'aime pas» (ne/n\' + verbe + pas).' },
    { re: /\b(ai|as|a|avons|avez|ont)\s+(mang|parl|aim)\b/, fix: 'Après l\'auxiliaire, utilise le participe passé : «j\'ai mangé».' },
  ];
  for (const r of rules) {
    if (r.re.test(t)) return r.fix;
  }
  return null;
}

export default function Chat() {
  const { user, notify } = useApp();
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [lang, setLang] = useState('fr'); // 'fr' لإجابات فرنسية، 'mixed' لمساعدات عربية
  const bodyRef = useRef(null);

  useEffect(() => {
    // رسالة الترحيب حسب المستوى
    setMessages([{ from: 'bot', fr: scenario.bot, ar: scenario.ar }]);
  }, [scenario]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: '3rem' }}>💬</div>
        <h2>سجّل دخولك للتدرب مع شريك المحادثة</h2>
        <p className="subtitle">احجز موقعاً، عبّر عن رأيك، ناقش موضوعاً جامعياً — بالفرنسية الحقيقية.</p>
      </div>
    );
  }

  const push = (from, text) => {
    setMessages((m) => [...m, { from, fr: text }]);
  };

  const respond = (userText) => {
    const t = userText.trim();
    if (!t) return;

    // التصحيح إن وُجد خطأ
    const correction = detectError(t);
    let replyFr, replyAr;

    if (correction) {
      replyFr = `Petite correction : ${correction}. Vous pouvez reformuler ?`;
      replyAr = 'تصحيح بسيط: ' + correction + ' هل يمكنك إعادة الصياغة؟';
    } else {
      // ردود بسيطة مبنيّة على الكلمات المفتاحية
      const has = (...kws) => kws.some((k) => t.toLowerCase().includes(k.toLowerCase()));
      if (has('oui', 'd\'accord', 'bien sûr')) {
        replyFr = "Très bien ! Continuez, je vous écoute.";
        replyAr = 'ممتاز! تابع، أنا أستمع إليك.';
      } else if (has('non', 'pas')) {
        replyFr = "Intéressant. Et pourquoi pas ?";
        replyAr = 'مثير للاهتمام. ولم لا؟';
      } else if (has('merci')) {
        replyFr = "Avec plaisir ! Y a-t-il autre chose ?";
        replyAr = 'بكل سرور! هل هناك شيء آخر؟';
      } else if (has('combien', 'prix')) {
        replyFr = "Le prix dépend de la saison. Que cherchez-vous exactement ?";
        replyAr = 'السعر يعتمد على الموسم. ما الذي تبحث عنه بالضبط؟';
      } else if (has('je pense', 'avis', 'soutiens')) {
        replyFr = "Excellent ! Pouvez-vous développer votre argument avec un exemple ?";
        replyAr = 'ممتاز! هل يمكنك تطوير حجتك مع مثال؟';
      } else {
        replyFr = "D'accord, très bien. Continuez votre phrase, s'il vous plaît.";
        replyAr = 'حسناً. أكمِل جملتك من فضلك.';
      }
    }

    push('user', userText);
    // تأخير طفيف لمحاكاة التفكير
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', fr: replyFr, ar: replyAr }]);
      speak(replyFr, '', 1);
    }, 400);
  };

  const handleListen = () => {
    const rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!rec) { notify('المتصفح لا يدعم التعرف على الكلام.', 'warn'); return; }
    const r = new rec();
    r.lang = 'fr-FR';
    r.interimResults = false;
    setListening(true);
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      respond(text);
      setListening(false);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
  };

  return (
    <div>
      <div className="section-title">💬 شريك المحادثة (Chatbot)</div>
      <p className="subtitle">
        تدرّب على مواقف حقيقية بالفرنسية. اكتب أو تكلّم، وسيقوم شريكك بالرد وتصحيح أخطائك أثناء الحوار.
      </p>

      <div className="chat-tips">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className="chat-tip"
            style={s.id === scenario.id ? { background: 'var(--bleu)', color: '#fff' } : {}}
            onClick={() => { setScenario(s); }}
          >
            {s.title} <span className="fr" style={{ opacity: .8 }}>({s.level})</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '12px 0' }}>
        <span style={{ fontWeight: 700 }}>السيناريو:</span>
        <span>{scenario.title}</span>
        <span className="fr" style={{ color: 'var(--muted)' }}>— {scenario.fr}</span>
      </div>

      <div className="chat-window">
        <div className="chat-head">
          🤖 شريكك
          <span style={{ opacity: .8, fontWeight: 500, fontSize: '.85rem' }}>— صحح أخطاءك أثناء الحوار</span>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              <span className="fr">{m.fr}</span>
              {lang === 'mixed' && m.ar && <div style={{ opacity: .8, marginTop: 6 }}>{m.ar}</div>}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { respond(input); setInput(''); } }}
            placeholder="اكتب بالفرنسية هنا..."
            style={{ border: '2px solid var(--line)', borderRadius: 10, padding: '10px 14px' }}
          />
          <button className="btn btn-bleu" onClick={() => { respond(input); setInput(''); }}>إرسال</button>
          <button className={`btn btn-red record-btn ${listening ? 'recording' : ''}`} onClick={handleListen}>
            🎙️
          </button>
        </div>
      </div>

      <div className="chat-tips" style={{ marginTop: 12 }}>
        <button className="chat-tip" onClick={() => setLang(lang === 'fr' ? 'mixed' : 'fr')}>
          {lang === 'fr' ? '🌐 إظهار المساعدات العربية' : '🇫🇷 وضع الغمر: إخفاء العربية'}
        </button>
        <button className="chat-tip" onClick={() => { setMessages([{ from: 'bot', fr: scenario.bot, ar: scenario.ar }]); }}>
          🔄 إعادة بدء الحوار
        </button>
      </div>

      <div className="feedback-box feedback-info" style={{ marginTop: 14 }}>
        <strong>💡 حاول استعمال هذه المفردات:</strong>{' '}
        <span className="fr">{scenario.vocab.join('، ')}</span>
      </div>

      <details style={{ marginTop: 16 }} className="card">
        <summary style={{ fontWeight: 700, cursor: 'pointer' }}>⚙️ ملاحظة تقنية حول دمج Claude API</summary>
        <p className="subtitle" style={{ marginTop: 8 }}>
          يعمل شريك المحادثة الحالي عبر منطق مبنيّ على السيناريوهات (بدون مفتاح API).
          لدمج نموذج Claude الحقيقي (ميزة متقدمة اختيارية)، أضف مفتاح API واستبدل دالة <code className="fr">respond()</code>
          بطلب <code className="fr">POST</code> إلى واجهة Anthropic <code className="fr">/v1/messages</code>، مع تمرير
          سجلّ الحوار لغةً موجهةً بالفرنسية وتعليمات تصحيح الأخطاء. تُخزَّن أسرارك على الخادم فقط ولا تُكشف للمتصفح.
        </p>
      </details>
    </div>
  );
}
