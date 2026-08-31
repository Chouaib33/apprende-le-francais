import { a1 } from './a1.js';
import { a2 } from './a2.js';
import { b1 } from './b1.js';
import { b2 } from './b2.js';

export const LEVELS = [a1, a2, b1, b2];

// خريطة سريعة للوصول بالمعرّف
export const levelById = (id) => LEVELS.find((l) => l.id === id);

// جميع الوحدات والدروس بشكل مسطّح مع معرّفات المستوى
export const allUnits = LEVELS.flatMap((level) =>
  level.units.map((unit) => ({ ...unit, levelId: level.id }))
);

export const allLessons = LEVELS.flatMap((level) =>
  level.units.flatMap((unit) =>
    unit.lessons.map((lesson) => ({ ...lesson, levelId: level.id, unitId: unit.id }))
  )
);

// ترتيب الدروس داخل الوحدات للمتابعة التسلسلية
export const orderedLessons = allLessons;

// معلومات المستوى السابق/التالي
export const nextLevel = (id) => {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
};
export const prevLevel = (id) => {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i > 0 ? LEVELS[i - 1] : null;
};

export default LEVELS;
