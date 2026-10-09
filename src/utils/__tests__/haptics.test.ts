import * as Haptics from "expo-haptics";
import {
  triggerSelectionHaptic,
  triggerStylePressHaptic,
  triggerZenModeHaptic,
  triggerImpactLight,
  triggerSuccessHaptic,
  triggerWarningHaptic,
} from "../haptics";

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

describe("Haptics Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("triggers selection haptic feedback", async () => {
    await triggerSelectionHaptic();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it("triggers style press haptic feedback with Light style", async () => {
    await triggerStylePressHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
  });

  it("triggers zen mode haptic feedback with Medium style", async () => {
    await triggerZenModeHaptic();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Medium,
    );
  });

  it("triggers general light impact feedback", async () => {
    await triggerImpactLight();
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light,
    );
  });

  it("triggers success notification feedback", async () => {
    await triggerSuccessHaptic();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it("triggers warning notification feedback", async () => {
    await triggerWarningHaptic();
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning,
    );
  });

  it("silently swallows errors when haptics fail", async () => {
    (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(
      new Error("Haptics unsupported"),
    );
    await expect(triggerSelectionHaptic()).resolves.toBeUndefined();
  });
});
