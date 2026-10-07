export const COLORS = {
  background: "#09090B", // zinc-950
  surface: "#18181B", // zinc-900
  surfaceElevated: "#27272A", // zinc-800
  border: "#3F3F46", // zinc-700
  primary: "#0B84FE", // Apple System Blue
  textPrimary: "#FAFAFA", // zinc-50
  textSecondary: "#A1A1AA", // zinc-400
  textMuted: "#71717A", // zinc-500
  danger: "#EF4444", // red-500
  warning: "#F59E0B", // amber-500
  textOnPrimary: "#FFFFFF",
  shadow: "#000000",
  // Semantic accents
  emerald: "#10B981",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  violet: "#A855F7",
  rose: "#F43F5E",
  amber: "#F59E0B",
};

export const addOpacity = (hex: string, opacity: number): string => {
  if (!hex || !hex.startsWith("#")) {
    return hex;
  }
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) {
    return hex;
  }
  const alpha = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  const alphaHex = alpha.toString(16).padStart(2, "0").toUpperCase();
  return `#${cleanHex}${alphaHex}`;
};
