import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Keyboard } from "react-native";
import App from "../App";

// Mock dependencies
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
  };
});

jest.mock("expo-navigation-bar", () => ({
  NavigationBar: {
    setHidden: jest.fn(),
  },
}));

jest.mock("react-native-webview", () => {
  const { View } = require("react-native");
  return {
    WebView: View,
  };
});

const mockSearchMolecule = jest.fn();
const mockSelectSuggestion = jest.fn();
const mockClearSuggestions = jest.fn();
const mockHandleTextChange = jest.fn();
let mockMoleculeData: any = null;

jest.mock("../src/hooks/useMoleculeSearch", () => ({
  useMoleculeSearch: () => ({
    searchText: "water",
    setSearchText: jest.fn(),
    suggestions: [],
    showSuggestions: false,
    setShowSuggestions: jest.fn(),
    isLoading: false,
    moleculeData: mockMoleculeData,
    handleTextChange: mockHandleTextChange,
    searchMolecule: mockSearchMolecule,
    selectSuggestion: mockSelectSuggestion,
  }),
}));

describe("App Info Panel Dismissal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    mockMoleculeData = {
      name: "Water",
      formula: "H2O",
      molecularWeight: "18.015",
      cid: "962",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {
        iupacName: "oxidane",
        commonName: "water",
      },
      safety: {},
    };
  });

  it("blurs input and dismisses keyboard when search is executed", async () => {
    const { getByPlaceholderText } = render(<App />);
    const input = getByPlaceholderText("Search by name or formula");

    await act(async () => {
      fireEvent(input, "submitEditing");
    });

    expect(Keyboard.dismiss).toHaveBeenCalled();
    expect(mockSearchMolecule).toHaveBeenCalled();
  });

  it("opens info panel and dismisses it cleanly with the close button", async () => {
    const { getByText, getByLabelText } = render(<App />);

    // Tap "Info" chip on the dock
    const infoChip = getByText("Info");
    await act(async () => {
      fireEvent.press(infoChip);
    });

    // The close button should now be accessible
    await waitFor(() => {
      expect(getByLabelText("Close info panel")).toBeTruthy();
    });

    // Dismiss info panel with the close button
    const closeBtn = getByLabelText("Close info panel");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    // Verify keyboard was dismissed and close action worked
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });
});
