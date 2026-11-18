import { has3dStructure, getDefaultStructureFormat } from "../structure";
import { MoleculeInfo } from "../../types";

describe("structure utilities", () => {
  describe("has3dStructure", () => {
    it("returns false for null or undefined", () => {
      expect(has3dStructure(null)).toBe(false);
      expect(has3dStructure(undefined)).toBe(false);
    });

    it("returns true when sdf3d is present", () => {
      const data = { sdf3d: "mock-3d-data" } as MoleculeInfo;
      expect(has3dStructure(data)).toBe(true);
    });

    it("returns true when useCif is true", () => {
      const data = { useCif: true } as MoleculeInfo;
      expect(has3dStructure(data)).toBe(true);
    });

    it("returns false when neither sdf3d nor useCif is present", () => {
      const data = { sdf2d: "mock-2d-data" } as MoleculeInfo;
      expect(has3dStructure(data)).toBe(false);
    });
  });

  describe("getDefaultStructureFormat", () => {
    it("defaults to 3d for null or undefined", () => {
      expect(getDefaultStructureFormat(null)).toBe("3d");
      expect(getDefaultStructureFormat(undefined)).toBe("3d");
    });

    it("returns 2d when 2d structure exists but 3d does not", () => {
      const data = { sdf2d: "mock-2d-data" } as MoleculeInfo;
      expect(getDefaultStructureFormat(data)).toBe("2d");
    });

    it("returns 3d when 3d structure exists even if 2d exists", () => {
      const data = {
        sdf2d: "mock-2d-data",
        sdf3d: "mock-3d-data",
      } as MoleculeInfo;
      expect(getDefaultStructureFormat(data)).toBe("3d");
    });

    it("returns 3d when neither 2d nor 3d structure exists", () => {
      const data = {} as MoleculeInfo;
      expect(getDefaultStructureFormat(data)).toBe("3d");
    });
  });
});
