import * as Haptics from "expo-haptics";

/**
 * Triggers a light tactile tick for selection changes (e.g., search suggestions,
 * tabs, toggles, filter pills).
 */
export const triggerSelectionHaptic = async (): Promise<void> => {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Silently ignore if haptics is unsupported or disabled on device
  }
};

/**
 * Triggers a subtle impact when changing rendering styles or expanding menus.
 */
export const triggerStylePressHaptic = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently ignore
  }
};

/**
 * Triggers a medium tactile impact when entering or exiting Zen full-screen mode.
 */
export const triggerZenModeHaptic = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Silently ignore
  }
};

/**
 * Triggers a light impact for general button presses (dock buttons, sheet toggles, bookmarks).
 */
export const triggerImpactLight = async (): Promise<void> => {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Silently ignore
  }
};

/**
 * Triggers a success notification vibration (e.g., bookmark added, structure loaded).
 */
export const triggerSuccessHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Silently ignore
  }
};

/**
 * Triggers a warning notification vibration (e.g., clearing items or unavailable action).
 */
export const triggerWarningHaptic = async (): Promise<void> => {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    // Silently ignore
  }
};
