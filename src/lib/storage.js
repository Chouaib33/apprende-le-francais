// طبقة التخزين المحلي (localStorage) — نظام حسابات مبسّط يوفّر تسجيل الدخول وحفظ التقدم.

const KEY_USERS = 'aff_users_v1';
const KEY_SESSION = 'aff_session_v1';

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(KEY_USERS)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

export function registerUser(name, email, password) {
  const users = getUsers();
  const em = email.trim().toLowerCase();
  if (users[em]) return { ok: false, error: 'هذا البريد الإلكتروني مسجّل مسبقاً.' };
  const id = 'u_' + Date.now();
  users[em] = {
    id,
    name: name.trim() || 'طالب',
    email: em,
    password,
    createdAt: Date.now(),
    progress: emptyProgress(),
  };
  saveUsers(users);
  loginUser(email, password);
  return { ok: true, user: publicUser(users[em]) };
}

export function loginUser(email, password) {
  const users = getUsers();
  const em = email.trim().toLowerCase();
  const u = users[em];
  if (!u || u.password !== password) return { ok: false, error: 'البريد أو كلمة المرور غير صحيحة.' };
  localStorage.setItem(KEY_SESSION, JSON.stringify({ email: em }));
  return { ok: true, user: publicUser(u) };
}

export function logoutUser() {
  localStorage.removeItem(KEY_SESSION);
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSION));
  } catch {
    return null;
  }
}

export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, createdAt: u.createdAt, progress: u.progress };
}

export function currentUser() {
  const s = getSession();
  if (!s) return null;
  const users = getUsers();
  const u = users[s.email];
  return u ? publicUser(u) : null;
}

export function saveProgress(patch) {
  const s = getSession();
  if (!s) return;
  const users = getUsers();
  if (!users[s.email]) return;
  users[s.email].progress = { ...users[s.email].progress, ...patch };
  saveUsers(users);
}

export function emptyProgress() {
  return {
    lessonsCompleted: {}, // {lessonId: {doneAt, score, xp}}
    unitTests: {}, // {unitId: {score, passed, completedAt}}
    levelTests: {}, // {levelId: {score, passed, completedAt}}
    srs: {}, // {fr: {box, due, reps, lapses}}
    xp: 0,
    badges: [],
    streak: { count: 0, lastDate: null },
    stats: { timeSpent: 0, activitiesDone: 0 },
    weakness: {}, // {concept: count}
  };
}
