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
      console.log("Autocomplete error", e);
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

      // Extract molecular formula and weight
      let formula = "";
      let molecularWeight = "";

      if (compound.props) {
        const formulaProp = compound.props.find(
          (p: any) => p.urn?.label === "Molecular Formula",
        );
        const weightProp = compound.props.find(
          (p: any) => p.urn?.label === "Molecular Weight",
        );

        formula = formulaProp?.value?.sval || "";
        molecularWeight = weightProp?.value?.sval
          ? `${weightProp.value.sval} g/mol`
          : "";
      }

      // Extract chemical properties from compound props
      const properties: ChemicalProperties = {};

      if (compound.props) {
        const hAcceptorProp = compound.props.find(
          (p: any) => p.urn?.name === "Hydrogen Bond Acceptor",
        );
        const hDonorProp = compound.props.find(
          (p: any) => p.urn?.name === "Hydrogen Bond Donor",
        );
        const rotatableProp = compound.props.find(
          (p: any) => p.urn?.name === "Rotatable Bond",
        );
        const iupacProp = compound.props.find(
          (p: any) =>
            p.urn?.label === "IUPAC Name" && p.urn?.name === "Preferred",
        );
        const iupacTradProp = compound.props.find(
          (p: any) =>
            p.urn?.label === "IUPAC Name" && p.urn?.name === "Traditional",
        );
        const logPProp = compound.props.find(
          (p: any) => p.urn?.label === "Log P",
        );
        const tpsaProp = compound.props.find(
          (p: any) => p.urn?.name === "Polar Surface Area",
        );

        properties.hBondAcceptors = hAcceptorProp?.value?.ival?.toString();
        properties.hBondDonors = hDonorProp?.value?.ival?.toString();
        properties.rotatableBonds = rotatableProp?.value?.ival?.toString();
        properties.iupacName = iupacProp?.value?.sval;
        properties.commonName = iupacTradProp?.value?.sval;
        properties.logP =
          logPProp?.value?.fval?.toString() || logPProp?.value?.sval;
        properties.tpsa = tpsaProp?.value?.fval
          ? `${tpsaProp.value.fval} Å²`
          : undefined;
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
        console.log("Error fetching experimental properties", e);
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
        console.log("Error fetching GHS data", e);
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
      console.log(error);
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
