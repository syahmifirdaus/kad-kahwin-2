export const LOCAL_WISHES_KEY = "kad_kahwin_wishes";

export const WAZE_APP_URL =
  "waze://?q=Savannah%20Hill%20Resort%2C%20Ulu%20Tiram&navigate=yes";

function normalizeWish(wish) {
  return {
    name: String(wish?.name || "Tetamu"),
    text: String(wish?.text || wish?.message || wish?.ucapan || ""),
  };
}

export function normalizeWishRows(rows, limit = 12) {
  return (rows || [])
    .map(normalizeWish)
    .filter((wish) => wish.text.trim().length > 0)
    .slice(0, limit);
}

export function mergeWishLists(remoteWishes, localWishes, limit = 12) {
  const merged = [...normalizeWishRows(remoteWishes, limit)];

  for (const localWish of normalizeWishRows(localWishes, limit)) {
    const exists = merged.some(
      (remoteWish) =>
        remoteWish.name.trim() === localWish.name.trim() &&
        remoteWish.text.trim() === localWish.text.trim()
    );

    if (!exists) merged.push(localWish);
  }

  return merged.slice(0, limit);
}

export function readStoredWishes(storage, key = LOCAL_WISHES_KEY, limit = 12) {
  try {
    const raw = storage?.getItem?.(key);
    if (!raw) return [];
    return normalizeWishRows(JSON.parse(raw), limit);
  } catch {
    return [];
  }
}

export function writeStoredWishes(storage, wishes, key = LOCAL_WISHES_KEY, limit = 12) {
  try {
    storage?.setItem?.(key, JSON.stringify(normalizeWishRows(wishes, limit)));
  } catch {}
}

export function buildWishListAfterSubmit(existingWishes, name, text, limit = 12) {
  const trimmedText = String(text || "").trim();
  if (!trimmedText) return normalizeWishRows(existingWishes, limit);

  const trimmedName = String(name || "").trim() || "Tetamu";
  return normalizeWishRows([{ name: trimmedName, text: trimmedText }, ...existingWishes], limit);
}

export function openWazeWithFallback(
  locationObject,
  fallbackUrl,
  schedule = setTimeout,
  delay = 600
) {
  locationObject.href = WAZE_APP_URL;
  void fallbackUrl;
  void schedule;
  void delay;
}
