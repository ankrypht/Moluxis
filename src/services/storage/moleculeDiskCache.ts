import AsyncStorage from "@react-native-async-storage/async-storage";
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

/**
 * Loads the cache index from AsyncStorage safely.
 */
export async function getDiskCacheIndex(): Promise<CacheIndexEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(DISK_CACHE_INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to load molecule disk cache index:", error);
    return [];
  }
}

/**
 * Saves the cache index to AsyncStorage safely.
 */
async function saveDiskCacheIndex(index: CacheIndexEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DISK_CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn("Failed to save molecule disk cache index:", error);
  }
}

/**
 * Retrieves a molecule from disk cache by name.
 * Updates the lastAccessedAt timestamp (LRU touch).
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

    // Update lastAccessedAt in background (LRU touch)
    entry.lastAccessedAt = Date.now();
    saveDiskCacheIndex(index).catch(() => {});

    return data;
  } catch (error) {
    console.warn(`Failed to read cached molecule for "${term}":`, error);
    return null;
  }
}

/**
 * Saves a molecule to the persistent disk cache.
 * Evicts the oldest unpinned molecule if capacity is exceeded.
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
        // Find oldest unpinned
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

    // Write molecule data and index in parallel
    await Promise.all([
      AsyncStorage.setItem(key, JSON.stringify(molecule)),
      saveDiskCacheIndex(index),
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
      await saveDiskCacheIndex(index);
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
      saveDiskCacheIndex(newIndex),
    ]);
  } catch (error) {
    console.warn(`Failed to remove cached molecule "${term}":`, error);
  }
}

/**
 * Clears the entire molecule disk cache.
 */
export async function clearMoleculeDiskCache(): Promise<void> {
  try {
    const index = await getDiskCacheIndex();
    const keysToRemove = index.map(
      (e) => `${DISK_CACHE_PREFIX}${e.normalizedName}`,
    );
    keysToRemove.push(DISK_CACHE_INDEX_KEY);
    await AsyncStorage.multiRemove(keysToRemove);
  } catch (error) {
    console.warn("Failed to clear molecule disk cache:", error);
  }
}
