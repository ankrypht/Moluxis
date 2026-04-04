import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Keyboard } from "react-native";
import { MoleculeInfo } from "../types";
import {
  fetchAutocomplete,
  fetchCompoundByName,
  fetchMoleculeDetails,
} from "../services/pubchem/api";
import {
  parseCompoundProps,
  parseExperimentalProperties,
  parseSafetyInfo,
  parseSynonyms,
  parseDescription,
} from "../services/pubchem/parsers";

// Global cache for autocomplete suggestions and molecule data to persist across renders and hook instances
const suggestionCache = new Map<string, string[]>();
const moleculeCache = new Map<string, MoleculeInfo>();

export const useMoleculeSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeInfo | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep searchTextRef updated for use in useCallback
  const searchTextRef = useRef(searchText);
  useEffect(() => {
    searchTextRef.current = searchText;
  }, [searchText]);

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

  const handleTextChange = (text: string) => {
    setSearchText(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const searchMolecule = useCallback(async (queryName?: string) => {
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
      // Get initial compound data by name
      const searchJson = await fetchCompoundByName(term);
      if (!searchJson.PC_Compounds || searchJson.PC_Compounds.length === 0) {
        Alert.alert("Not Found", "Could not find a molecule with that name.");
        setIsLoading(false);
        return;
      }

      const compound = searchJson.PC_Compounds[0];
      const cid = compound.id.id.cid;

      // Validate Compound ID (Security: Prevent path traversal/malicious IDs)
      if (typeof cid !== "number" || !Number.isInteger(cid) || cid <= 0) {
        Alert.alert(
          "Error",
          "Received invalid data from the chemical database.",
        );
        setIsLoading(false);
        return;
      }

      // Extract basic props
      const { formula, molecularWeight, properties } =
        parseCompoundProps(compound);

      // Fetch all remaining details in parallel
      const {
        propsJson,
        ghsJson,
        synonymsJson,
        descJson,
        sdfText,
        cifText,
        codId,
        structureFormat,
      } = await fetchMoleculeDetails(cid);

      // Parse additional data
      const experimentalProps = parseExperimentalProperties(propsJson);
      Object.assign(properties, experimentalProps);

      const safety = parseSafetyInfo(ghsJson);
      const synonyms = synonymsJson ? parseSynonyms(synonymsJson) : [];
      const description = descJson
        ? parseDescription(descJson)
        : "No description available.";

      if (!sdfText && !cifText) {
        Alert.alert(
          "No Structure Data",
          "No structure available for this compound.",
        );
        setIsLoading(false);
        return;
      }

      const result: MoleculeInfo = {
        name: term,
        sdf: sdfText,
        cif: cifText,
        codId: codId,
        structureFormat,
        formula,
        molecularWeight,
        synonyms,
        description,
        cid: cid.toString(),
        properties,
        safety,
      };

      // Store in cache
      moleculeCache.set(normalizedTerm, result);
      setMoleculeData(result);
    } catch (error) {
      console.error(
        "Molecule search error:",
        error instanceof Error ? error.message : error,
      );
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSuggestion = useCallback(
    (item: string) => {
      setSearchText(item);
      setShowSuggestions(false);
      searchMolecule(item);
    },
    [searchMolecule],
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
