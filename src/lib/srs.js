// ====== نظام التكرار المتباعد (Spaced Repetition System - SRS) ======
// نموذج على غرار Anki: صناديق ليتنر (Leitner boxes) مع فترات متزايدة.
// box 0 (جديد) → 1 (1 يوم) → 2 (3 أيام) → 3 (7 أيام) → 4 (14 يوماً) → 5 (30 يوماً).

export const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

const DAY = 24 * 60 * 60 * 1000;

// يبني قائمة بطاقات للمراجعة حسب الموعد المطلوب
export function buildSRSQueue(progress, vocabList, limit = 15) {
  const srs = progress.srs || {};
  const now = Date.now();
  const due = [];
  const newCards = [];

  vocabList.forEach((v) => {
    const card = srs[v.fr];
    if (!card) {
      newCards.push({ ...v, box: 0 });
    } else if (card.due <= now) {
      due.push({ ...v, box: card.box });
    }
  });

  // خلط عشوائي بسيط
  const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
  shuffle(newCards);
  shuffle(due);

  return { due: due.slice(0, limit), new: newCards.slice(0, limit) };
}

// معالجة إجابة بطاقة
export function answerCard(srs, fr, quality, known) {
  const today = startOfDay();
  const card = srs[fr] || { box: 0, due: 0, reps: 0, lapses: 0 };

  if (known) {
    // بطاقة معروفة: نرفع الصندوق ونمدّد الموعد
    const newBox = Math.min(5, card.box + 1);
    const interval = SRS_INTERVALS_DAYS[newBox];
    card.box = newBox;
    card.due = nowPlusDays(interval);
    card.reps += 1;
  } else {
    // منسية: نعيدها إلى الصندوق الأول
    card.lapses += 1;
    card.box = 0;
    card.due = nowPlusDays(1);
  }
  card.lastSeen = Date.now();
  card.lastQuality = quality;
  srs[fr] = card;
  return srs;
}

// إحصائيات
export function srsStats(srs) {
  let total = 0;
  let learning = 0;
  let young = 0; // box 1-2
  let mature = 0; // box 3+
  let dueToday = 0;
  const now = Date.now();
  Object.values(srs).forEach((c) => {
    total++;
    if (c.box === 0) learning++;
    else if (c.box <= 2) young++;
    else mature++;
    if (c.due <= now) dueToday++;
  });
  return { total, learning, young, mature, dueToday };
}

function startOfDay() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function nowPlusDays(days) {
  return Date.now() + days * DAY;
}
