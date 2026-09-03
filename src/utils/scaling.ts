import { PixelRatio } from "react-native";

// Reference dimensions from Samsung S24
export const REFERENCE_WIDTH = 360;
export const REFERENCE_HEIGHT = 736;

export interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface ScaleMetrics {
  width: number;
  height: number;
  isLandscape: boolean;
  insets: Insets;
  scaleSize: (size: number, factor?: number) => number;
  hScaleSize: (size: number) => number;
}

export const getScaleMetrics = (
  width: number,
  height: number,
  insets: Insets,
): ScaleMetrics => {
  const isLandscape = width > height;

  // Swap reference dimensions based on orientation to maintain the 'optimized' look
  const refWidth = isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH;
  const refHeight = isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT;

  const wScale = width / refWidth;
  const hScale = height / refHeight;
  // Use a slightly dampened scale for fonts to avoid extreme sizes
  const s = Math.min(wScale, hScale);

  const scaleSize = (size: number, factor = 0.5) => {
    const scaledSize = size + (s * size - size) * factor;
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  };

  const hScaleSize = (size: number) =>
    Math.round(PixelRatio.roundToNearestPixel((width / refWidth) * size));

  return {
    width,
    height,
    isLandscape,
    insets,
    scaleSize,
    hScaleSize,
  };
};
