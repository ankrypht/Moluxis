import { Dimensions, PixelRatio } from "react-native";

// Reference dimensions from Samsung S24
const REFERENCE_WIDTH = 360;
const REFERENCE_HEIGHT = 736;

/**
 * Gets the current window scale based on orientation-aware reference dimensions.
 */
const getOrientationAwareScale = () => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;

  const refWidth = isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH;
  const refHeight = isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT;

  const wScale = SCREEN_WIDTH / refWidth;
  const hScale = SCREEN_HEIGHT / refHeight;

  return Math.min(wScale, hScale);
};

/**
 * Scales a size based on screen dimensions relative to reference device.
 * @param size The original size (at 360x736)
 * @returns The scaled size
 */
export const moderateScale = (size: number, factor = 0.5) => {
  const scale = getOrientationAwareScale();
  const scaledSize = size + (scale * size - size) * factor;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Strictly scales a size based on screen width.
 * Best for layouts and spacings.
 */
export const horizontalScale = (size: number) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
  const refWidth = isLandscape ? REFERENCE_HEIGHT : REFERENCE_WIDTH;

  const scaledSize = (SCREEN_WIDTH / refWidth) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

/**
 * Strictly scales a size based on screen height.
 */
export const verticalScale = (size: number) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
    Dimensions.get("window");
  const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
  const refHeight = isLandscape ? REFERENCE_WIDTH : REFERENCE_HEIGHT;

  const scaledSize = (SCREEN_HEIGHT / refHeight) * size;
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

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
