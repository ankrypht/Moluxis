import {
  render,
  fireEvent,
  renderHook,
  act,
} from "@testing-library/react-native";
import { BackHandler } from "react-native";
import {
  CustomAlertModal,
  Alert,
  customAlertManager,
  resolveAlertTheme,
  useActiveAlert,
  resetAlertIdCounter,
} from "../CustomAlert";
import { COLORS } from "../../constants/colors";
import * as Haptics from "../../utils/haptics";

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

jest.mock("../../utils/haptics", () => ({
  triggerSelectionHaptic: jest.fn(),
  triggerWarningHaptic: jest.fn(),
}));

describe("CustomAlert Component & Service", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    act(() => {
      customAlertManager.dismiss();
      jest.runAllTimers();
    });
  });

  afterEach(() => {
    act(() => {
      customAlertManager.dismiss();
      jest.runAllTimers();
    });
    jest.useRealTimers();
  });

  describe("resolveAlertTheme logic", () => {
    it("resolves error theme for titles containing error or type='error'", () => {
      const theme1 = resolveAlertTheme("Network Error", []);
      expect(theme1.iconName).toBe("alert-circle-outline");
      expect(theme1.accentColor).toBe(COLORS.danger);

      const theme2 = resolveAlertTheme("Something happened", [], {
        type: "error",
      });
      expect(theme2.iconName).toBe("alert-circle-outline");
      expect(theme2.accentColor).toBe(COLORS.danger);
    });

    it("resolves warning theme for unavailable or busy titles", () => {
      const theme1 = resolveAlertTheme("2D Structure Unavailable", []);
      expect(theme1.iconName).toBe("warning-outline");
      expect(theme1.accentColor).toBe(COLORS.warning);

      const theme2 = resolveAlertTheme("Chemical Server Busy", []);
      expect(theme2.iconName).toBe("hourglass-outline");
      expect(theme2.accentColor).toBe(COLORS.warning);
    });

    it("resolves not found theme for not found titles", () => {
      const theme = resolveAlertTheme("Not Found", []);
      expect(theme.iconName).toBe("search-outline");
      expect(theme.accentColor).toBe(COLORS.cyan);
    });

    it("resolves destructive trash theme when destructive button or clear keyword is present", () => {
      const theme1 = resolveAlertTheme("Clear Search History?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear All", style: "destructive" },
      ]);
      expect(theme1.iconName).toBe("trash-outline");
      expect(theme1.accentColor).toBe(COLORS.danger);

      const theme2 = resolveAlertTheme("Delete Item", []);
      expect(theme2.iconName).toBe("trash-outline");
      expect(theme2.accentColor).toBe(COLORS.danger);
    });

    it("resolves success theme when type='success' or success keyword in title", () => {
      const theme = resolveAlertTheme("Download Success", []);
      expect(theme.iconName).toBe("checkmark-circle-outline");
      expect(theme.accentColor).toBe(COLORS.emerald);
    });

    it("allows explicit icon override via options", () => {
      const theme = resolveAlertTheme("General Info", [], {
        icon: "flask-outline" as any,
        type: "info",
      });
      expect(theme.iconName).toBe("flask-outline");
    });
  });

  describe("CustomAlertModal UI Rendering and Interaction", () => {
    it("renders nothing initially when no alert is active", () => {
      const { queryByTestId } = render(<CustomAlertModal />);
      expect(queryByTestId("custom-alert-card")).toBeNull();
    });

    it("displays an alert popup when Alert.alert is invoked", () => {
      const { getByTestId, getByText } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Test Alert", "This is a custom alert message");
      });

      expect(getByTestId("custom-alert-card")).toBeTruthy();
      expect(getByText("Test Alert")).toBeTruthy();
      expect(getByText("This is a custom alert message")).toBeTruthy();
      expect(getByText("OK")).toBeTruthy();
    });

    it("handles single button click and triggers default selection haptic and onPress", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Notice", "Single button test", [
          { text: "Got It", onPress: onPressMock },
        ]);
      });

      const button = getByTestId("custom-alert-button-0");
      act(() => {
        fireEvent.press(button);
      });

      expect(onPressMock).toHaveBeenCalledTimes(1);
      expect(Haptics.triggerSelectionHaptic).toHaveBeenCalledTimes(1);
    });

    it("handles 2 buttons with cancel and destructive actions properly", () => {
      const onCancelMock = jest.fn();
      const onClearMock = jest.fn();
      const { getByTestId, getByText } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Clear Search History?", "Remove all records?", [
          { text: "Cancel", style: "cancel", onPress: onCancelMock },
          { text: "Clear All", style: "destructive", onPress: onClearMock },
        ]);
      });

      expect(getByText("Clear Search History?")).toBeTruthy();
      expect(getByText("Remove all records?")).toBeTruthy();

      const clearBtn = getByTestId("custom-alert-button-1");
      act(() => {
        fireEvent.press(clearBtn);
      });

      expect(onClearMock).toHaveBeenCalledTimes(1);
      expect(Haptics.triggerWarningHaptic).toHaveBeenCalledTimes(1);
      expect(onCancelMock).not.toHaveBeenCalled();
    });

    it("dismisses on backdrop tap when cancelable is true", () => {
      const onCancelMock = jest.fn();
      const onDismissMock = jest.fn();
      const { getByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert(
          "Prompt",
          "Dismiss test",
          [{ text: "Cancel", style: "cancel", onPress: onCancelMock }],
          { onDismiss: onDismissMock },
        );
      });

      const backdrop = getByTestId("custom-alert-backdrop");
      act(() => {
        fireEvent.press(backdrop);
      });

      expect(onCancelMock).toHaveBeenCalledTimes(1);
      expect(onDismissMock).toHaveBeenCalledTimes(1);
    });

    it("does not dismiss on backdrop tap when cancelable is false", () => {
      const onCancelMock = jest.fn();
      const { getByTestId, queryByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert(
          "Important Alert",
          "Cannot dismiss by tapping outside",
          [{ text: "Cancel", style: "cancel", onPress: onCancelMock }],
          { cancelable: false },
        );
      });

      const backdrop = getByTestId("custom-alert-backdrop");
      act(() => {
        fireEvent.press(backdrop);
      });

      expect(onCancelMock).not.toHaveBeenCalled();
      expect(queryByTestId("custom-alert-card")).toBeTruthy();
    });

    it("stacks 3 buttons vertically in column layout", () => {
      const { getByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Multiple Options", "Select one", [
          { text: "Option A" },
          { text: "Option B" },
          { text: "Option C" },
        ]);
      });

      expect(getByTestId("custom-alert-button-0")).toBeTruthy();
      expect(getByTestId("custom-alert-button-1")).toBeTruthy();
      expect(getByTestId("custom-alert-button-2")).toBeTruthy();
    });

    it("dismisses programmatically when Alert.dismiss is called", () => {
      const { queryByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Auto Close", "Will be dismissed");
      });

      expect(queryByTestId("custom-alert-card")).toBeTruthy();

      act(() => {
        Alert.dismiss();
      });

      expect(customAlertManager.getCurrentAlert()).toBeNull();
    });

    it("handles Android hardware back button when active", () => {
      const backPressSpy = jest.spyOn(BackHandler, "addEventListener");
      const onCancelMock = jest.fn();

      render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Back Button Test", "Pressing hardware back", [
          { text: "Cancel", style: "cancel", onPress: onCancelMock },
        ]);
      });

      expect(backPressSpy).toHaveBeenCalledWith(
        "hardwareBackPress",
        expect.any(Function),
      );

      // Invoke the back press handler registered
      const registeredHandler = backPressSpy.mock.calls[0][1];
      let handledResult;
      act(() => {
        handledResult = registeredHandler({} as any);
      });

      expect(handledResult).toBe(true);
      expect(onCancelMock).toHaveBeenCalledTimes(1);

      backPressSpy.mockRestore();
    });

    it("handles Alert.handleBackPress correctly for active, cancelable, and non-cancelable alerts", () => {
      // 1. When no alert is active, returns false
      expect(Alert.handleBackPress()).toBe(false);

      // 2. When active and cancelable
      const onCancelMock = jest.fn();
      const onDismissMock = jest.fn();

      act(() => {
        Alert.alert(
          "Test Alert",
          "Message",
          [{ text: "Cancel", style: "cancel", onPress: onCancelMock }],
          { onDismiss: onDismissMock },
        );
      });

      expect(customAlertManager.getCurrentAlert()).not.toBeNull();

      let result;
      act(() => {
        result = Alert.handleBackPress();
      });

      expect(result).toBe(true);
      expect(onCancelMock).toHaveBeenCalledTimes(1);
      expect(onDismissMock).toHaveBeenCalledTimes(1);
      expect(customAlertManager.getCurrentAlert()).toBeNull();

      // 3. When active and non-cancelable
      act(() => {
        Alert.alert("Locked Alert", "Cannot cancel", [{ text: "OK" }], {
          cancelable: false,
        });
      });

      act(() => {
        result = Alert.handleBackPress();
      });

      expect(result).toBe(true);
      expect(customAlertManager.getCurrentAlert()).not.toBeNull();
    });

    it("provides reactive active alert status via useActiveAlert", () => {
      const { result } = renderHook(() => useActiveAlert());
      expect(result.current).toBe(false);

      act(() => {
        Alert.alert("Alert Active", "Testing hook");
      });
      expect(result.current).toBe(true);

      act(() => {
        Alert.dismiss();
      });
      expect(result.current).toBe(false);
    });
  });

  describe("Consecutive Alert Dismissal Animation Race Condition", () => {
    beforeEach(() => {
      resetAlertIdCounter();
    });

    it("assigns monotonically incrementing alert IDs", () => {
      act(() => {
        Alert.alert("Alert 1");
      });
      const alert1 = customAlertManager.getCurrentAlert();
      expect(alert1?.id).toBe("alert-1");

      act(() => {
        Alert.alert("Alert 2");
      });
      const alert2 = customAlertManager.getCurrentAlert();
      expect(alert2?.id).toBe("alert-2");

      act(() => {
        Alert.alert("Alert 3");
      });
      const alert3 = customAlertManager.getCurrentAlert();
      expect(alert3?.id).toBe("alert-3");
    });

    it("preserves consecutive alert when button.onPress synchronously triggers a new alert", () => {
      const { getByTestId, getByText, queryByText } = render(
        <CustomAlertModal />,
      );

      act(() => {
        Alert.alert("Clear Search History?", "Remove all records?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear All",
            style: "destructive",
            onPress: () => {
              Alert.alert("History Cleared", "All records were deleted");
            },
          },
        ]);
      });

      expect(getByText("Clear Search History?")).toBeTruthy();

      const clearBtn = getByTestId("custom-alert-button-1");
      act(() => {
        fireEvent.press(clearBtn);
      });

      // Synchronous mounting of the new alert
      expect(getByText("History Cleared")).toBeTruthy();
      expect(getByText("All records were deleted")).toBeTruthy();
      expect(queryByText("Clear Search History?")).toBeNull();

      // Advance timers past the 130ms exit duration of the first alert
      act(() => {
        jest.advanceTimersByTime(200);
      });

      // The second alert must NOT have been destroyed by the first alert's exit animation callback
      expect(getByText("History Cleared")).toBeTruthy();
      expect(getByText("All records were deleted")).toBeTruthy();
      expect(customAlertManager.getCurrentAlert()?.title).toBe(
        "History Cleared",
      );
    });

    it("preserves consecutive alert when triggered asynchronously during exit animation", () => {
      const { getByTestId, getByText, queryByText } = render(
        <CustomAlertModal />,
      );

      act(() => {
        Alert.alert("First Alert", "Will trigger async followup", [
          {
            text: "Trigger Async",
            onPress: () => {
              setTimeout(() => {
                Alert.alert("Async Followup", "Arrived during exit animation");
              }, 50);
            },
          },
        ]);
      });

      const button = getByTestId("custom-alert-button-0");
      act(() => {
        fireEvent.press(button);
      });

      // Advance by 50ms so setTimeout fires and mounts the followup alert
      act(() => {
        jest.advanceTimersByTime(50);
      });

      expect(getByText("Async Followup")).toBeTruthy();

      // Advance past the 130ms mark (total 150ms from button press)
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Async alert must still be mounted and not destroyed
      expect(getByText("Async Followup")).toBeTruthy();
      expect(queryByText("First Alert")).toBeNull();
      expect(customAlertManager.getCurrentAlert()?.title).toBe(
        "Async Followup",
      );
    });

    it("preserves consecutive alert triggered via backdrop press onDismiss", () => {
      const { getByTestId, getByText } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert(
          "Cancelable Alert",
          "Tap outside to trigger dismiss followup",
          [{ text: "Cancel", style: "cancel" }],
          {
            onDismiss: () => {
              Alert.alert("Backdrop Followup", "Spawned by onDismiss");
            },
          },
        );
      });

      const backdrop = getByTestId("custom-alert-backdrop");
      act(() => {
        fireEvent.press(backdrop);
      });

      expect(getByText("Backdrop Followup")).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(getByText("Backdrop Followup")).toBeTruthy();
      expect(customAlertManager.getCurrentAlert()?.title).toBe(
        "Backdrop Followup",
      );
    });

    it("normal dismissal cleanly unmounts after exit animation completes", () => {
      const { getByTestId, queryByTestId } = render(<CustomAlertModal />);

      act(() => {
        Alert.alert("Standard Notice", "Dismiss normally", [{ text: "OK" }]);
      });

      expect(getByTestId("custom-alert-card")).toBeTruthy();

      const button = getByTestId("custom-alert-button-0");
      act(() => {
        fireEvent.press(button);
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(queryByTestId("custom-alert-card")).toBeNull();
      expect(customAlertManager.getCurrentAlert()).toBeNull();
    });

    it("scoped dismiss(id) ignores mismatched IDs and only dismisses matching ID", () => {
      act(() => {
        Alert.alert("Original Alert");
      });
      const originalId = customAlertManager.getCurrentAlert()?.id;
      expect(originalId).toBe("alert-1");

      act(() => {
        Alert.alert("Replacement Alert");
      });
      const newId = customAlertManager.getCurrentAlert()?.id;
      expect(newId).toBe("alert-2");

      // Attempt to dismiss using old ID - should be a no-op
      act(() => {
        Alert.dismiss(originalId);
      });
      expect(customAlertManager.getCurrentAlert()?.id).toBe("alert-2");

      // Dismiss using active ID
      act(() => {
        Alert.dismiss(newId);
      });
      expect(customAlertManager.getCurrentAlert()).toBeNull();
    });
  });
});
