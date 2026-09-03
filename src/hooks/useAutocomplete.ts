import { useState, useRef, useEffect, useCallback } from "react";
import { fetchAutocomplete } from "../services/pubchem/api";
import { isAbortError } from "../services/pubchem/utils";

const suggestionCache = new Map<string, string[]>();

export const useAutocomplete = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isCancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      // Cancel any pending fetch on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    if (suggestionCache.has(text)) {
      if (!isCancelledRef.current) {
        setSuggestions(suggestionCache.get(text)!);
        setShowSuggestions(true);
      }
      return;
    }

    // Abort any previous in-flight request before starting a new one
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const results = await fetchAutocomplete(text, controller.signal);
      // Re-check after the async gap — clearSuggestions may have been called
      if (isCancelledRef.current) return;
      if (results.length > 0) {
        suggestionCache.set(text, results);
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      // Abort/cancellation is expected when the user types quickly or searches
      if (isAbortError(error, controller.signal)) return;
      console.error(
        "Autocomplete error:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  const clearSuggestions = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    isCancelledRef.current = true;
    // Cancel the in-flight fetch so we don't waste network / battery
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setShowSuggestions(false);
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    // User is typing again — allow suggestions to appear
    isCancelledRef.current = false;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  }, []);

  return {
    searchText,
    setSearchText,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    handleTextChange,
    clearSuggestions,
  };
};
