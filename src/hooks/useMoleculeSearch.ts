import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Keyboard } from "react-native";
import { MoleculeInfo } from "../types";
import { useAutocomplete } from "./useAutocomplete";
import { fetchMoleculeData } from "../services/pubchem/searchHelper";
import { useStoreReview } from "./useStoreReview";

const MAX_MOLECULE_CACHE_SIZE = 50;

// Global cache for molecule data to persist across renders and hook instances
const moleculeCache = new Map<string, MoleculeInfo>();

export const clearMoleculeCache = () => {
  moleculeCache.clear();
};

export const getMoleculeCacheSize = () => moleculeCache.size;

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

  // Keep searchTextRef updated for use in useCallback
  const searchTextRef = useRef(searchText);
  useEffect(() => {
    searchTextRef.current = searchText;
  }, [searchText]);

  const searchMolecule = useCallback(
    async (queryName?: string) => {
      Keyboard.dismiss();

      // Use the ref to get the current search text without adding it to dependency array
      const term = queryName || searchTextRef.current;
      if (!term.trim()) return;

      const normalizedTerm = term.trim().toLowerCase();
      const currentSearchId = ++activeSearchIdRef.current;

      clearSuggestions();

      // Check cache first
      if (moleculeCache.has(normalizedTerm)) {
        const cached = moleculeCache.get(normalizedTerm)!;
        // Refresh LRU order
        moleculeCache.delete(normalizedTerm);
        moleculeCache.set(normalizedTerm, cached);

        setIsLoading(false);
        setMoleculeData(cached);
        // Even if cached, count as a successful interaction
        incrementSearchCountAndReview();
        return;
      }

      setIsLoading(true);
      setMoleculeData(null);

      try {
        const result = await fetchMoleculeData(term);

        // Guard against race conditions: ignore if superseded by another search
        if (currentSearchId !== activeSearchIdRef.current) return;

        // Evict oldest entry if capacity reached
        if (moleculeCache.size >= MAX_MOLECULE_CACHE_SIZE) {
          const oldestKey = moleculeCache.keys().next().value;
          if (oldestKey) moleculeCache.delete(oldestKey);
        }

        // Store in cache
        moleculeCache.set(normalizedTerm, result);
        setMoleculeData(result);
        // Successful search!
        incrementSearchCountAndReview();
      } catch (error) {
        // Ignore errors from stale searches
        if (currentSearchId !== activeSearchIdRef.current) return;

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
