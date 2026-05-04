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
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findCodId(obj[key]);
      if (result) return result;
    }
  }

  return null;
};

/**
 * Fetches PUG View data for a specific heading.
 */
const fetchPugView = async (
  cid: number,
  heading: string,
): Promise<PubChemViewResponse | null> => {
  try {
    const url = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=${encodeURIComponent(heading)}`;
    const res = await fetch(url);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};

/**
 * Fetches compound information (synonyms or description).
 */
const fetchPugInformation = async (
  cid: number,
  type: "synonyms" | "description",
): Promise<PubChemInformationResponse> => {
  try {
    const url = `${BASE_URL}/pug/compound/cid/${cid}/${type}/JSON`;
    const res = await fetch(url);
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
};

/**
 * Fetches and validates SDF text (2D or 3D).
 */
const fetchSdf = async (cid: number, is3d: boolean): Promise<string> => {
  try {
    const url = is3d
      ? `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`
      : `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?response_type=display`;
    const res = await fetch(url);
    if (!res.ok) return "";

    const text = await res.text();
    // PubChem sometimes returns a 200 with "Status: 404" in the body for SDFs
    if (text && text.length > 200 && !text.includes("PUGREST.NotFound")) {
      return text;
    }
    return "";
  } catch {
    return "";
  }
};

/**
 * Fetches CIF data from the crystallography.net external source.
 */
const fetchCifData = async (codId: string): Promise<string> => {
  try {
    const url = `https://www.crystallography.net/cod/${codId}.cif`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
    return "";
  } catch (error) {
    console.error(`Failed to fetch CIF data for COD ID ${codId}:`, error);
    return "";
  }
};

/**
 * Fetches all additional molecule details, including inorganic CIF data if available.
 */
export const fetchMoleculeDetails = async (cid: number) => {
  const [
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    sdfText3d,
    sdfText2d,
    structuresJson,
  ] = await Promise.all([
    fetchPugView(cid, "Chemical and Physical Properties"),
    fetchPugView(cid, "GHS Classification"),
    fetchPugInformation(cid, "synonyms"),
    fetchPugInformation(cid, "description"),
    fetchSdf(cid, true),
    fetchSdf(cid, false),
    fetchPugView(cid, "Structures"),
  ]);

  // Priority 1: 3D SDF
  let useCif = false;
  let cifText = "";

  // Priority 2: Crystal Structure (CIF) if 3D SDF is not available
  const codId = findCodId(structuresJson);

  if (codId) {
    cifText = await fetchCifData(codId);
    // Only use CIF if we don't already have a 3D SDF
    if (cifText && sdfText3d === "") {
      useCif = true;
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
