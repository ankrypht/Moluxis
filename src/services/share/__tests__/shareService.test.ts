import { Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  buildCompoundShareText,
  getCompoundPubChemUrl,
  shareCompoundDetails,
  sharePubChemLink,
  shareNameAndFormula,
  shareSnapshotImage,
} from "../shareService";
import { MoleculeInfo } from "../../../types";

jest.mock("react-native", () => ({
  Share: {
    share: jest.fn().mockResolvedValue({ action: "sharedAction" }),
  },
  Platform: {
    OS: "android",
  },
}));

jest.mock("expo-file-system/legacy", () => ({
  cacheDirectory: "file:///mock-cache/",
  documentDirectory: "file:///mock-docs/",
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    Base64: "base64",
  },
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const mockMolecule: MoleculeInfo = {
  name: "Caffeine",
  formula: "C8H10N4O2",
  molecularWeight: "194.19 g/mol",
  cid: "2519",
  sdf2d: "sdf2d-data",
  sdf3d: "sdf3d-data",
  cif: "",
  codId: null,
  useCif: false,
  synonyms: ["caffeine"],
  description: "A stimulant",
  properties: {},
  safety: {},
};

describe("shareService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompoundPubChemUrl", () => {
    it("returns correct URL for valid CID", () => {
      expect(getCompoundPubChemUrl("2519")).toBe(
        "https://pubchem.ncbi.nlm.nih.gov/compound/2519",
      );
    });

    it("returns null for invalid or missing CID", () => {
      expect(getCompoundPubChemUrl(null)).toBeNull();
      expect(getCompoundPubChemUrl("")).toBeNull();
      expect(getCompoundPubChemUrl("abc")).toBeNull();
    });
  });

  describe("buildCompoundShareText", () => {
    it("formats compound details nicely", () => {
      const text = buildCompoundShareText(mockMolecule);
      expect(text).toContain("🔬 Caffeine (C₈H₁₀N₄O₂)");
      expect(text).toContain("Molecular Weight: 194.19 g/mol");
      expect(text).toContain(
        "PubChem: https://pubchem.ncbi.nlm.nih.gov/compound/2519",
      );
      expect(text).toContain("Explored with Moluxis 3D Molecule Explorer");
    });

    it("handles compound without formula or CID", () => {
      const text = buildCompoundShareText({
        ...mockMolecule,
        formula: "",
        cid: "",
        molecularWeight: "",
      });
      expect(text).toContain("🔬 Caffeine");
      expect(text).not.toContain("PubChem:");
    });
  });

  describe("shareCompoundDetails", () => {
    it("invokes Share.share with formatted text", async () => {
      const result = await shareCompoundDetails(mockMolecule);
      expect(result).toBe(true);
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Caffeine - Moluxis",
          message: expect.stringContaining("🔬 Caffeine (C₈H₁₀N₄O₂)"),
          url: "https://pubchem.ncbi.nlm.nih.gov/compound/2519",
        }),
      );
    });

    it("handles errors gracefully and returns false", async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(
        new Error("Share error"),
      );
      const result = await shareCompoundDetails(mockMolecule);
      expect(result).toBe(false);
    });
  });

  describe("sharePubChemLink", () => {
    it("shares pubchem link when valid CID exists", async () => {
      const result = await sharePubChemLink(mockMolecule);
      expect(result).toBe(true);
      expect(Share.share).toHaveBeenCalledWith({
        title: "Caffeine on PubChem",
        message:
          "Caffeine on PubChem: https://pubchem.ncbi.nlm.nih.gov/compound/2519",
        url: "https://pubchem.ncbi.nlm.nih.gov/compound/2519",
      });
    });

    it("returns false if CID is invalid", async () => {
      const result = await sharePubChemLink({ ...mockMolecule, cid: "bad" });
      expect(result).toBe(false);
      expect(Share.share).not.toHaveBeenCalled();
    });
  });

  describe("shareNameAndFormula", () => {
    it("shares name and formula", async () => {
      const result = await shareNameAndFormula(mockMolecule);
      expect(result).toBe(true);
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Caffeine Formula",
          message: expect.stringContaining("Caffeine (C₈H₁₀N₄O₂)"),
        }),
      );
    });
  });

  describe("shareSnapshotImage", () => {
    it("writes base64 file to cache and calls Sharing.shareAsync", async () => {
      const mockUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";
      const result = await shareSnapshotImage(mockUri, "Caffeine");
      expect(result).toBe(true);
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        "file:///mock-cache/moluxis_caffeine_snapshot.png",
        "iVBORw0KGgoAAAANSUhEUgAA",
        { encoding: "base64" },
      );
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        "file:///mock-cache/moluxis_caffeine_snapshot.png",
        expect.objectContaining({
          mimeType: "image/png",
          dialogTitle: "Share Caffeine 3D Snapshot",
        }),
      );
    });

    it("falls back to Share.share if Sharing is not available", async () => {
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
      const mockUri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA";
      const result = await shareSnapshotImage(mockUri, "Caffeine");
      expect(result).toBe(true);
      expect(Share.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Caffeine 3D Snapshot",
        }),
      );
    });

    it("returns false if invalid dataUri is passed", async () => {
      const result = await shareSnapshotImage("not-base64", "Caffeine");
      expect(result).toBe(false);
    });
  });
});
