// أدوات حساب التقدم على مستوى المستوى والوحدة.

export function levelProgress(progress, level) {
  const lessons = level.units.reduce((acc, u) => acc + u.lessons.length, 0);
  if (!lessons) return 0;
  let done = 0;
  level.units.forEach((u) => {
    u.lessons.forEach((l) => {
      if (progress.lessonsCompleted[l.id]) done++;
    });
  });
  return Math.round((done / lessons) * 100);
}

export function unitProgress(progress, unit) {
  const total = unit.lessons.length;
  if (!total) return 0;
  let done = 0;
  unit.lessons.forEach((l) => {
    if (progress.lessonsCompleted[l.id]) done++;
  });
  return Math.round((done / total) * 100);
}

export function levelDone(progress, level) {
  return levelProgress(progress, level) >= 100;
}

export function levelUnlocked(progress, levelId, LEVELS) {
  if (levelId === LEVELS[0].id) return true;
  const idx = LEVELS.findIndex((l) => l.id === levelId);
  if (idx <= 0) return true;
  const prev = LEVELS[idx - 1];
  const prevTest = progress.levelTests[prev.id];
  return !!(prevTest && prevTest.passed);
}

export function totalXp(progress) {
  return progress.xp || 0;
}

export function totalTimeMin(progress) {
  return Math.round((progress.stats?.timeSpent || 0) / 60000);
}
