import { useState, useRef, useEffect, useCallback } from "react";
import { fetchAutocomplete } from "../services/pubchem/api";
import { isAbortError } from "../services/pubchem/utils";

const MAX_SUGGESTIONS_CACHE = 100;
const suggestionCache = new Map<string, string[]>();

export const clearSuggestionCache = () => {
  suggestionCache.clear();
};

export const getSuggestionCacheSize = () => suggestionCache.size;

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
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const cacheKey = trimmed.toLowerCase();

    // Check cache first
    if (suggestionCache.has(cacheKey)) {
      if (!isCancelledRef.current) {
        const cached = suggestionCache.get(cacheKey)!;
        // Refresh LRU order
        suggestionCache.delete(cacheKey);
        suggestionCache.set(cacheKey, cached);
        setSuggestions(cached);
        setShowSuggestions(cached.length > 0);
      }
      return;
    }

    // Abort any previous in-flight request before starting a new one
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const results = await fetchAutocomplete(trimmed, controller.signal);
      // Re-check after the async gap — clearSuggestions may have been called
      if (isCancelledRef.current || controller.signal.aborted) return;

      // LRU eviction if cache exceeds capacity
      if (suggestionCache.size >= MAX_SUGGESTIONS_CACHE) {
        const oldestKey = suggestionCache.keys().next().value;
        if (oldestKey) suggestionCache.delete(oldestKey);
      }

      suggestionCache.set(cacheKey, results);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
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
