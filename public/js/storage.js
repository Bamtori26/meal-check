import { DEFAULT_CARDS, TAB_CONFIG, TAB_ORDER } from "./config.js";

export function storageKey(tab, type) {
  return `${TAB_CONFIG[tab].storagePrefix}_${type}`;
}

export function todayString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function loadCards(tab) {
  const saved = safeParse(localStorage.getItem(storageKey(tab, "cards")), null);

  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }

  return DEFAULT_CARDS[tab].map((card, index) => ({
    ...card,
    id: `${tab}-${Date.now()}-${index}`
  }));
}

export function saveCards(tab, cards) {
  localStorage.setItem(storageKey(tab, "cards"), JSON.stringify(cards));
}

export function loadHistory(tab) {
  return safeParse(localStorage.getItem(storageKey(tab, "history")), []);
}

export function saveHistory(tab, history) {
  localStorage.setItem(storageKey(tab, "history"), JSON.stringify(history));
}

export function clearHistory(tab) {
  localStorage.removeItem(storageKey(tab, "history"));
}

export function resetCards(tab) {
  localStorage.removeItem(storageKey(tab, "cards"));
}

export function loadEditMode() {
  return TAB_ORDER.reduce((editMode, tab) => {
    editMode[tab] = safeParse(localStorage.getItem(storageKey(tab, "editMode")), false);
    return editMode;
  }, {});
}

export function saveEditMode(tab, value) {
  localStorage.setItem(storageKey(tab, "editMode"), JSON.stringify(value));
}
