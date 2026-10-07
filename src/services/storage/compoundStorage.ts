import AsyncStorage from "@react-native-async-storage/async-storage";
import { SavedCompoundItem } from "../../types";

export const HISTORY_STORAGE_KEY = "@moluxis_recent_history_v1";
export const BOOKMARKS_STORAGE_KEY = "@moluxis_bookmarks_v1";
export const MAX_HISTORY_ITEMS = 30;
export const MAX_BOOKMARKS_ITEMS = 100;

/**
 * Retrieve recent search history from AsyncStorage
 */
export async function getRecentHistory(): Promise<SavedCompoundItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is SavedCompoundItem =>
      Boolean(
        entry &&
        typeof entry === "object" &&
        typeof entry.name === "string" &&
        entry.name.trim().length > 0,
      ),
    );
  } catch (error) {
    console.warn("Failed to load search history:", error);
    return [];
  }
}

/**
 * Add or update a compound in the search history.
 * Moves the item to the top and deduplicates by lowercase name.
 */
export async function addRecentHistory(
  item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
): Promise<SavedCompoundItem[]> {
  if (!item || typeof item.name !== "string" || !item.name.trim()) {
    return getRecentHistory();
  }

  let current: SavedCompoundItem[] = [];
  try {
    current = await getRecentHistory();
    const normalizedName = item.name.trim().toLowerCase();

    // Check if an existing entry has more details like formula/cid
    const existing = current.find(
      (entry) => entry.name.trim().toLowerCase() === normalizedName,
    );

    const mergedItem: SavedCompoundItem = {
      name: item.name.trim(),
      formula: item.formula || existing?.formula,
      cid: item.cid || existing?.cid,
      molecularWeight: item.molecularWeight || existing?.molecularWeight,
      timestamp: item.timestamp ?? Date.now(),
    };

    // Filter out previous entry of the same compound
    const filtered = current.filter(
      (entry) => entry.name.trim().toLowerCase() !== normalizedName,
    );

    // Insert at front and limit to MAX_HISTORY_ITEMS
    const updated = [mergedItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to save search history:", error);
    return current;
  }
}

/**
 * Remove a specific compound from search history.
 */
export async function removeRecentHistory(
  name: string,
): Promise<SavedCompoundItem[]> {
  if (!name || typeof name !== "string" || !name.trim()) {
    return getRecentHistory();
  }

  let current: SavedCompoundItem[] = [];
  try {
    current = await getRecentHistory();
    const normalizedName = name.trim().toLowerCase();
    const updated = current.filter(
      (entry) => entry.name.trim().toLowerCase() !== normalizedName,
    );
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to remove item from history:", error);
    return current;
  }
}

/**
 * Clear all search history.
 */
export async function clearRecentHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear search history:", error);
  }
}

/**
 * Retrieve saved bookmarks from AsyncStorage
 */
export async function getBookmarks(): Promise<SavedCompoundItem[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is SavedCompoundItem =>
      Boolean(
        entry &&
        typeof entry === "object" &&
        typeof entry.name === "string" &&
        entry.name.trim().length > 0,
      ),
    );
  } catch (error) {
    console.warn("Failed to load bookmarks:", error);
    return [];
  }
}

/**
 * Add a compound to bookmarks.
 */
export async function addBookmark(
  item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
): Promise<SavedCompoundItem[]> {
  if (!item || typeof item.name !== "string" || !item.name.trim()) {
    return getBookmarks();
  }

  let current: SavedCompoundItem[] = [];
  try {
    current = await getBookmarks();
    const normalizedName = item.name.trim().toLowerCase();

    const existing = current.find(
      (entry) => entry.name.trim().toLowerCase() === normalizedName,
    );

    const mergedItem: SavedCompoundItem = {
      name: item.name.trim(),
      formula: item.formula || existing?.formula,
      cid: item.cid || existing?.cid,
      molecularWeight: item.molecularWeight || existing?.molecularWeight,
      timestamp: item.timestamp ?? Date.now(),
    };

    const filtered = current.filter(
      (entry) => entry.name.trim().toLowerCase() !== normalizedName,
    );

    const updated = [mergedItem, ...filtered].slice(0, MAX_BOOKMARKS_ITEMS);
    await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to save bookmark:", error);
    return current;
  }
}

/**
 * Remove a compound from bookmarks.
 */
export async function removeBookmark(
  name: string,
): Promise<SavedCompoundItem[]> {
  if (!name || typeof name !== "string" || !name.trim()) {
    return getBookmarks();
  }

  let current: SavedCompoundItem[] = [];
  try {
    current = await getBookmarks();
    const normalizedName = name.trim().toLowerCase();
    const updated = current.filter(
      (entry) => entry.name.trim().toLowerCase() !== normalizedName,
    );
    await AsyncStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn("Failed to remove bookmark:", error);
    return current;
  }
}

/**
 * Toggle a bookmark: if present, remove it; if absent, add it.
 */
export async function toggleBookmark(
  item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
): Promise<{ bookmarks: SavedCompoundItem[]; isBookmarked: boolean }> {
  if (!item || typeof item.name !== "string" || !item.name.trim()) {
    const current = await getBookmarks();
    return { bookmarks: current, isBookmarked: false };
  }

  const current = await getBookmarks();
  const normalizedName = item.name.trim().toLowerCase();
  const exists = current.some(
    (entry) => entry.name.trim().toLowerCase() === normalizedName,
  );

  if (exists) {
    const updated = await removeBookmark(item.name);
    const isStillBookmarked = updated.some(
      (entry) => entry.name.trim().toLowerCase() === normalizedName,
    );
    return { bookmarks: updated, isBookmarked: isStillBookmarked };
  } else {
    const updated = await addBookmark(item);
    const isNowBookmarked = updated.some(
      (entry) => entry.name.trim().toLowerCase() === normalizedName,
    );
    return { bookmarks: updated, isBookmarked: isNowBookmarked };
  }
}

/**
 * Clear all bookmarks.
 */
export async function clearBookmarks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear bookmarks:", error);
  }
}
