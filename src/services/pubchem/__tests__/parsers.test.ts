import { parseCompoundProps } from "../parsers";
import { PubChemCompound } from "../../../types/pubchem";

describe("parseCompoundProps", () => {
  it("should correctly parse various compound properties", () => {
    const mockCompound: PubChemCompound = {
      id: { id: { cid: 123 } },
      props: [
        { urn: { label: "Molecular Formula" }, value: { sval: "H2O" } },
        { urn: { label: "Molecular Weight" }, value: { sval: "18.015" } },
        { urn: { name: "Hydrogen Bond Acceptor" }, value: { ival: 1 } },
        { urn: { name: "Hydrogen Bond Donor" }, value: { ival: 2 } },
        { urn: { name: "Rotatable Bond" }, value: { ival: 0 } },
        { urn: { label: "IUPAC Name", name: "Preferred" }, value: { sval: "oxidane" } },
        { urn: { label: "IUPAC Name", name: "Traditional" }, value: { sval: "water" } },
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

  it("should handle missing or partial data", () => {
    const mockCompound: PubChemCompound = {
      id: { id: { cid: 456 } },
      props: [
        { urn: { label: "Molecular Formula" }, value: { sval: "C6H12O6" } },
        // Missing Molecular Weight
        { urn: { name: "Hydrogen Bond Acceptor" }, value: { ival: 6 } },
      ],
    };

    const result = parseCompoundProps(mockCompound);

    expect(result.formula).toBe("C6H12O6");
    expect(result.molecularWeight).toBe("");
    expect(result.properties.hBondAcceptors).toBe("6");
    expect(result.properties.hBondDonors).toBeUndefined();
  });

  it("should handle empty props", () => {
    const mockCompound: PubChemCompound = {
        id: { id: { cid: 789 } },
        props: []
    };
    const result = parseCompoundProps(mockCompound);
    expect(result.formula).toBe("");
    expect(result.properties).toEqual({});
  });
});
