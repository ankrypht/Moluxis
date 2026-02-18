import { useState } from "react";
import { Alert, Keyboard } from "react-native";
import { MoleculeInfo, ChemicalProperties, SafetyInfo } from "../types";

export const useMoleculeSearch = () => {
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [moleculeData, setMoleculeData] = useState<MoleculeInfo | null>(null);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${text}/json?limit=6`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.dictionary_terms && json.dictionary_terms.compound) {
        setSuggestions(json.dictionary_terms.compound);
        setShowSuggestions(true);
      }
    } catch (e) {
      // Autocomplete error ignored
    }
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    fetchSuggestions(text);
  };

  const searchMolecule = async (queryName?: string) => {
    const term = queryName || searchText;
    if (!term.trim()) return;

    Keyboard.dismiss();
    setShowSuggestions(false);
    setIsLoading(true);
    setMoleculeData(null);

    try {
      // Get compound data
      const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${term}/JSON`;
      const searchRes = await fetch(searchUrl);
      const searchJson = await searchRes.json();

      if (!searchJson.PC_Compounds) {
        Alert.alert("Not Found", "Could not find a molecule with that name.");
        setIsLoading(false);
        return;
      }

      const compound = searchJson.PC_Compounds[0];
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

      // Fetch additional experimental properties
      try {
        const propsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=Chemical+and+Physical+Properties`;
        const propsRes = await fetch(propsUrl);
        const propsJson = await propsRes.json();

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
      } catch (e) {
        // Experimental properties error ignored
      }

      // Fetch GHS and Safety data
      const safety: SafetyInfo = {};

      try {
        const ghsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
        const ghsRes = await fetch(ghsUrl);
        const ghsJson = await ghsRes.json();

        const ghsSection =
          ghsJson.Record?.Section?.[0]?.Section?.[0]?.Section?.[0];

        if (ghsSection && ghsSection.Information) {
          for (const info of ghsSection.Information) {
            const name = info.Name;
            const values =
              info.Value?.StringWithMarkup?.map((v: any) => v.String) || [];

            if (name === "Signal") {
              safety.signal = values;
            } else if (name === "GHS Hazard Statements") {
              safety.hazardStatements = values;
            }
          }
        }
      } catch (e) {
        // GHS data error ignored
      }

      // Get synonyms
      const synonymsUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/JSON`;
      const synonymsRes = await fetch(synonymsUrl);
      const synonymsJson = await synonymsRes.json();
      const synonyms =
        synonymsJson.InformationList?.Information?.[0]?.Synonym?.slice(0, 10) ||
        [];

      // Get description
      const descUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/description/JSON`;
      const descRes = await fetch(descUrl);
      const descJson = await descRes.json();

      const descInfo = descJson.InformationList?.Information?.find(
        (info: any) => info.Description,
      );
      const description = descInfo?.Description || "No description available.";

      // Get 3D structure
      const structureUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`;
      const structureRes = await fetch(structureUrl);
      const sdfText = await structureRes.text();

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
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (item: string) => {
    setSearchText(item);
    setShowSuggestions(false);
    searchMolecule(item);
  };

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
