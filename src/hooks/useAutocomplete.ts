import { useState, useRef, useEffect, useCallback } from "react";
import { fetchAutocomplete } from "../services/pubchem/api";

const suggestionCache = new Map<string, string[]>();

export const useAutocomplete = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    // Check cache first
    if (suggestionCache.has(text)) {
      setSuggestions(suggestionCache.get(text)!);
      setShowSuggestions(true);
      return;
    }

    try {
      const results = await fetchAutocomplete(text);
      if (results.length > 0) {
        suggestionCache.set(text, results);
        setSuggestions(results);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error(
        "Autocomplete error:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);

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
  };
};
