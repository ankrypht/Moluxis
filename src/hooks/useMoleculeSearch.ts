import { useState, useRef, useEffect, useCallback } from "react";
import { Alert, Keyboard } from "react-native";
import { MoleculeInfo, ChemicalProperties, SafetyInfo } from "../types";
import {
  PubChemCompoundResponse,
  PubChemAutocompleteResponse,
  PubChemCompound,
  PubChemInformation,
} from "../types/pubchem";

// Global cache for autocomplete suggestions to persist across renders and hook instances
const suggestionCache = new Map<string, string[]>();

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
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(
        text,
      )}/json?limit=6`;
      const res = await fetch(url);
      const json: PubChemAutocompleteResponse = await res.json();
      if (json.dictionary_terms && json.dictionary_terms.compound) {
        // Remove duplicates
        const deduplicated = Array.from(new Set(json.dictionary_terms.compound));
        suggestionCache.set(text, deduplicated);
        setSuggestions(deduplicated);
        setShowSuggestions(true);
      }
    } catch {
      // Autocomplete error ignored
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
    // Use the ref to get the current search text without adding it to dependency array
    const term = queryName || searchTextRef.current;
    if (!term.trim()) return;

    Keyboard.dismiss();
    setShowSuggestions(false);
    setIsLoading(true);
    setMoleculeData(null);

    try {
      // Get compound data
      const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
        term,
      )}/JSON`;
      const searchRes = await fetch(searchUrl);
      const searchJson: PubChemCompoundResponse = await searchRes.json();

      if (!searchJson.PC_Compounds) {
        Alert.alert("Not Found", "Could not find a molecule with that name.");
        setIsLoading(false);
        return;
      }

      const compound: PubChemCompound = searchJson.PC_Compounds[0];
      const cid = compound.id.id.cid;

      // Extract properties from compound props
      let formula = "";
      let molecularWeight = "";
      const properties: ChemicalProperties = {};

      if (compound.props) {
        for (const p of compound.props) {
          const urn = p.urn;
          const value = p.value;
          if (!urn) continue;

          if (urn.label === "Molecular Formula") {
            formula = value?.sval || "";
          } else if (urn.label === "Molecular Weight") {
            molecularWeight = value?.sval ? `${value.sval} g/mol` : "";
          } else if (urn.name === "Hydrogen Bond Acceptor") {
            properties.hBondAcceptors = value?.ival?.toString();
          } else if (urn.name === "Hydrogen Bond Donor") {
            properties.hBondDonors = value?.ival?.toString();
          } else if (urn.name === "Rotatable Bond") {
            properties.rotatableBonds = value?.ival?.toString();
          } else if (urn.label === "IUPAC Name") {
            if (urn.name === "Preferred") {
              properties.iupacName = value?.sval;
            } else if (urn.name === "Traditional") {
              properties.commonName = value?.sval;
            }
          } else if (urn.label === "Log P") {
            properties.logP = value?.fval?.toString() || value?.sval;
          } else if (urn.name === "Polar Surface Area") {
            properties.tpsa = value?.fval ? `${value.fval} Å²` : undefined;
          }
        }
      }

      // Prepare URLs
      const propsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Chemical+and+Physical+Properties`;
      const ghsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
      const synonymsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`;
      const descUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`;
      const structureUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`;

      // Initiate Fetches
      const propsPromise = fetch(propsUrl)
        .then((res) => res.json())
        .catch(() => null);

      const ghsPromise = fetch(ghsUrl)
        .then((res) => res.json())
        .catch(() => null);

      const synonymsPromise = fetch(synonymsUrl)
        .then((res) => res.json())
        .catch(() => ({}));

      const descPromise = fetch(descUrl)
        .then((res) => res.json())
        .catch(() => ({}));

      const structurePromise = fetch(structureUrl)
        .then((res) => res.text())
        .catch(() => "");

      const [propsJson, ghsJson, synonymsJson, descJson, sdfText] =
        await Promise.all([
          propsPromise,
          ghsPromise,
          synonymsPromise,
          descPromise,
          structurePromise,
        ]);

      // Process Experimental Properties
      if (propsJson) {
        try {
          const physicalProps = propsJson.Record?.Section?.[0];

          if (physicalProps && physicalProps.Section) {
            for (const subsection of physicalProps.Section) {
              if (
                subsection.TOCHeading === "Experimental Properties" &&
                subsection.Section
              ) {
                for (const expSection of subsection.Section) {
                  const heading = expSection.TOCHeading;
                  const info = expSection.Information?.[0];
                  const value = info?.Value?.StringWithMarkup?.[0]?.String;

                  if (heading === "Boiling Point" && value) {
                    // Show boiling point in C
                    properties.boilingPoint = value;
                  } else if (heading === "Melting Point" && value) {
                    properties.meltingPoint = value;
                  } else if (heading === "Solubility" && value) {
                    properties.solubility = value;
                  } else if (heading === "Density" && value) {
                    properties.density = value;
                  } else if (heading === "pH" && value) {
                    properties.pH = value;
                  }
                }
              }
            }
          }
        } catch {
          // Experimental properties error ignored
        }
      }

      // Process GHS and Safety data
      const safety: SafetyInfo = {};

      if (ghsJson) {
        try {
          const ghsSection =
            ghsJson.Record?.Section?.[0]?.Section?.[0]?.Section?.[0];

          if (ghsSection && ghsSection.Information) {
            for (const info of ghsSection.Information) {
              const name = info.Name;
              const values =
                info.Value?.StringWithMarkup?.map(
                  (v: { String?: string }) => v.String || "",
                ) || [];

              if (name === "Signal") {
                safety.signal = values;
              } else if (name === "GHS Hazard Statements") {
                safety.hazardStatements = values;
              }
            }
          }
        } catch {
          // GHS data error ignored
        }
      }

      // Process Synonyms
      const synonyms =
        synonymsJson.InformationList?.Information?.[0]?.Synonym?.slice(0, 10) ||
        [];

      // Process Description
      const descInfo = descJson.InformationList?.Information?.find(
        (info: PubChemInformation) => info.Description,
      );
      const description = descInfo?.Description || "No description available.";

      if (!sdfText || sdfText.length < 50) {
        Alert.alert(
          "No 3D Data",
          "No 3D structure available for this compound.",
        );
        setIsLoading(false);
        return;
      }

      setMoleculeData({
        name: term,
        sdf: sdfText,
        formula,
        molecularWeight,
        synonyms,
        description,
        cid: cid.toString(),
        properties,
        safety,
      });
    } catch {
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
