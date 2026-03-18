import { ChemicalProperties, SafetyInfo } from "../../types";
import {
  PubChemCompound,
  PubChemViewResponse,
  PubChemInformationResponse,
  PubChemInformation,
} from "../../types/pubchem";

/**
 * Extracts basic properties (formula, weight, etc.) from a PubChem compound object.
 */
export const parseCompoundProps = (compound: PubChemCompound) => {
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

  return { formula, molecularWeight, properties };
};

/**
 * Parses experimental properties from PUG View JSON.
 */
export const parseExperimentalProperties = (
  propsJson: PubChemViewResponse | null,
): Partial<ChemicalProperties> => {
  const properties: Partial<ChemicalProperties> = {};
  if (!propsJson) return properties;

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
  } catch (error) {
    console.error("Error parsing experimental properties:", error);
  }
  return properties;
};

/**
 * Parses GHS and safety data from PUG View JSON.
 */
export const parseSafetyInfo = (
  ghsJson: PubChemViewResponse | null,
): SafetyInfo => {
  const safety: SafetyInfo = {};
  if (!ghsJson) return safety;

  try {
    const ghsSection = ghsJson.Record?.Section?.[0]?.Section?.[0]?.Section?.[0];

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
  } catch (error) {
    console.error("Error parsing safety info:", error);
  }
  return safety;
};

/**
 * Extracts synonyms from InformationList JSON.
 */
export const parseSynonyms = (
  synonymsJson: PubChemInformationResponse,
): string[] => {
  return (
    synonymsJson.InformationList?.Information?.[0]?.Synonym?.slice(0, 10) || []
  );
};

/**
 * Extracts description from InformationList JSON.
 */
export const parseDescription = (
  descJson: PubChemInformationResponse,
): string => {
  const descInfo = descJson.InformationList?.Information?.find(
    (info: PubChemInformation) => info.Description,
  );
  return descInfo?.Description || "No description available.";
};
