import { useState, useRef, useEffect, useCallback } from "react";
import { Keyboard } from "react-native";
import { Alert } from "../components/CustomAlert";
import { MoleculeInfo } from "../types";
import { useAutocomplete } from "./useAutocomplete";
import { fetchMoleculeData } from "../services/pubchem/searchHelper";
import { isAbortError } from "../services/pubchem/utils";
import { useStoreReview } from "./useStoreReview";
import {
  getCachedMolecule,
  saveCachedMolecule,
} from "../services/storage/moleculeDiskCache";
import { PubChemThrottledError } from "../services/pubchem/circuitBreaker";
import {
  BUNDLED_MOLECULES,
  BUNDLED_MOLECULES_BY_CID,
} from "../constants/bundledMoleculeData";

const MAX_MOLECULE_CACHE_SIZE = 50;

// Tier 1: Global in-memory RAM cache for fast, synchronous retrieval
const moleculeCache = new Map<string, MoleculeInfo>();

export const clearMoleculeCache = () => {
  moleculeCache.clear();
};

export const getMoleculeCacheSize = () => moleculeCache.size;

const cacheMoleculeInRam = (term: string, molecule: MoleculeInfo) => {
  while (moleculeCache.size >= MAX_MOLECULE_CACHE_SIZE) {
    const oldestKey = moleculeCache.keys().next().value;
    if (oldestKey) moleculeCache.delete(oldestKey);
    else break;
  }
  moleculeCache.set(term, molecule);
  if (molecule.cid) {
    if (moleculeCache.size >= MAX_MOLECULE_CACHE_SIZE) {
      const oldestKey = moleculeCache.keys().next().value;
      if (oldestKey) moleculeCache.delete(oldestKey);
    }
    moleculeCache.set(molecule.cid, molecule);
  }
};

export const useMoleculeSearch = () => {
  const {
    searchText,
    setSearchText,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleTextChange,
    clearSuggestions,
  } = useAutocomplete();

  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeInfo | null>(null);
  const { incrementSearchCountAndReview } = useStoreReview();
  const activeSearchIdRef = useRef(0);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Keep searchTextRef updated for use in useCallback
  const searchTextRef = useRef(searchText);
  useEffect(() => {
    searchTextRef.current = searchText;
  }, [searchText]);

  // Cancel any pending search on unmount
  useEffect(() => {
    return () => {
      searchAbortControllerRef.current?.abort();
    };
  }, []);

  const searchMolecule = useCallback(
    async (queryName?: string) => {
      Keyboard.dismiss();

      // Use the ref to get the current search text without adding it to dependency array
      const term = queryName || searchTextRef.current;
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      const normalizedTerm = trimmedTerm.toLowerCase();
      const currentSearchId = ++activeSearchIdRef.current;

      // Abort any prior in-flight search
      searchAbortControllerRef.current?.abort();
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      clearSuggestions();

      // 1. Tier 1: Check In-Memory RAM Cache first by Name or CID (0ms synchronous)
      const ramCached =
        moleculeCache.get(normalizedTerm) || moleculeCache.get(trimmedTerm);
      if (ramCached) {
        // Refresh LRU order
        moleculeCache.delete(normalizedTerm);
        moleculeCache.set(normalizedTerm, ramCached);
        if (ramCached.cid) {
          moleculeCache.set(ramCached.cid, ramCached);
        }

        setIsLoading(false);
        setMoleculeData(ramCached);
        incrementSearchCountAndReview();
        return;
      }

      // 2. Check Pre-bundled Offline Dataset by Name or CID (0ms synchronous)
      const bundled =
        BUNDLED_MOLECULES[normalizedTerm] ||
        BUNDLED_MOLECULES_BY_CID[trimmedTerm];

      if (bundled) {
        moleculeCache.set(normalizedTerm, bundled);
        if (bundled.cid) {
          moleculeCache.set(bundled.cid, bundled);
        }

        setIsLoading(false);
        setMoleculeData(bundled);
        incrementSearchCountAndReview();
        return;
      }

      // Synchronously initiate loading state before any async storage/network gaps
      setIsLoading(true);
      setMoleculeData(null);

      // 3. Tier 2: Check Persistent Disk Cache (AsyncStorage) by Name or CID
      const diskCached =
        (await getCachedMolecule(normalizedTerm)) ||
        (await getCachedMolecule(trimmedTerm));
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
    [clearSuggestions, incrementSearchCountAndReview],
  );

  const selectSuggestion = useCallback(
    (item: string) => {
      setSearchText(item);
      clearSuggestions();
      searchMolecule(item);
    },
    [setSearchText, clearSuggestions, searchMolecule],
  );

  const clearMolecule = useCallback(() => {
    activeSearchIdRef.current++;
    searchAbortControllerRef.current?.abort();
    searchAbortControllerRef.current = null;
    Keyboard.dismiss();
    setSearchText("");
    clearSuggestions();
    setMoleculeData(null);
    setIsLoading(false);
  }, [setSearchText, clearSuggestions]);

  return {
    searchText,
    setSearchText,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isLoading,
    moleculeData,
    handleTextChange,
    searchMolecule,
    selectSuggestion,
    clearMolecule,
  };
};
