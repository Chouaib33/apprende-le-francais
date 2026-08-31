// ====== قاموس مصغّر مدمج ======
// تجميع كل المفردات من جميع المستويات مع البحث.

import LEVELS from './index.js';

// نجمع كل الكلمات من كل المستويات
const collected = [];
LEVELS.forEach((level) => {
  level.units.forEach((unit) => {
    unit.lessons.forEach((lesson) => {
      (lesson.vocab || []).forEach((v) => {
        collected.push({
          fr: v.fr,
          ar: v.ar,
          pron: v.pron || '',
          example: v.example || '',
          level: level.id,
          unit: unit.titleAr,
        });
      });
    });
  });
});

// إضافات قاموسية إضافية شائعة غير واردة في الدروس
const extra = [
  { fr: 'la langue', ar: 'اللغة', pron: 'لا لانج', example: 'la langue française' },
  { fr: 'les études', ar: 'الدراسة (الجامعية)', pron: 'ليز زيتيد', example: 'les études supérieures' },
  { fr: 'le diplôme', ar: 'الشهادة', pron: 'لو ديبلوم', example: 'un diplôme de licence' },
  { fr: 'la licence', ar: 'الإجازة / الليسانس', pron: 'لا ليسانس', example: 'une licence en droit' },
  { fr: 'le master', ar: 'الماجستير', pron: 'لو ماستر', example: 'un master en informatique' },
  { fr: 'la thèse', ar: 'أطروحة الدكتوراه', pron: 'لا تيز', example: 'préparer une thèse' },
  { fr: 'le cours', ar: 'المحاضرة / الدرس', pron: 'لو كور', example: 'suivre un cours' },
  { fr: 'le professeur', ar: 'الأستاذ', pron: 'لو بروفيسور', example: 'le professeur de français' },
  { fr: 'l\'examen', ar: 'الامتحان', pron: 'لاغزامان', example: 'passer un examen' },
  { fr: 'la bibliothèque', ar: 'المكتبة', pron: 'لا بيبليوتيك', example: 'travailler à la bibliothèque' },
  { fr: 'réussir', ar: 'ينجح', pron: 'ريوسير', example: 'réussir à l\'examen' },
  { fr: 'échouer', ar: 'يرسب / يفشل', pron: 'إيشويه', example: 'échouer au test' },
  { fr: 'comprendre', ar: 'يفهم', pron: 'كومبراند', example: 'Je ne comprends pas.' },
  { fr: 'apprendre', ar: 'يتعلم', pron: 'أبراند', example: 'apprendre le français' },
  { fr: 'aujourd\'hui', ar: 'اليوم', pron: 'أوجوردوي', example: "aujourd'hui" },
  { fr: 'maintenant', ar: 'الآن', pron: 'مانتنان', example: 'Je travaille maintenant.' },
  { fr: 'souvent', ar: 'غالباً', pron: 'سوفان', example: 'Je lis souvent.' },
  { fr: 'la recherche', ar: 'البحث', pron: 'لا ريشيرش', example: 'faire de la recherche' },
  { fr: 'la science', ar: 'العلم', pron: 'لا سينس', example: 'les sciences' },
  { fr: 'important', ar: 'مهم', pron: 'آنبورتون', example: 'un point important' },
];

export const DICTIONARY = [...collected, ...extra];

export function searchDictionary(query, levelId) {
  const q = query.trim().toLowerCase();
  let results = DICTIONARY;
  if (levelId) results = results.filter((e) => e.level === levelId);
  if (!q) return results;
  return results.filter(
    (e) => e.fr.toLowerCase().includes(q) || e.ar.includes(q)
  );
}
