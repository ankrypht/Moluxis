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
export const fetchAutocomplete = async (text: string): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/autocomplete/compound/${encodeURIComponent(
      text,
    )}/json?limit=6`;
    const res = await fetch(url);
    const json: PubChemAutocompleteResponse = await res.json();
    if (json.dictionary_terms && json.dictionary_terms.compound) {
      return [...new Set(json.dictionary_terms.compound)];
    }
    return [];
  } catch (error) {
    // Autocomplete failure is non-critical, log and return empty list
    console.error(
      "Autocomplete fetch failed:",
      error instanceof Error ? error.message : error,
    );
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
 * Helper function to safely extract the COD ID from PubChem's deeply nested PUG View JSON.
 */
const findCodId = (obj: any): string | null => {
  if (!obj || typeof obj !== "object") return null;

  // Look for the specific node where PubChem lists the COD ID
  if (obj.Name === "COD Number" && obj.Value?.StringWithMarkup) {
    return obj.Value.StringWithMarkup[0].String; // Returns the ID as a string
  }

  // Recursively search children
  for (const key of Object.keys(obj)) {
    const result = findCodId(obj[key]);
    if (result) return result;
  }

  return null;
};

/**
 * Fetches all additional molecule details, including inorganic CIF data if available.
 */
export const fetchMoleculeDetails = async (cid: number) => {
  const propsUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=Chemical+and+Physical+Properties`;
  const ghsUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=GHS+Classification`;
  const synonymsUrl = `${BASE_URL}/pug/compound/cid/${cid}/synonyms/JSON`;
  const descUrl = `${BASE_URL}/pug/compound/cid/${cid}/description/JSON`;
  const structure3dUrl = `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`;
  const structure2dUrl = `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?response_type=display`;

  // Fetch the Structures section from PubChem to find COD IDs
  const structuresViewUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=Structures`;

  const [
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    initialSdf3dRes,
    initialSdf2dRes,
    structuresJson,
  ] = await Promise.all([
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
    fetch(structure3dUrl).catch(() => null),
    fetch(structure2dUrl).catch(() => null),
    fetch(structuresViewUrl)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null) as Promise<PubChemViewResponse | null>,
  ]);

  // Priority 1: 3D SDF
  let sdfText3d = "";
  let sdfText2d = "";
  let useCif = false;

  if (initialSdf3dRes?.ok) {
    const text = await initialSdf3dRes.text();
    // PubChem sometimes returns a 200 with "Status: 404" in the body for SDFs
    if (text && text.length > 200 && !text.includes("PUGREST.NotFound"))
      sdfText3d = text;
  }

  if (initialSdf2dRes?.ok) {
    const text = await initialSdf2dRes.text();
    if (text && text.length > 200 && !text.includes("PUGREST.NotFound"))
      sdfText2d = text;
  }

  // Priority 2: Crystal Structure (CIF) if 3D SDF is not available
  const codId = findCodId(structuresJson);
  let cifText = "";

  if (codId) {
    try {
      const cifRes = await fetch(
        `https://www.crystallography.net/cod/${codId}.cif`,
      );
      if (cifRes.ok) {
        cifText = await cifRes.text();
        // Only use CIF if we don't already have a 3D SDF
        if (sdfText3d === "") {
          useCif = true;
        }
      }
    } catch (error) {
      console.error(`Failed to fetch CIF data for COD ID ${codId}:`, error);
    }
  }

  return {
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    sdfText3d,
    sdfText2d,
    codId,
    cifText,
    useCif,
  };
};
