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
};

export const addOpacity = (hex: string, opacity: number): string => {
  const cleanHex = hex.replace("#", "");
  const alpha = Math.round(opacity * 255);
  const alphaHex = alpha.toString(16).padStart(2, "0").toUpperCase();
  return `#${cleanHex}${alphaHex}`;
};
