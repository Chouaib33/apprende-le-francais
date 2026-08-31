// ====== التغذية الراجعة الفورية للكتابة: كشف الأخطاء وتقديم شرح للقاعدة ======
// مدخل تحريري: تحليل الإجابة الحرة للمهام الكتابية وتوليد ملاحظات مفصّلة.

// أنماط أخطاء شائعة (قوالب مع شرح)
const PATTERNS = [
  {
    id: 'age_etre',
    regex: /\bje suis\s+(\d+)\s+ans\b/i,
    rule: 'للتعبير عن العمر نستعمل الفعل avoir وليس être: «J\'ai 20 ans» وليس «Je suis 20 ans».',
  },
  {
    id: 'negation_order',
    regex: /\bje\s+(n'?e?)?\s*(ne|pas)\b/,
    rule: 'النفي الصحيح: ne + الفعل + pas. مثال: «Je ne parle pas» (لا تضع pas قبل الفعل).',
  },
  {
    id: 'aller_present',
    regex: /\bje\s+alle\b/i,
    rule: 'تصريف aller مع je هو «je vais» وليس «je alle».',
  },
  {
    id: 'mangé_infinitive',
    regex: /\b(ai|as|a|avons|avez|ont)\s+(mange|parle|aim)\b/i,
    rule: 'بعد الفعل المساعد نستعمل التصريف الثالث: «j\'ai mangé» وليس «j\'ai mange».',
  },
  {
    id: 'double_neg',
    regex: /\bne\s+[a-zà-ÿ]+\s+pas\s+pas\b/i,
    rule: 'لا تُكرر pas في النفي: «je ne parle pas» كافية.',
  },
];

const REQUIRED_KEYWORDS = {
  presentation: ['m\'appelle', 'suis', 'habite', 'ans'],
  famille: ['père', 'mère', 'frère', 'sœur'],
  voyage: ['voyage', 'vais', 'france', 'partir'],
};

// تحليل نص حر وإرجاع تقرير مفصّل
export function analyzeText(text, context) {
  const trimmed = (text || '').trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const result = {
    ok: words.length > 0,
    wordCount: words.length,
    errors: [],
    score: 100,
    feedback: [],
  };

  if (!result.ok) {
    result.score = 0;
    result.feedback.push({ type: 'info', message: 'اكتب نصاً أولاً ثم أرسله للتصحيح.' });
    return result;
  }

  // فحص القوالب
  PATTERNS.forEach((p) => {
    if (p.regex.test(trimmed)) {
      result.errors.push(p.rule);
      result.feedback.push({ type: 'error', message: p.rule });
    }
  });

  // فحص علامات الترقيم
  if (!/[.!?…]/.test(trimmed)) {
    result.feedback.push({
      type: 'warn',
      message: 'يبدو أن النص يخلو من علامات الترقيم الختامية (. أو ! أو ?). أضفها لتحسين الوضوح.',
    });
  }

  // هل يبدأ بحرف كبير؟
  if (/^[a-zà-ÿ]/.test(trimmed)) {
    result.feedback.push({
      type: 'warn',
      message: 'في الفرنسية، تُكتب الجملة بحرف كبير في البداية. ابدأ بـ حرف كبير.',
    });
  }

  // التحقق من الكلمات المفتاحية حسب السياق
  if (context && REQUIRED_KEYWORDS[context]) {
    const missing = REQUIRED_KEYWORDS[context].filter((k) => !trimmed.toLowerCase().includes(k));
    if (missing.length) {
      result.feedback.push({
        type: 'hint',
        message: `حاول استعمال هذه الكلمات/العبارات في النص: ${missing.join(', ')}.`,
      });
    }
  }

  // حساب الدرجة
  let deductions = result.errors.length * 12;
  if (/[.!?]/.test(trimmed)) deductions -= 3; // مكافأة لعلامات الترقيم
  if (/^[A-ZÀÂÉÈÊËÎÏÔÖÛÜÇ]/.test(trimmed)) deductions -= 2;
  result.score = Math.max(20, Math.min(100, 100 - deductions));

  return result;
}

// فحص سريع للعناصر المشتركة للمقال الحجاجي
export function essayCheck(text) {
  const t = (text || '').toLowerCase();
  const checks = {
    'مقدمة': /\b(introduction|d'abord|de nos jours|aujourd'hui|dans ce|il s'agit|ce texte)\b/.test(t),
    'آلية ربط': /\b(d'abord|ensuite|enfin|en effet|par ailleurs|de plus|toutefois|cependant|d'une part|d'autre part)\b/.test(t),
    'حجاج': /\b(parce que|car|en effet|d'ailleurs|par exemple)\b/.test(t),
    'خاتمة': /\b(en conclusion|pour conclure|finalement|en résumé)\b/.test(t),
  };
  return checks;
}
