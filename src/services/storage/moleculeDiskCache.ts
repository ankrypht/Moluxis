import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { MoleculeInfo } from "../../types";

export const DISK_CACHE_INDEX_KEY = "@moluxis_molecule_cache_index_v2";
export const DISK_CACHE_PREFIX = "@moluxis_mol_v2_";
export const MAX_DISK_CACHE_ITEMS = 150;

export interface CacheIndexEntry {
  name: string;
  normalizedName: string;
  cid: string;
  lastAccessedAt: number;
  isPinned: boolean;
}

// In-memory module state for the cache index
let memoryIndex: CacheIndexEntry[] | null = null;
let initPromise: Promise<CacheIndexEntry[]> | null = null;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let hasPendingIndexWrite = false;

// Auto-flush pending metadata updates when app transitions to background or inactive
if (typeof AppState !== "undefined" && AppState?.addEventListener) {
  AppState.addEventListener("change", (state) => {
    if (state === "background" || state === "inactive") {
      flushDiskCacheIndex().catch(() => {});
    }
  });
}

/**
 * Loads the cache index safely with in-memory caching and concurrent race guarding.
 */
export async function getDiskCacheIndex(): Promise<CacheIndexEntry[]> {
  if (memoryIndex) {
    return memoryIndex;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(DISK_CACHE_INDEX_KEY);
      if (!raw) {
        memoryIndex = [];
      } else {
        const parsed = JSON.parse(raw);
        memoryIndex = Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Failed to load molecule disk cache index:", error);
      memoryIndex = [];
    } finally {
      initPromise = null;
    }
    return memoryIndex;
  })();

  return initPromise;
}

/**
 * Saves the cache index immediately and cancels any pending debounced writes.
 */
async function saveDiskCacheIndexImmediate(
  index: CacheIndexEntry[],
): Promise<void> {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  hasPendingIndexWrite = false;
  memoryIndex = index;
  try {
    await AsyncStorage.setItem(DISK_CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn("Failed to save molecule disk cache index:", error);
  }
}

/**
 * Debounces the cache index serialization to AsyncStorage for read hot paths.
 */
function scheduleSaveDiskCacheIndex(
  index: CacheIndexEntry[],
  delayMs = 3000,
): void {
  hasPendingIndexWrite = true;
  memoryIndex = index;
  if (saveDebounceTimer) return;

  saveDebounceTimer = setTimeout(async () => {
    saveDebounceTimer = null;
    if (hasPendingIndexWrite && memoryIndex) {
      hasPendingIndexWrite = false;
      try {
        await AsyncStorage.setItem(
          DISK_CACHE_INDEX_KEY,
          JSON.stringify(memoryIndex),
        );
      } catch (error) {
        console.warn(
          "Failed to save debounced molecule disk cache index:",
          error,
        );
      }
    }
  }, delayMs);
}

/**
 * Immediately flushes any pending debounced cache index updates to disk.
 */
export async function flushDiskCacheIndex(): Promise<void> {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (hasPendingIndexWrite && memoryIndex) {
    hasPendingIndexWrite = false;
    try {
      await AsyncStorage.setItem(
        DISK_CACHE_INDEX_KEY,
        JSON.stringify(memoryIndex),
      );
    } catch (error) {
      console.warn("Failed to flush molecule disk cache index:", error);
    }
  }
}

/**
 * Resets module in-memory cache index state (used for testing).
 */
export function _resetDiskCacheMemoryStateForTests(): void {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  memoryIndex = null;
  initPromise = null;
  hasPendingIndexWrite = false;
}

/**
 * Retrieves a molecule from disk cache by name or CID.
 * Updates the lastAccessedAt timestamp in memory and debounces the disk write.
 */
export async function getCachedMolecule(
  term: string,
): Promise<MoleculeInfo | null> {
  if (!term || typeof term !== "string" || !term.trim()) return null;

  const normalized = term.trim().toLowerCase();

  try {
    const index = await getDiskCacheIndex();
    const entry = index.find(
      (e) => e.normalizedName === normalized || e.cid === term.trim(),
    );

    if (!entry) return null;

    const raw = await AsyncStorage.getItem(
      `${DISK_CACHE_PREFIX}${entry.normalizedName}`,
    );
    if (!raw) return null;

    const data: MoleculeInfo = JSON.parse(raw);

    // Update lastAccessedAt in memory only and debounce/throttle disk writes
    entry.lastAccessedAt = Date.now();
    scheduleSaveDiskCacheIndex(index);

    return data;
  } catch (error) {
    console.warn(`Failed to read cached molecule for "${term}":`, error);
    return null;
  }
}

/**
 * Saves a molecule to the persistent disk cache.
 * Evicts the oldest unpinned molecule if capacity is exceeded.
 * Performs a durable, immediate write to disk.
 */
export async function saveCachedMolecule(
  molecule: MoleculeInfo,
  isPinned = false,
): Promise<void> {
  if (!molecule || !molecule.name) return;

  const normalized = molecule.name.trim().toLowerCase();
  const key = `${DISK_CACHE_PREFIX}${normalized}`;

  try {
    const index = await getDiskCacheIndex();
    const existingIdx = index.findIndex((e) => e.normalizedName === normalized);

    if (existingIdx !== -1) {
      // Update existing entry
      index[existingIdx].lastAccessedAt = Date.now();
      if (isPinned) {
        index[existingIdx].isPinned = true;
      }
    } else {
      // Evict oldest unpinned entry if capacity exceeded
      const unpinnedCount = index.filter((e) => !e.isPinned).length;
      if (unpinnedCount >= MAX_DISK_CACHE_ITEMS) {
        let oldestIdx = -1;
        let oldestTime = Infinity;

        for (let i = 0; i < index.length; i++) {
          if (!index[i].isPinned && index[i].lastAccessedAt < oldestTime) {
            oldestTime = index[i].lastAccessedAt;
            oldestIdx = i;
          }
        }

        if (oldestIdx !== -1) {
          const evicted = index[oldestIdx];
          index.splice(oldestIdx, 1);
          await AsyncStorage.removeItem(
            `${DISK_CACHE_PREFIX}${evicted.normalizedName}`,
          ).catch(() => {});
        }
      }

      index.unshift({
        name: molecule.name,
        normalizedName: normalized,
        cid: molecule.cid || "",
        lastAccessedAt: Date.now(),
        isPinned,
      });
    }

    // Write molecule data and index in parallel (durable)
    await Promise.all([
      AsyncStorage.setItem(key, JSON.stringify(molecule)),
      saveDiskCacheIndexImmediate(index),
    ]);
  } catch (error) {
    console.warn(`Failed to cache molecule "${molecule.name}" to disk:`, error);
  }
}

/**
 * Marks a molecule as pinned (e.g. bookmarked) or unpinned.
 * Pinned molecules are never evicted by LRU.
 */
export async function setMoleculePinned(
  term: string,
  isPinned: boolean,
): Promise<void> {
  if (!term || typeof term !== "string") return;

  const normalized = term.trim().toLowerCase();

  try {
    const index = await getDiskCacheIndex();
    const entry = index.find((e) => e.normalizedName === normalized);
    if (entry) {
      entry.isPinned = isPinned;
      await saveDiskCacheIndexImmediate(index);
    }
  } catch (error) {
    console.warn(`Failed to set pin status for "${term}":`, error);
  }
}

/**
 * Removes a specific molecule from the disk cache.
 */
export async function removeCachedMolecule(term: string): Promise<void> {
  if (!term || typeof term !== "string") return;

  const normalized = term.trim().toLowerCase();

  try {
    const index = await getDiskCacheIndex();
    const newIndex = index.filter((e) => e.normalizedName !== normalized);
    await Promise.all([
      AsyncStorage.removeItem(`${DISK_CACHE_PREFIX}${normalized}`),
      saveDiskCacheIndexImmediate(newIndex),
    ]);
  } catch (error) {
    console.warn(`Failed to remove cached molecule "${term}":`, error);
  }
}

/**
 * Clears the entire molecule disk cache.
 */
export async function clearMoleculeDiskCache(): Promise<void> {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  hasPendingIndexWrite = false;

  try {
    const index = await getDiskCacheIndex();
    const keysToRemove = index.map(
      (e) => `${DISK_CACHE_PREFIX}${e.normalizedName}`,
    );
    keysToRemove.push(DISK_CACHE_INDEX_KEY);
    memoryIndex = [];
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.warn("Failed to clear molecule disk cache:", error);
  }
}
