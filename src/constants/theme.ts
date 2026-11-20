import { StyleSheet, ViewStyle, DimensionValue } from "react-native";
import { COLORS, addOpacity } from "./colors";

/**
 * Shared shadow presets across the application matching existing visual metrics.
 */
export const SHADOWS = {
  dialog: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7,
    shadowRadius: 32,
    elevation: 30,
  },
  bottomSheet: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 25,
  },
  sheetInfo: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 20,
  },
  card: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  pill: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  island: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  dock: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

/**
 * Shared responsive breakpoints duplicated across header and featured showcase.
 */
export const BREAKPOINTS = {
  TABLET: 600,
  MAX_WIDTH: {
    PHONE_PORTRAIT: 500,
    PHONE_LANDSCAPE: 520,
    TABLET_PORTRAIT: 680,
    TABLET_LANDSCAPE: 860,
  },
} as const;

export const getResponsiveContainerMaxWidth = (
  width: number,
  height: number,
  isLandscape: boolean,
): number => {
  const isTablet = Math.min(width, height) >= BREAKPOINTS.TABLET;
  if (isLandscape) {
    return isTablet
      ? BREAKPOINTS.MAX_WIDTH.TABLET_LANDSCAPE
      : BREAKPOINTS.MAX_WIDTH.PHONE_LANDSCAPE;
  }
  return isTablet
    ? BREAKPOINTS.MAX_WIDTH.TABLET_PORTRAIT
    : BREAKPOINTS.MAX_WIDTH.PHONE_PORTRAIT;
};

// ==========================================
// SHARED STYLE RECIPES
// ==========================================

export interface ModalBackdropOptions {
  zIndex?: number;
  justifyContent?: "flex-end" | "center";
}

/**
 * Fullscreen modal backdrop recipe.
 */
export const createModalBackdropStyle = (
  opacity = 0.78,
  options?: ModalBackdropOptions,
): ViewStyle => ({
  ...StyleSheet.absoluteFill,
  backgroundColor: addOpacity(COLORS.background, opacity),
  ...(options?.zIndex !== undefined ? { zIndex: options.zIndex } : {}),
  ...(options?.justifyContent
    ? { justifyContent: options.justifyContent }
    : {}),
});

export interface DialogCardOptions {
  maxWidth: number;
  scaleSize: (s: number) => number;
  borderOpacity?: number;
  borderRadius?: number;
  zIndex?: number;
  maxHeight?: DimensionValue;
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  alignItems?: "center" | "stretch";
}

/**
 * Centered modal dialog card shell recipe.
 */
export const createDialogCardStyle = ({
  maxWidth,
  scaleSize,
  borderOpacity = 0.8,
  borderRadius = 24,
  zIndex,
  maxHeight,
  paddingHorizontal,
  paddingTop,
  paddingBottom,
  alignItems,
}: DialogCardOptions): ViewStyle => ({
  width: "100%",
  maxWidth,
  backgroundColor: COLORS.surface,
  borderRadius: scaleSize(borderRadius),
  borderWidth: 1,
  borderColor: addOpacity(COLORS.border, borderOpacity),
  ...SHADOWS.dialog,
  ...(zIndex !== undefined ? { zIndex } : {}),
  ...(maxHeight !== undefined ? { maxHeight } : {}),
  ...(paddingHorizontal !== undefined
    ? { paddingHorizontal: scaleSize(paddingHorizontal) }
    : {}),
  ...(paddingTop !== undefined ? { paddingTop: scaleSize(paddingTop) } : {}),
  ...(paddingBottom !== undefined
    ? { paddingBottom: scaleSize(paddingBottom) }
    : {}),
  ...(alignItems ? { alignItems } : {}),
});

export interface BottomSheetContainerOptions {
  scaleSize: (s: number) => number;
  radius?: number;
  zIndex?: number;
  shadowPreset?: keyof typeof SHADOWS;
  isAbsolute?: boolean;
}

/**
 * Bottom-sheet drawer container shell recipe (portrait).
 */
export const createBottomSheetContainerStyle = ({
  scaleSize,
  radius = 28,
  zIndex = 260,
  shadowPreset = "bottomSheet",
  isAbsolute = false,
}: BottomSheetContainerOptions): ViewStyle => ({
  ...(isAbsolute
    ? { position: "absolute", bottom: 0, left: 0, right: 0 }
    : { width: "100%", overflow: "hidden" as const }),
  backgroundColor: COLORS.surface,
  borderTopLeftRadius: scaleSize(radius),
  borderTopRightRadius: scaleSize(radius),
  borderWidth: 1,
  borderColor: COLORS.border,
  zIndex,
  ...SHADOWS[shadowPreset],
});

export interface BottomSheetLandscapeOptions {
  left?: DimensionValue;
  width?: DimensionValue;
  radius?: number;
}

/**
 * Bottom-sheet drawer landscape side-sheet recipe.
 */
export const createBottomSheetLandscapeStyle = (
  scaleSize: (s: number) => number,
  options?: BottomSheetLandscapeOptions,
): ViewStyle => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  right: 0,
  left: options?.left ?? "48%",
  ...(options?.width !== undefined
    ? { width: options.width }
    : options?.left === undefined
      ? { width: "52%" }
      : {}),
  borderBottomLeftRadius: scaleSize(options?.radius ?? 28),
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
});

/**
 * 32x32 circular close button recipe for modal and sheet headers.
 */
export const createCircularCloseButtonStyle = (
  scaleSize: (s: number) => number,
  bgOpacity = 0.8,
  size = 32,
): ViewStyle => ({
  width: scaleSize(size),
  height: scaleSize(size),
  borderRadius: scaleSize(size / 2),
  backgroundColor: addOpacity(COLORS.surfaceElevated, bgOpacity),
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 1,
  borderColor: addOpacity(COLORS.border, 0.6),
});

export interface FloatingIslandOptions {
  scaleSize: (s: number) => number;
  bgOpacity?: number;
  borderRadius?: number;
  padding?: number;
  shadowPreset?: keyof typeof SHADOWS;
}

/**
 * Translucent floating surface island recipe (FloatingHeader, FloatingDock, left rail).
 */
export const createFloatingIslandStyle = ({
  scaleSize,
  bgOpacity = 0.88,
  borderRadius = 22,
  padding = 5,
  shadowPreset = "island",
}: FloatingIslandOptions): ViewStyle => ({
  backgroundColor: addOpacity(COLORS.surface, bgOpacity),
  borderRadius: scaleSize(borderRadius),
  padding: scaleSize(padding),
  borderWidth: 1,
  borderColor: COLORS.surfaceElevated,
  ...(shadowPreset ? SHADOWS[shadowPreset] : {}),
});
