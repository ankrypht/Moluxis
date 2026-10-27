import {
  calculateDistance,
  calculateAngle,
  calculateDihedral,
  getMidpoint,
  getAngleLabelPosition,
  formatMeasurement,
  getRequiredAtomCount,
} from "../geometry";
import { PickedAtom } from "../../types";

describe("geometry utilities", () => {
  describe("getRequiredAtomCount", () => {
    it("returns 2 for distance mode", () => {
      expect(getRequiredAtomCount("distance")).toBe(2);
    });

    it("returns 3 for angle mode", () => {
      expect(getRequiredAtomCount("angle")).toBe(3);
    });

    it("returns 4 for dihedral mode", () => {
      expect(getRequiredAtomCount("dihedral")).toBe(4);
    });
  });

  describe("calculateDistance", () => {
    it("calculates distance between points along an axis", () => {
      const a = { x: 0, y: 0, z: 0 };
      const b = { x: 3, y: 0, z: 0 };
      expect(calculateDistance(a, b)).toBeCloseTo(3, 5);
    });

    it("calculates 3D Euclidean distance (3-4-5 triangle equivalent)", () => {
      const a = { x: 1, y: 2, z: 3 };
      const b = { x: 4, y: 6, z: 3 }; // dx=3, dy=4, dz=0 => dist=5
      expect(calculateDistance(a, b)).toBeCloseTo(5, 5);
    });

    it("returns 0 for identical points", () => {
      const a = { x: 2.5, y: -1.2, z: 0.8 };
      expect(calculateDistance(a, a)).toBe(0);
    });
  });

  describe("calculateAngle", () => {
    it("calculates a 90 degree orthogonal angle", () => {
      const a = { x: 1, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 }; // vertex
      const c = { x: 0, y: 1, z: 0 };
      expect(calculateAngle(a, b, c)).toBeCloseTo(90, 5);
    });

    it("calculates a 180 degree linear angle", () => {
      const a = { x: -1, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      expect(calculateAngle(a, b, c)).toBeCloseTo(180, 5);
    });

    it("calculates water bond angle (~104.5 degrees)", () => {
      // H2O geometry approximate coordinates
      const h1 = { x: 0.757, y: 0.586, z: 0.0 };
      const o = { x: 0.0, y: 0.0, z: 0.0 };
      const h2 = { x: -0.757, y: 0.586, z: 0.0 };
      const angle = calculateAngle(h1, o, h2);
      expect(angle).toBeGreaterThan(104);
      expect(angle).toBeLessThan(105);
    });

    it("returns 0 when a point coincides with vertex", () => {
      const a = { x: 0, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      expect(calculateAngle(a, b, c)).toBe(0);
    });
  });

  describe("calculateDihedral", () => {
    it("calculates planar cis dihedral as 0 degrees", () => {
      const a = { x: 0, y: 1, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      const d = { x: 1, y: 1, z: 0 };
      expect(calculateDihedral(a, b, c, d)).toBeCloseTo(0, 4);
    });

    it("calculates planar trans dihedral as 180 degrees", () => {
      const a = { x: 0, y: 1, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      const d = { x: 1, y: -1, z: 0 };
      expect(Math.abs(calculateDihedral(a, b, c, d))).toBeCloseTo(180, 4);
    });

    it("calculates perpendicular dihedral with magnitude 90 degrees", () => {
      const a = { x: 0, y: 1, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      const d = { x: 1, y: 0, z: 1 };
      expect(Math.abs(calculateDihedral(a, b, c, d))).toBeCloseTo(90, 4);
    });

    it("returns 0 if central bond has zero length", () => {
      const a = { x: 0, y: 1, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 0, y: 0, z: 0 };
      const d = { x: 1, y: 0, z: 0 };
      expect(calculateDihedral(a, b, c, d)).toBe(0);
    });
  });

  describe("getMidpoint", () => {
    it("calculates the accurate 3D midpoint", () => {
      const a = { x: 2, y: 4, z: 6 };
      const b = { x: 6, y: 8, z: 10 };
      expect(getMidpoint(a, b)).toEqual({ x: 4, y: 6, z: 8 });
    });
  });

  describe("getAngleLabelPosition", () => {
    it("returns position slightly offset from vertex towards midpoint", () => {
      const a = { x: 1, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 0, y: 1, z: 0 };
      const pos = getAngleLabelPosition(a, b, c);
      expect(pos.x).toBeGreaterThan(0);
      expect(pos.y).toBeGreaterThan(0);
      expect(pos.z).toBeCloseTo(0, 5);
    });

    it("handles collinear case gracefully", () => {
      const a = { x: -1, y: 0, z: 0 };
      const b = { x: 0, y: 0, z: 0 };
      const c = { x: 1, y: 0, z: 0 };
      const pos = getAngleLabelPosition(a, b, c);
      expect(pos).toBeDefined();
    });
  });

  describe("formatMeasurement", () => {
    const sampleAtoms: PickedAtom[] = [
      { serial: 1, index: 0, elem: "C", x: 0, y: 0, z: 0 },
      { serial: 2, index: 1, elem: "O", x: 1.43, y: 0, z: 0 },
      { serial: 3, index: 2, elem: "H", x: 1.8, y: 0.9, z: 0 },
      { serial: 4, index: 3, elem: "N", x: 2.5, y: 1.2, z: 0.5 },
    ];

    it("formats distance with d() and Angstrom unit", () => {
      const res = formatMeasurement(1.432, "distance", sampleAtoms.slice(0, 2));
      expect(res.designation).toBe("d(C1 — O2)");
      expect(res.displayValue).toBe("1.432 Å");
    });

    it("formats angle with ∠() and degree unit", () => {
      const res = formatMeasurement(104.45, "angle", sampleAtoms.slice(0, 3));
      expect(res.designation).toBe("∠(C1 — O2 — H3)");
      expect(res.displayValue).toBe("104.45°");
    });

    it("formats dihedral with τ() and degree unit", () => {
      const res = formatMeasurement(62.18, "dihedral", sampleAtoms);
      expect(res.designation).toBe("τ(C1 — O2 — H3 — N4)");
      expect(res.displayValue).toBe("62.18°");
    });

    it("normalizes negative near-zero values to 0.00°", () => {
      const res = formatMeasurement(-0.001, "dihedral", sampleAtoms);
      expect(res.displayValue).toBe("0.00°");
    });
  });
});
