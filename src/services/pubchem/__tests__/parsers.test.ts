import {
  parseCompoundProps,
  parseExperimentalProperties,
  parseSafetyInfo,
  parseSynonyms,
  parseDescription,
} from "../parsers";
import {
  PubChemCompound,
  PubChemViewResponse,
  PubChemInformationResponse,
} from "../../../types/pubchem";

describe("PubChem Parsers", () => {
  describe("parseCompoundProps", () => {
    it("should extract basic properties correctly", () => {
      const mockCompound: PubChemCompound = {
        id: { id: { cid: 123 } },
        props: [
          { urn: { label: "Molecular Formula" }, value: { sval: "H2O" } },
          { urn: { label: "Molecular Weight" }, value: { sval: "18.015" } },
          { urn: { name: "Hydrogen Bond Acceptor" }, value: { ival: 1 } },
          { urn: { name: "Hydrogen Bond Donor" }, value: { ival: 2 } },
          { urn: { name: "Rotatable Bond" }, value: { ival: 0 } },
          {
            urn: { label: "IUPAC Name", name: "Preferred" },
            value: { sval: "oxidane" },
          },
          {
            urn: { label: "IUPAC Name", name: "Traditional" },
            value: { sval: "water" },
          },
          { urn: { label: "Log P" }, value: { fval: -1.38 } },
          { urn: { name: "Polar Surface Area" }, value: { fval: 1.0 } },
        ],
      };

      const result = parseCompoundProps(mockCompound);

      expect(result.formula).toBe("H2O");
      expect(result.molecularWeight).toBe("18.015 g/mol");
      expect(result.properties.hBondAcceptors).toBe("1");
      expect(result.properties.hBondDonors).toBe("2");
      expect(result.properties.rotatableBonds).toBe("0");
      expect(result.properties.iupacName).toBe("oxidane");
      expect(result.properties.commonName).toBe("water");
      expect(result.properties.logP).toBe("-1.38");
      expect(result.properties.tpsa).toBe("1 Å²");
    });

    it("should handle empty or missing properties", () => {
      const mockCompound: PubChemCompound = {
        id: { id: { cid: 123 } },
        props: [],
      };

      const result = parseCompoundProps(mockCompound);

      expect(result.formula).toBe("");
      expect(result.molecularWeight).toBe("");
      expect(result.properties).toEqual({});
    });

    it("should handle compound with no props field", () => {
      const mockCompound: PubChemCompound = {
        id: { id: { cid: 123 } },
      };
      const result = parseCompoundProps(mockCompound);
      expect(result.formula).toBe("");
      expect(result.properties).toEqual({});
    });
  });

  describe("parseExperimentalProperties", () => {
    it("should parse experimental properties from nested JSON", () => {
      const mockView: PubChemViewResponse = {
        Record: {
          Section: [
            {
              Section: [
                {
                  TOCHeading: "Experimental Properties",
                  Section: [
                    {
                      TOCHeading: "Boiling Point",
                      Information: [
                        { Value: { StringWithMarkup: [{ String: "100 °C" }] } },
                      ],
                    },
                    {
                      TOCHeading: "Melting Point",
                      Information: [
                        { Value: { StringWithMarkup: [{ String: "0 °C" }] } },
                      ],
                    },
                    {
                      TOCHeading: "Solubility",
                      Information: [
                        {
                          Value: { StringWithMarkup: [{ String: "Miscible" }] },
                        },
                      ],
                    },
                    {
                      TOCHeading: "Density",
                      Information: [
                        {
                          Value: {
                            StringWithMarkup: [{ String: "1.0 g/cm³" }],
                          },
                        },
                      ],
                    },
                    {
                      TOCHeading: "pH",
                      Information: [
                        { Value: { StringWithMarkup: [{ String: "7" }] } },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = parseExperimentalProperties(mockView);

      expect(result.boilingPoint).toBe("100 °C");
      expect(result.meltingPoint).toBe("0 °C");
      expect(result.solubility).toBe("Miscible");
      expect(result.density).toBe("1.0 g/cm³");
      expect(result.pH).toBe("7");
    });

    it("should return empty object for null input", () => {
      expect(parseExperimentalProperties(null)).toEqual({});
    });

    it("should handle missing experimental properties section", () => {
      const mockView: PubChemViewResponse = {
        Record: {
          Section: [{ Section: [{ TOCHeading: "Other Properties" }] }],
        },
      };
      expect(parseExperimentalProperties(mockView)).toEqual({});
    });
  });

  describe("parseSafetyInfo", () => {
    it("should parse GHS safety information", () => {
      const mockView: PubChemViewResponse = {
        Record: {
          Section: [
            {
              Section: [
                {
                  Section: [
                    {
                      Information: [
                        {
                          Name: "Signal",
                          Value: { StringWithMarkup: [{ String: "Danger" }] },
                        },
                        {
                          Name: "GHS Hazard Statements",
                          Value: {
                            StringWithMarkup: [
                              {
                                String:
                                  "H225: Highly flammable liquid and vapor",
                              },
                              { String: "H319: Causes serious eye irritation" },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const safety = parseSafetyInfo(mockView);

      expect(safety.signal).toEqual(["Danger"]);
      expect(safety.hazardStatements).toEqual([
        "H225: Highly flammable liquid and vapor",
        "H319: Causes serious eye irritation",
      ]);
    });

    it("should return empty object for null input", () => {
      expect(parseSafetyInfo(null)).toEqual({});
    });
  });

  describe("parseSynonyms", () => {
    it("should extract and limit synonyms to 10", () => {
      const mockResponse: PubChemInformationResponse = {
        InformationList: {
          Information: [
            {
              Synonym: [
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
              ],
            },
          ],
        },
      };

      const synonyms = parseSynonyms(mockResponse);

      expect(synonyms).toHaveLength(10);
      expect(synonyms).toEqual([
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
      ]);
    });

    it("should return empty array if no synonyms found", () => {
      const mockResponse: PubChemInformationResponse = {
        InformationList: { Information: [{}] },
      };
      expect(parseSynonyms(mockResponse)).toEqual([]);

      // Edge case: empty object
      expect(parseSynonyms({} as PubChemInformationResponse)).toEqual([]);

      // Edge case: InformationList present but missing Information
      expect(parseSynonyms({ InformationList: {} } as PubChemInformationResponse)).toEqual([]);
    });
  });

  describe("parseDescription", () => {
    it("should extract description correctly", () => {
      const mockResponse: PubChemInformationResponse = {
        InformationList: {
          Information: [{}, { Description: "This is a test description." }],
        },
      };

      const description = parseDescription(mockResponse);

      expect(description).toBe("This is a test description.");
    });

    it("should return fallback message if no description found", () => {
      const mockResponse: PubChemInformationResponse = {
        InformationList: {
          Information: [{}],
        },
      };

      const description = parseDescription(mockResponse);

      expect(description).toBe("No description available.");
    });
  });
});
