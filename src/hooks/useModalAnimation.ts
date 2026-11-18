import { useEffect } from "react";
import { Animated, useAnimatedValue, useWindowDimensions } from "react-native";

export interface BottomSheetAnimationOptions {
  visible: boolean;
  height?: number;
  isLandscape?: boolean;
  heightRatio?: number;
}

/**
 * Standard bottom-sheet / landscape-drawer entrance animation hook.
 * Uses spring physics matched to the app's motion system.
 */
export function useBottomSheetAnimation({
  visible,
  height = 700,
  isLandscape = false,
  heightRatio = 0.75,
}: BottomSheetAnimationOptions) {
  const { width: windowWidth } = useWindowDimensions();
  const sheetHeight = isLandscape ? height : Math.round(height * heightRatio);
  const slideDistance = isLandscape ? windowWidth : sheetHeight;

  const slideAnim = useAnimatedValue(slideDistance);
  const fadeAnim = useAnimatedValue(0);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(slideDistance);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 65,
          overshootClamping: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, slideDistance]);

  return {
    slideAnim,
    fadeAnim,
    sheetHeight,
    slideDistance,
  };
}

/**
 * Standard centered modal dialog scale-and-fade entrance animation hook.
 */
export function useDialogScaleAnimation(visible: boolean) {
  const fadeAnim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(0.94);

  useEffect(() => {
    if (!visible) return;
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.94);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, fadeAnim, scaleAnim]);

  return {
    fadeAnim,
    scaleAnim,
  };
}
