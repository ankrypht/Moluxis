import {
  PubChemAutocompleteResponse,
  PubChemCompoundResponse,
  PubChemViewResponse,
  PubChemInformationResponse,
} from "../../types/pubchem";

const BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest";

/**
 * Fetches compound name suggestions for the autocomplete.
 */
export const fetchAutocomplete = async (
  text: string,
): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/autocomplete/compound/${encodeURIComponent(
      text,
    )}/json?limit=6`;
    const res = await fetch(url);
    const json: PubChemAutocompleteResponse = await res.json();
    if (json.dictionary_terms && json.dictionary_terms.compound) {
      return Array.from(new Set(json.dictionary_terms.compound));
    }
    return [];
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return [];
  }
};

/**
 * Fetches basic compound record by name.
 */
export const fetchCompoundByName = async (
  name: string,
): Promise<PubChemCompoundResponse> => {
  const url = `${BASE_URL}/pug/compound/name/${encodeURIComponent(name)}/JSON`;
  const res = await fetch(url);
  return res.json();
};

/**
 * Fetches all additional molecule details in parallel for a given CID.
 */
export const fetchMoleculeDetails = async (cid: number) => {
  const propsUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=Chemical+and+Physical+Properties`;
  const ghsUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
  const synonymsUrl = `${BASE_URL}/pug/compound/cid/${cid}/synonyms/JSON`;
  const descUrl = `${BASE_URL}/pug/compound/cid/${cid}/description/JSON`;
  const structureUrl = `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`;

  const [propsJson, ghsJson, synonymsJson, descJson, sdfText] =
    await Promise.all([
      fetch(propsUrl)
        .then((res) => res.json())
        .catch(() => null) as Promise<PubChemViewResponse | null>,
      fetch(ghsUrl)
        .then((res) => res.json())
        .catch(() => null) as Promise<PubChemViewResponse | null>,
      fetch(synonymsUrl)
        .then((res) => res.json())
        .catch(() => ({})) as Promise<PubChemInformationResponse>,
      fetch(descUrl)
        .then((res) => res.json())
        .catch(() => ({})) as Promise<PubChemInformationResponse>,
      fetch(structureUrl)
        .then((res) => res.text())
        .catch(() => "") as Promise<string>,
    ]);

  return { propsJson, ghsJson, synonymsJson, descJson, sdfText };
};
