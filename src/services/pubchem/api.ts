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
  const structureUrl = `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`;

  // Fetch the Structures section from PubChem to find COD IDs
  const structuresViewUrl = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=Structures`;

  const [
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    initialSdfRes,
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
    fetch(structureUrl).catch(() => null),
    fetch(structuresViewUrl)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null) as Promise<PubChemViewResponse | null>,
  ]);

  // Priority 1: 3D SDF
  let sdfText = "";
  let structureFormat: "3d_sdf" | "cif" | "2d_sdf" = "2d_sdf";

  if (initialSdfRes?.ok) {
    const text = await initialSdfRes.text();
    // PubChem sometimes returns a 200 with "Status: 404" in the body for SDFs
    if (text && text.length > 200 && !text.includes("PUGREST.NotFound")) {
      sdfText = text;
      structureFormat = "3d_sdf";
    }
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
        if (structureFormat !== "3d_sdf") {
          structureFormat = "cif";
        }
      }
    } catch (error) {
      console.error(`Failed to fetch CIF data for COD ID ${codId}:`, error);
    }
  }

  // Priority 3: 2D SDF fallback
  if (structureFormat === "2d_sdf" && !sdfText) {
    try {
      const fallbackUrl = `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?response_type=display`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const text = await fallbackRes.text();
        if (text && !text.includes("PUGREST.NotFound")) {
          sdfText = text;
          structureFormat = "2d_sdf";
        }
      }
    } catch (error) {
      console.error(`Failed to fetch fallback 2D SDF for CID ${cid}:`, error);
    }
  }

  return {
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    sdfText,
    codId,
    cifText,
    structureFormat,
  };
};
