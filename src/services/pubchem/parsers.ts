import { ChemicalProperties } from "../../types";
import { PubChemSection } from "../../types/pubchem";

/**
 * Parses experimental properties from a PubChem PUG View section.
 *
 * @param subsection - The PubChem section containing experimental properties.
 * @param properties - The ChemicalProperties object to update.
 */
export const parseExperimentalProperties = (
  subsection: PubChemSection,
  properties: ChemicalProperties,
): void => {
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
};
