import { MeasurementMode, PickedAtom } from "../types";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Returns the number of atoms required to compute a measurement for the given mode.
 */
export function getRequiredAtomCount(mode: MeasurementMode): number {
  switch (mode) {
    case "distance":
      return 2;
    case "angle":
      return 3;
    case "dihedral":
      return 4;
    default:
      return 2;
  }
}

/**
 * Calculates Euclidean distance between two 3D coordinates in Ångströms (Å).
 */
export function calculateDistance(a: Point3D, b: Point3D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculates the bond angle formed by three atoms (A - B - C) with vertex at atom B.
 * Returns the angle in degrees in the range [0, 180].
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  const v1x = a.x - b.x;
  const v1y = a.y - b.y;
  const v1z = a.z - b.z;

  const v2x = c.x - b.x;
  const v2y = c.y - b.y;
  const v2z = c.z - b.z;

  const len1 = Math.sqrt(v1x * v1x + v1y * v1y + v1z * v1z);
  const len2 = Math.sqrt(v2x * v2x + v2y * v2y + v2z * v2z);

  if (len1 === 0 || len2 === 0) {
    return 0;
  }

  const dot = (v1x * v2x + v1y * v2y + v1z * v2z) / (len1 * len2);
  const clampedDot = Math.max(-1, Math.min(1, dot));

  return (Math.acos(clampedDot) * 180) / Math.PI;
}

/**
 * Calculates the dihedral / torsion angle formed by four atoms (A - B - C - D)
 * around the central bond B - C.
 * Returns the angle in degrees in the range [-180, 180].
 */
export function calculateDihedral(
  a: Point3D,
  b: Point3D,
  c: Point3D,
  d: Point3D,
): number {
  // Vector b1 = B - A
  const b1x = b.x - a.x;
  const b1y = b.y - a.y;
  const b1z = b.z - a.z;

  // Vector b2 = C - B
  const b2x = c.x - b.x;
  const b2y = c.y - b.y;
  const b2z = c.z - b.z;

  // Vector b3 = D - C
  const b3x = d.x - c.x;
  const b3y = d.y - c.y;
  const b3z = d.z - c.z;

  // Normal to plane ABC: n1 = b1 x b2
  const n1x = b1y * b2z - b1z * b2y;
  const n1y = b1z * b2x - b1x * b2z;
  const n1z = b1x * b2y - b1y * b2x;

  // Normal to plane BCD: n2 = b2 x b3
  const n2x = b2y * b3z - b2z * b3y;
  const n2y = b2z * b3x - b2x * b3z;
  const n2z = b2x * b3y - b2y * b3x;

  const lenB2 = Math.sqrt(b2x * b2x + b2y * b2y + b2z * b2z);
  if (lenB2 === 0) {
    return 0;
  }

  // Unit vector u2 along b2
  const u2x = b2x / lenB2;
  const u2y = b2y / lenB2;
  const u2z = b2z / lenB2;

  // Vector m1 = n1 x u2 (perpendicular to n1 and in the plane of b2)
  const m1x = n1y * u2z - n1z * u2y;
  const m1y = n1z * u2x - n1x * u2z;
  const m1z = n1x * u2y - n1y * u2x;

  // x = n1 . n2
  const x = n1x * n2x + n1y * n2y + n1z * n2z;

  // y = m1 . n2
  const y = m1x * n2x + m1y * n2y + m1z * n2z;

  if (x === 0 && y === 0) {
    return 0;
  }

  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Calculates the 3D midpoint between two points.
 */
export function getMidpoint(a: Point3D, b: Point3D): Point3D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  };
}

/**
 * Calculates an optimal 3D label position for a bond angle measurement near vertex B.
 */
export function getAngleLabelPosition(
  a: Point3D,
  b: Point3D,
  c: Point3D,
): Point3D {
  // Vector from B to midpoint of A and C
  const midAC = getMidpoint(a, c);
  const dirX = midAC.x - b.x;
  const dirY = midAC.y - b.y;
  const dirZ = midAC.z - b.z;
  const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

  // If A, B, C are nearly collinear, offset slightly in Y
  if (len < 0.001) {
    return { x: b.x, y: b.y + 0.4, z: b.z };
  }

  // Place label ~0.45 Å from vertex B towards the midpoint
  const offset = 0.45 / len;
  return {
    x: b.x + dirX * offset,
    y: b.y + dirY * offset,
    z: b.z + dirZ * offset,
  };
}

/**
 * Formats a measurement result with chemistry symbols, atom labels, and units.
 */
export function formatMeasurement(
  value: number,
  mode: MeasurementMode,
  atoms: PickedAtom[],
): { displayValue: string; designation: string } {
  const getAtomLabel = (atom: PickedAtom) =>
    `${atom.elem}${atom.serial ?? atom.index ?? ""}`;

  switch (mode) {
    case "distance": {
      const a1 = atoms[0] ? getAtomLabel(atoms[0]) : "A";
      const a2 = atoms[1] ? getAtomLabel(atoms[1]) : "B";
      return {
        designation: `d(${a1} — ${a2})`,
        displayValue: `${value.toFixed(3)} Å`,
      };
    }
    case "angle": {
      const a1 = atoms[0] ? getAtomLabel(atoms[0]) : "A";
      const a2 = atoms[1] ? getAtomLabel(atoms[1]) : "B";
      const a3 = atoms[2] ? getAtomLabel(atoms[2]) : "C";
      const normalized = Math.abs(value) < 0.005 ? 0 : value;
      return {
        designation: `∠(${a1} — ${a2} — ${a3})`,
        displayValue: `${normalized.toFixed(2)}°`,
      };
    }
    case "dihedral": {
      const a1 = atoms[0] ? getAtomLabel(atoms[0]) : "A";
      const a2 = atoms[1] ? getAtomLabel(atoms[1]) : "B";
      const a3 = atoms[2] ? getAtomLabel(atoms[2]) : "C";
      const a4 = atoms[3] ? getAtomLabel(atoms[3]) : "D";
      const normalized = Math.abs(value) < 0.005 ? 0 : value;
      return {
        designation: `τ(${a1} — ${a2} — ${a3} — ${a4})`,
        displayValue: `${normalized.toFixed(2)}°`,
      };
    }
    default:
      return {
        designation: "",
        displayValue: `${value.toFixed(2)}`,
      };
  }
}
