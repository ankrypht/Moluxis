import { MoleculeInfo } from "../../types";
import { fetchCompoundByName, fetchMoleculeDetails } from "./api";
import {
  parseCompoundProps,
  parseExperimentalProperties,
  parseSafetyInfo,
  parseSynonyms,
  parseDescription,
} from "./parsers";
import { isValidId } from "./utils";

export const fetchMoleculeData = async (
  term: string,
): Promise<MoleculeInfo> => {
  // Get initial compound data by name
  const searchJson = await fetchCompoundByName(term);
  if (!searchJson.PC_Compounds || searchJson.PC_Compounds.length === 0) {
    throw new Error("Could not find a molecule with that name.");
  }

  const compound = searchJson.PC_Compounds[0];
  const cid = compound.id.id.cid;

  // Validate Compound ID (Security: Prevent path traversal/malicious IDs)
  if (typeof cid !== "number" || !Number.isInteger(cid) || cid <= 0) {
    throw new Error("Received invalid data from the chemical database.");
  }

  // Extract basic props
  const { formula, molecularWeight, properties } = parseCompoundProps(compound);

  // Fetch all remaining details in parallel
  const {
    propsJson,
    ghsJson,
    synonymsJson,
    descJson,
    sdfText3d,
    sdfText2d,
    cifText,
    codId,
    useCif,
  } = await fetchMoleculeDetails(cid);

  // Parse additional data
  const experimentalProps = parseExperimentalProperties(propsJson);
  Object.assign(properties, experimentalProps);

  const safety = parseSafetyInfo(ghsJson);
  const synonyms = synonymsJson ? parseSynonyms(synonymsJson) : [];
  const description = descJson
    ? parseDescription(descJson)
    : "No description available.";

  if (!sdfText3d && !cifText && !sdfText2d) {
    throw new Error("No structure available for this compound.");
  }

  return {
    name: term,
    sdf3d: sdfText3d,
    sdf2d: sdfText2d,
    cif: cifText,
    codId: isValidId(codId) ? codId : null,
    useCif,
    formula,
    molecularWeight,
    synonyms,
    description,
    cid: cid.toString(),
    properties,
    safety,
  };
};
