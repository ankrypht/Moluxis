import { PixelRatio } from "react-native";

// Reference dimensions from Samsung S24
const REFERENCE_WIDTH = 360;
const REFERENCE_HEIGHT = 736;

/**
 * Dynamic scaling that responds to window dimension changes.
 * Use this in components with useWindowDimensions hook.
 */
export const getResponsiveSize = (
  size: number,
  windowWidth: number,
  windowHeight: number,
  factor = 0.5,
) => {
  const isLandscape = windowWidth > windowHeight;
  const refWidth = isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH;
  const refHeight = isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT;

  const wScale = windowWidth / refWidth;
  const hScale = windowHeight / refHeight;
  const s = Math.min(wScale, hScale);

  const scaledSize = size + (s * size - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};
