import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Keyboard } from "react-native";
import { MoleculeInfo } from "../types";
import { useAutocomplete } from "./useAutocomplete";
import { fetchMoleculeData } from "../services/pubchem/searchHelper";

// Global cache for molecule data to persist across renders and hook instances
const moleculeCache = new Map<string, MoleculeInfo>();

export const useMoleculeSearch = () => {
  const {
    searchText,
    setSearchText,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    handleTextChange,
  } = useAutocomplete();

  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeInfo | null>(null);

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

      setShowSuggestions(false);

      // Check cache first
      if (moleculeCache.has(normalizedTerm)) {
        setMoleculeData(moleculeCache.get(normalizedTerm)!);
        return;
      }

      setIsLoading(true);
      setMoleculeData(null);

      try {
        const result = await fetchMoleculeData(term);

        // Store in cache
        moleculeCache.set(normalizedTerm, result);
        setMoleculeData(result);
      } catch (error) {
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
        setIsLoading(false);
      }
    },
    [setShowSuggestions],
  );

  const selectSuggestion = useCallback(
    (item: string) => {
      setSearchText(item);
      setShowSuggestions(false);
      searchMolecule(item);
    },
    [setSearchText, setShowSuggestions, searchMolecule],
  );

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
  };
};
