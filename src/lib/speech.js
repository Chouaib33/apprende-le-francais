// ====== أدوات الصوت: نطق (TTS) وتعرّف على الكلام (STT) مع تقييم النطق ======
// يستخدم Web Speech API (متاح في المتصفحات الحديثة). التقييم تقديري/تقريبي.

let voices = [];
function loadVoices() {
  voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// اختيار صوت فرنسي (يُفضّل صوت لهجة معيّنة إذا طُلبت)
export function pickFrenchVoice(accent) {
  const want = accent || '';
  if (voices.length === 0) loadVoices();
  // تفضيل الصوت المطابق للهجة (فرنسا، بلجيكا، كيبيك، المغرب...)
  let exact = voices.find(
    (v) => v.lang && v.lang.startsWith('fr') && want && v.lang.toLowerCase().includes(langHint(want))
  );
  if (!exact) exact = voices.find((v) => v.lang && v.lang.startsWith('fr-FR'));
  if (!exact) exact = voices.find((v) => v.lang && v.lang.startsWith('fr'));
  return exact || null;
}

function langHint(accent) {
  const a = accent.toLowerCase();
  if (a.includes('belg')) return 'fr-be';
  if (a.includes('qué') || a.includes('quebec')) return 'fr-ca';
  if (a.includes('maroc') || a.includes('algér') || a.includes('tunis')) return 'fr';
  return 'fr-fr';
}

// نطق نص فرنسي بصوت عالٍ
export function speak(text, accent, rate = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickFrenchVoice(accent);
  if (voice) utter.voice = voice;
  utter.lang = 'fr-FR';
  utter.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
  return true;
}

// هل يدعم المتصفح التعرف على الكلام؟
export function isRecognitionSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// تسجيل صوت المستخدم وإرجاع النص المُتعرَّف عليه (وعد)
export function recognizeSpeech(lang = 'fr-FR') {
  return new Promise((resolve) => {
    if (!isRecognitionSupported()) {
      return resolve({ ok: false, text: '', error: 'المتصفح لا يدعم التعرف على الكلام.' });
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      resolve({ ok: true, text });
    };
    rec.onerror = (e) => {
      resolve({ ok: false, text: '', error: 'خطأ في التسجيل: ' + (e.error || 'غير معروف') });
    };
    rec.onend = () => {
      // في حال لم يُصدر نتيجة نعطي نتيجة فارغة
    };
    try {
      rec.start();
    } catch {
      resolve({ ok: false, text: '', error: 'تعذر بدء التسجيل.' });
    }
    // مهلة أمان
    setTimeout(() => {
      try {
        rec.stop();
      } catch {}
    }, 10000);
  });
}

// تقييم النطق: مقارنة النص المُتحدث به بالنص المتوقع
// يعيد درجة تقريبية (0-100) وملاحظات على الكلمات المفقودة
export function gradePronunciation(spoken, expected) {
  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[’']/g, ' ')
      .replace(/[^a-zàâäéèêëîïôöùûüç\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const sp = normalize(spoken).split(' ').filter(Boolean);
  const ex = normalize(expected).split(' ').filter(Boolean);
  if (ex.length === 0) return { score: 0, missing: [], recognized: [] };
  let matched = 0;
  const missing = [];
  const recognized = [];
  ex.forEach((w) => {
    if (sp.includes(w)) {
      matched++;
      recognized.push(w);
    } else {
      missing.push(w);
    }
  });
  const score = Math.round((matched / ex.length) * 100);
  return { score, missing, recognized };
}

// كلمة تُصاغ بحروف عربية تقريبية للنطق
export function phoneticGuide(fr) {
  const map = {
    bonjour: 'بونجور',
    merci: 'ميرسي',
    's\'il vous plaît': 'سيل فو بلي',
    'au revoir': 'أو روفوار',
    salut: 'سالو',
    bonsoir: 'بونسوار',
  };
  if (map[fr.toLowerCase()]) return map[fr.toLowerCase()];
  return '';
}
