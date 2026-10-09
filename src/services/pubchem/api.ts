import {
  PubChemAutocompleteResponse,
  PubChemCompoundResponse,
  PubChemViewResponse,
  PubChemInformationResponse,
} from "../../types/pubchem";
import { isAbortError, isValidId } from "./utils";
import { queuedFetch } from "./requestQueue";
import { PubChemThrottledError } from "./circuitBreaker";

const BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest";

/**
 * Fetches compound name suggestions for the autocomplete.
 * Accepts an optional AbortSignal to cancel in-flight requests when the user
 * types again before the previous request completes.
 */
export const fetchAutocomplete = async (
  text: string,
  signal?: AbortSignal,
): Promise<string[]> => {
  try {
    const url = `${BASE_URL}/autocomplete/compound/${encodeURIComponent(
      text,
    )}/json?limit=6`;
    const res = await queuedFetch(url, { signal, skipCircuitBreaker: true });
    const json: PubChemAutocompleteResponse = await res.json();
    if (json.dictionary_terms && json.dictionary_terms.compound) {
      return [...new Set(json.dictionary_terms.compound)];
    }
    return [];
  } catch (error) {
    // Abort/cancellation is expected when the user types or submits search — silently ignore
    if (isAbortError(error, signal)) return [];
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
  signal?: AbortSignal,
): Promise<PubChemCompoundResponse> => {
  const url = `${BASE_URL}/pug/compound/name/${encodeURIComponent(name)}/JSON`;
  const res = await queuedFetch(url, { signal });
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
  for (const value of Object.values(obj)) {
    const result = findCodId(value);
    if (result) return result;
  }

  return null;
};

/**
 * Fetches PUG View data for a specific heading.
 */
const fetchPugView = async (
  cid: number,
  heading: string,
  signal?: AbortSignal,
): Promise<PubChemViewResponse | null> => {
  try {
    const url = `${BASE_URL}/pug_view/data/compound/${cid}/JSON?heading=${encodeURIComponent(heading)}`;
    const res = await queuedFetch(url, { signal });
    return res.ok ? await res.json() : null;
  } catch (error) {
    if (error instanceof PubChemThrottledError) throw error;
    if (isAbortError(error, signal)) throw error;
    return null;
  }
};

/**
 * Fetches compound information (synonyms or description).
 */
const fetchPugInformation = async (
  cid: number,
  type: "synonyms" | "description",
  signal?: AbortSignal,
): Promise<PubChemInformationResponse> => {
  try {
    const url = `${BASE_URL}/pug/compound/cid/${cid}/${type}/JSON`;
    const res = await queuedFetch(url, { signal });
    return res.ok ? await res.json() : {};
  } catch (error) {
    if (error instanceof PubChemThrottledError) throw error;
    if (isAbortError(error, signal)) throw error;
    return {};
  }
};

/**
 * Fetches and validates SDF text (2D or 3D).
 */
export const fetchSdf = async (
  cid: number,
  is3d: boolean,
  signal?: AbortSignal,
): Promise<string> => {
  try {
    const url = is3d
      ? `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?record_type=3d&response_type=display`
      : `${BASE_URL}/pug/compound/CID/${cid}/record/SDF/?response_type=display`;
    const res = await queuedFetch(url, { signal });
    if (!res.ok) return "";

    const text = await res.text();
    // PubChem sometimes returns a 200 with "Status: 404" in the body for SDFs
    if (text && text.length > 200 && !text.includes("PUGREST.NotFound")) {
      return text;
    }
    return "";
  } catch (error) {
    if (error instanceof PubChemThrottledError) throw error;
    if (isAbortError(error, signal)) throw error;
    return "";
  }
};

/**
 * Fetches CIF data from the crystallography.net external source.
 * Uses standard fetch with isolated error handling to avoid coupling to PubChem rate limits.
 */
const fetchCifData = async (
  codId: string,
  signal?: AbortSignal,
): Promise<string> => {
  try {
    const url = `https://www.crystallography.net/cod/${codId}.cif`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      return await res.text();
    }
    return "";
  } catch (error) {
    if (isAbortError(error, signal)) throw error;
    console.error(`Failed to fetch CIF data for COD ID ${codId}:`, error);
    return "";
  }
};

/**
 * Fetches all additional molecule details using a staged waterfall strategy.
 * All requests are routed through the rate-limiting RequestQueue with concurrency control.
 */
export const fetchMoleculeDetails = async (
  cid: number,
  signal?: AbortSignal,
) => {
  // Stage 1: Fetch primary attributes, 3D SDF, and 2D SDF (so user can switch between 3D and 2D)
  const [propsJson, ghsJson, synonymsJson, descJson, sdfText3d, sdfText2d] =
    await Promise.all([
      fetchPugView(cid, "Chemical and Physical Properties", signal),
      fetchPugView(cid, "GHS Classification", signal),
      fetchPugInformation(cid, "synonyms", signal),
      fetchPugInformation(cid, "description", signal),
      fetchSdf(cid, true, signal),
      fetchSdf(cid, false, signal),
    ]);

  let useCif = false;
  let cifText = "";
  let codId: string | null = null;

  // Stage 2: Fallback logic ONLY if 3D SDF is absent.
  // If 3D SDF exists, fetching Structures PUG View (and external CIF) is completely skipped.
  if (!sdfText3d) {
    const structuresJson = await fetchPugView(cid, "Structures", signal);

    const rawCodId = findCodId(structuresJson);
    codId = isValidId(rawCodId) ? rawCodId : null;

    if (codId) {
      cifText = await fetchCifData(codId, signal);
      if (cifText) {
        useCif = true;
      }
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
