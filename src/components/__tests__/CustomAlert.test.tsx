import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { BackHandler } from "react-native";
import {
  CustomAlertModal,
  Alert,
  customAlert,
  customAlertManager,
  resolveAlertTheme,
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
    jest.clearAllMocks();
    act(() => {
      customAlertManager.dismiss();
    });
  });

  afterEach(() => {
    act(() => {
      customAlertManager.dismiss();
    });
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
        customAlert("Clear Search History?", "Remove all records?", [
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
  });
});
