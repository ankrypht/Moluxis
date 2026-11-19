import {
  SPOTLIGHT_MOLECULES,
  getRandomSpotlightMolecule,
  getSpotlightMolecule,
} from "../spotlightMolecules";
import { FEATURED_MOLECULES } from "../featuredMolecules";
import { formatSubscriptFormula } from "../../utils/formula";

describe("spotlightMolecules", () => {
  it("contains 100 curated spotlight compounds", () => {
    expect(SPOTLIGHT_MOLECULES.length).toBe(100);
  });

  it("ensures every molecule has unique id and unique name", () => {
    const ids = new Set<string>();
    const names = new Set<string>();

    for (const mol of SPOTLIGHT_MOLECULES) {
      expect(ids.has(mol.id)).toBe(false);
      expect(names.has(mol.name.toLowerCase())).toBe(false);

      ids.add(mol.id);
      names.add(mol.name.toLowerCase());
    }
  });

  it("ensures every molecule has complete and valid properties", () => {
    for (const mol of SPOTLIGHT_MOLECULES) {
      expect(mol.id).toBeTruthy();
      expect(mol.name).toBeTruthy();
      expect(mol.query).toBeTruthy();
      expect(mol.formula).toBeTruthy();
      expect(mol.formattedFormula).toBeTruthy();
      expect(mol.formattedFormula).toBe(formatSubscriptFormula(mol.formula));
      expect(mol.tag).toBeTruthy();
      expect(mol.description).toBeTruthy();
      expect(mol.description.length).toBeGreaterThan(15);
      expect(mol.category).toBeTruthy();
    }
  });

  it("preserves Caffeine at index 0 for predictable test and default scheduling", () => {
    const first = SPOTLIGHT_MOLECULES[0];
    expect(first.id).toBe("caffeine");
    expect(first.name).toBe("Caffeine");
    expect(first.formula).toBe("C8H10N4O2");
    expect(first.formattedFormula).toBe("C₈H₁₀N₄O₂");
    expect(first.query).toBe("Caffeine");
  });

  it("includes all 12 featured molecules from the home screen showcase", () => {
    const spotlightIds = new Set(SPOTLIGHT_MOLECULES.map((m) => m.id));
    for (const featured of FEATURED_MOLECULES) {
      expect(spotlightIds.has(featured.id)).toBe(true);
    }
  });

  it("spans across all key chemical domains and categories", () => {
    const categories = new Set(SPOTLIGHT_MOLECULES.map((m) => m.category));
    expect(categories.has("Biochemicals & Neurotransmitters")).toBe(true);
    expect(categories.has("Medicinal & Pharmaceuticals")).toBe(true);
    expect(categories.has("Vitamins & Essential Nutrients")).toBe(true);
    expect(categories.has("Aromas, Flavors & Phytochemicals")).toBe(true);
    expect(categories.has("Nucleic Acids & Biomolecules")).toBe(true);
    expect(categories.has("Everyday & Industrial Chemistry")).toBe(true);
    expect(categories.has("Crystals, Minerals & Inorganics")).toBe(true);
  });

  it("returns a random molecule with getRandomSpotlightMolecule()", () => {
    const randomMol = getRandomSpotlightMolecule();
    expect(randomMol).toBeDefined();
    expect(SPOTLIGHT_MOLECULES).toContain(randomMol);
  });

  it("retrieves a molecule by valid index and falls back when out of bounds", () => {
    const mol1 = getSpotlightMolecule(0);
    expect(mol1.id).toBe("caffeine");

    const mol2 = getSpotlightMolecule(1);
    expect(mol2.id).toBe("dopamine");

    // Out of bounds -> fallback to random
    const outOfBounds = getSpotlightMolecule(9999);
    expect(outOfBounds).toBeDefined();
    expect(SPOTLIGHT_MOLECULES).toContain(outOfBounds);

    const negative = getSpotlightMolecule(-5);
    expect(negative).toBeDefined();
    expect(SPOTLIGHT_MOLECULES).toContain(negative);

    const undefinedIndex = getSpotlightMolecule(undefined);
    expect(undefinedIndex).toBeDefined();
    expect(SPOTLIGHT_MOLECULES).toContain(undefinedIndex);
  });
});
