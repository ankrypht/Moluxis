import {
  getCachedMolecule,
  saveCachedMolecule,
  setMoleculePinned,
  removeCachedMolecule,
  clearMoleculeDiskCache,
  getDiskCacheIndex,
  MAX_DISK_CACHE_ITEMS,
} from "../moleculeDiskCache";
import { MoleculeInfo } from "../../../types";

const mockStorageMap = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockStorageMap.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorageMap.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorageMap.delete(key);
  }),
  multiRemove: jest.fn(async (keys: string[]) => {
    keys.forEach((k) => mockStorageMap.delete(k));
  }),
  clear: jest.fn(async () => {
    mockStorageMap.clear();
  }),
}));

const createMockMolecule = (name: string, cid = "123"): MoleculeInfo => ({
  name,
  cid,
  formula: "H2O",
  molecularWeight: "18.015 g/mol",
  sdf3d: "mock-3d-sdf-data",
  sdf2d: "mock-2d-sdf-data",
  cif: "",
  codId: null,
  useCif: false,
  synonyms: ["Water", "Oxidane"],
  description: "Essential chemical compound.",
  properties: {
    boilingPoint: "100 °C",
    meltingPoint: "0 °C",
  },
  safety: {
    signal: ["None"],
  },
});

describe("moleculeDiskCache", () => {
  beforeEach(async () => {
    mockStorageMap.clear();
  });

  it("should return null for non-existent molecule", async () => {
    const result = await getCachedMolecule("NonExistent");
    expect(result).toBeNull();
  });

  it("should save and retrieve a molecule from disk cache", async () => {
    const mol = createMockMolecule("Water", "962");
    await saveCachedMolecule(mol);

    const retrieved = await getCachedMolecule("Water");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe("Water");
    expect(retrieved?.cid).toBe("962");
    expect(retrieved?.sdf3d).toBe("mock-3d-sdf-data");
  });

  it("should retrieve molecule case-insensitively", async () => {
    const mol = createMockMolecule("Caffeine", "2519");
    await saveCachedMolecule(mol);

    const retrieved = await getCachedMolecule("caffeine");
    expect(retrieved?.name).toBe("Caffeine");
  });

  it("should retrieve molecule by CID", async () => {
    const mol = createMockMolecule("Aspirin", "2244");
    await saveCachedMolecule(mol);

    const retrieved = await getCachedMolecule("2244");
    expect(retrieved?.name).toBe("Aspirin");
  });

  it("should remove molecule from cache", async () => {
    const mol = createMockMolecule("Ethanol", "702");
    await saveCachedMolecule(mol);

    await removeCachedMolecule("ethanol");
    const retrieved = await getCachedMolecule("Ethanol");
    expect(retrieved).toBeNull();
  });

  it("should clear the entire disk cache", async () => {
    await saveCachedMolecule(createMockMolecule("Water"));
    await saveCachedMolecule(createMockMolecule("Aspirin"));

    await clearMoleculeDiskCache();
    expect(await getCachedMolecule("Water")).toBeNull();
    expect(await getCachedMolecule("Aspirin")).toBeNull();
  });

  it("should protect pinned molecules from LRU eviction", async () => {
    // Save a pinned molecule
    const pinnedMol = createMockMolecule("PinnedMol", "1");
    await saveCachedMolecule(pinnedMol, true);

    // Fill cache to capacity with unpinned molecules
    for (let i = 2; i <= MAX_DISK_CACHE_ITEMS + 2; i++) {
      await saveCachedMolecule(createMockMolecule(`Mol_${i}`, `${i}`), false);
    }

    // Pinned molecule must still be present
    const pinned = await getCachedMolecule("PinnedMol");
    expect(pinned).not.toBeNull();
  });

  it("should allow updating pin status dynamically", async () => {
    const mol = createMockMolecule("TestMol", "99");
    await saveCachedMolecule(mol, false);

    await setMoleculePinned("TestMol", true);
    const index = await getDiskCacheIndex();
    expect(index.find((e) => e.normalizedName === "testmol")?.isPinned).toBe(
      true,
    );

    await setMoleculePinned("TestMol", false);
    const updatedIndex = await getDiskCacheIndex();
    expect(
      updatedIndex.find((e) => e.normalizedName === "testmol")?.isPinned,
    ).toBe(false);
  });
});
