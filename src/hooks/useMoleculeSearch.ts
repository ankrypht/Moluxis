import { useState, useRef, useEffect, useCallback } from "react";
import { Keyboard } from "react-native";
import { Alert } from "../components/CustomAlert";
import { MoleculeInfo } from "../types";
import { fetchMoleculeData } from "../services/pubchem/searchHelper";
import { isAbortError } from "../services/pubchem/utils";
import { useStoreReview } from "./useStoreReview";
import {
  getCachedMolecule,
  saveCachedMolecule,
  _resetDiskCacheMemoryStateForTests,
} from "../services/storage/moleculeDiskCache";
import { PubChemThrottledError } from "../services/pubchem/circuitBreaker";

const MAX_MOLECULE_CACHE_SIZE = 12;

// Tier 1: Global in-memory RAM cache for fast, synchronous retrieval with clean LRU eviction.
// Stores single payload per compound under canonical key (avoiding dual-key duplication of full SDF strings)
const moleculePayloadCache = new Map<string, MoleculeInfo>();
const aliasToCanonicalMap = new Map<string, string>();

export const clearMoleculeCache = () => {
  moleculePayloadCache.clear();
  aliasToCanonicalMap.clear();
  _resetDiskCacheMemoryStateForTests();
};

const getCanonicalKey = (molecule: MoleculeInfo): string => {
  return molecule.cid
    ? `cid:${molecule.cid}`
    : `name:${molecule.name.trim().toLowerCase()}`;
};

export const cacheMoleculeInRam = (term: string, molecule: MoleculeInfo) => {
  if (!molecule || !molecule.name) return;
  const canonicalKey = getCanonicalKey(molecule);

  // Refresh LRU order on update
  moleculePayloadCache.delete(canonicalKey);

  // Evict oldest unpinned molecule if capacity reached
  while (moleculePayloadCache.size >= MAX_MOLECULE_CACHE_SIZE) {
    const oldestKey = moleculePayloadCache.keys().next().value;
    if (oldestKey) {
      moleculePayloadCache.delete(oldestKey);
      // Clean up alias entries pointing to the evicted canonical key
      for (const [alias, target] of aliasToCanonicalMap.entries()) {
        if (target === oldestKey) {
          aliasToCanonicalMap.delete(alias);
        }
      }
    } else {
      break;
    }
  }

  moleculePayloadCache.set(canonicalKey, molecule);

  const normName = molecule.name.trim().toLowerCase();
  aliasToCanonicalMap.set(normName, canonicalKey);

  const normTerm = term.trim().toLowerCase();
  aliasToCanonicalMap.set(normTerm, canonicalKey);

  if (molecule.cid) {
    aliasToCanonicalMap.set(molecule.cid.trim(), canonicalKey);
  }
};

export const getMoleculeFromRam = (term: string): MoleculeInfo | null => {
  if (!term || typeof term !== "string" || !term.trim()) return null;
  const trimmed = term.trim();
  const normalized = trimmed.toLowerCase();

  const canonicalKey =
    aliasToCanonicalMap.get(normalized) || aliasToCanonicalMap.get(trimmed);

  if (!canonicalKey) return null;

  const molecule = moleculePayloadCache.get(canonicalKey);
  if (!molecule) return null;

  // Refresh LRU access order
  moleculePayloadCache.delete(canonicalKey);
  moleculePayloadCache.set(canonicalKey, molecule);

  return molecule;
};

// Lazy getter for the 103 KB bundled offline dataset (evaluates on-demand, not at module load)
let bundledGetter: ((term: string) => MoleculeInfo | null) | null = null;

function findBundledMolecule(term: string): MoleculeInfo | null {
  if (!bundledGetter) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require("../constants/bundledMoleculeData");
    if (typeof mod.getBundledMolecule === "function") {
      bundledGetter = mod.getBundledMolecule;
    } else {
      // Fallback for tests mocking BUNDLED_MOLECULES directly
      bundledGetter = (t: string) => {
        const norm = t.trim().toLowerCase();
        const trim = t.trim();
        return (
          mod.BUNDLED_MOLECULES?.[norm] ||
          mod.BUNDLED_MOLECULES_BY_CID?.[trim] ||
          null
        );
      };
    }
  }
  return bundledGetter ? bundledGetter(term) : null;
}

export const useMoleculeSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeInfo | null>(null);
  const { incrementSearchCountAndReview } = useStoreReview();
  const activeSearchIdRef = useRef(0);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Cancel any pending search on unmount
  useEffect(() => {
    return () => {
      searchAbortControllerRef.current?.abort();
    };
  }, []);

  const searchMolecule = useCallback(
    async (queryName?: string) => {
      Keyboard.dismiss();

      const term = queryName || "";
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      const normalizedTerm = trimmedTerm.toLowerCase();
      const currentSearchId = ++activeSearchIdRef.current;

      // Abort any prior in-flight search
      searchAbortControllerRef.current?.abort();
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      // 1. Tier 1: Check In-Memory RAM Cache first by Name or CID (0ms synchronous)
      const ramCached = getMoleculeFromRam(trimmedTerm);
      if (ramCached) {
        setIsLoading(false);
        setMoleculeData(ramCached);
        incrementSearchCountAndReview();
        return;
      }

      // 2. Check Pre-bundled Offline Dataset by Name or CID (0ms synchronous)
      const bundled = findBundledMolecule(trimmedTerm);
      if (bundled) {
        cacheMoleculeInRam(normalizedTerm, bundled);

        setIsLoading(false);
        setMoleculeData(bundled);
        incrementSearchCountAndReview();
        return;
      }

      // Synchronously initiate loading state before any async storage/network gaps
      setIsLoading(true);
      setMoleculeData(null);

      // 3. Tier 2: Check Persistent Disk Cache (AsyncStorage) with a single normalized lookup
      const diskCached = await getCachedMolecule(trimmedTerm);
      if (
        currentSearchId !== activeSearchIdRef.current ||
        controller.signal.aborted
      ) {
        return;
      }

      if (diskCached) {
        // Promote to Tier 1 RAM Cache
        cacheMoleculeInRam(normalizedTerm, diskCached);

        setIsLoading(false);
        setMoleculeData(diskCached);
        incrementSearchCountAndReview();
        return;
      }

      // 4. Fallback to Network (Rate-limited through RequestQueue)
      try {
        const result = await fetchMoleculeData(term, controller.signal);

        // Guard against race conditions: ignore if superseded by another search
        if (
          currentSearchId !== activeSearchIdRef.current ||
          controller.signal.aborted
        ) {
          return;
        }

        // Store in Tier 1 RAM cache
        cacheMoleculeInRam(normalizedTerm, result);

        // Store in Tier 2 Disk cache in background
        saveCachedMolecule(result).catch(() => {});

        setMoleculeData(result);
        // Successful search!
        incrementSearchCountAndReview();
      } catch (error) {
        // Ignore errors from cancelled or stale searches
        if (
          currentSearchId !== activeSearchIdRef.current ||
          controller.signal.aborted
        ) {
          return;
        }
        if (isAbortError(error, controller.signal)) return;

        if (error instanceof PubChemThrottledError) {
          Alert.alert(
            "Chemical Server Busy",
            "PubChem is currently receiving high traffic. Please wait a moment before trying again.",
          );
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        console.error("Molecule search error:", message);

        if (
          message === "Could not find a molecule with that name." ||
          message === "No structure available for this compound." ||
          message === "Received invalid data from the chemical database."
        ) {
          const title =
            message === "No structure available for this compound."
              ? "No Structure Data"
              : message === "Received invalid data from the chemical database."
                ? "Error"
                : "Not Found";
          Alert.alert(title, message);
        } else {
          Alert.alert("Error", "Network error. Please try again.");
        }
      } finally {
        if (currentSearchId === activeSearchIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [incrementSearchCountAndReview],
  );

  const selectSuggestion = useCallback(
    (item: string) => {
      searchMolecule(item);
    },
    [searchMolecule],
  );

  const clearMolecule = useCallback(() => {
    activeSearchIdRef.current++;
    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = null;
    Keyboard.dismiss();
    setMoleculeData(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    moleculeData,
    searchMolecule,
    selectSuggestion,
    clearMolecule,
  };
};
