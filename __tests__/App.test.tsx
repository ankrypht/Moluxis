import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Keyboard } from "react-native";
import App from "../App";
import {
  resetShowcaseScrollOffset,
  resetSavedFeaturedCategory,
} from "../src/components/FeaturedMolecules";

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

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    WebView: View,
  };
});

const mockSearchMolecule = jest.fn();
const mockSelectSuggestion = jest.fn();
const mockHandleTextChange = jest.fn();
const mockClearMolecule = jest.fn();
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
    clearMolecule: mockClearMolecule,
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

describe("Featured Molecules on First Launch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    mockMoleculeData = null; // empty state on first launch
    resetShowcaseScrollOffset();
    resetSavedFeaturedCategory();
  });

  it("displays featured molecules on launch and allows immediate search by tapping a chip", async () => {
    const { getByText, getByTestId } = render(<App />);

    // Header & Showcase are visible on first launch
    expect(getByText("Featured Molecules")).toBeTruthy();
    expect(getByText("Curated Showcase")).toBeTruthy();

    // Tapping a featured chip triggers immediate search
    const caffeineChip = getByTestId("featured-chip-caffeine");
    await act(async () => {
      fireEvent.press(caffeineChip);
    });

    expect(Keyboard.dismiss).toHaveBeenCalled();
    expect(mockSelectSuggestion).toHaveBeenCalledWith("Caffeine");

    // Switch to crystals tab and tap fluorite chip
    const crystalsTab = getByTestId("category-tab-crystals");
    await act(async () => {
      fireEvent.press(crystalsTab);
    });

    const fluoriteChip = getByTestId("featured-chip-fluorite");
    await act(async () => {
      fireEvent.press(fluoriteChip);
    });

    expect(mockSelectSuggestion).toHaveBeenCalledWith("Fluorite");
  });

  it("returns to showcase when clear button in search input is pressed", async () => {
    // With molecule data or search text active
    mockMoleculeData = {
      name: "Caffeine",
      formula: "C8H10N4O2",
      molecularWeight: "194.19",
      cid: "2519",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {},
      safety: {},
    };

    const { getByTestId } = render(<App />);
    const clearBtn = getByTestId("clear-search-button");

    await act(async () => {
      fireEvent.press(clearBtn);
    });

    expect(mockClearMolecule).toHaveBeenCalled();
  });

  it("returns to showcase when Moluxis title logo is pressed", async () => {
    mockMoleculeData = {
      name: "Caffeine",
      formula: "C8H10N4O2",
      molecularWeight: "194.19",
      cid: "2519",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {},
      safety: {},
    };

    const { getByLabelText } = render(<App />);
    const homeBtn = getByLabelText("Moluxis Home");

    await act(async () => {
      fireEvent.press(homeBtn);
    });

    expect(mockClearMolecule).toHaveBeenCalled();
  });

  it("remembers scroll position in showcase area when scrolling and returning", async () => {
    const { getByTestId, rerender } = render(<App />);

    const scrollView = getByTestId("featured-molecules-scroll");
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 420 },
      },
    });

    // Tap a chip to view compound
    const caffeineChip = getByTestId("featured-chip-caffeine");
    await act(async () => {
      fireEvent.press(caffeineChip);
    });

    // Simulate compound loaded
    mockMoleculeData = {
      name: "Caffeine",
      formula: "C8H10N4O2",
      molecularWeight: "194.19",
      cid: "2519",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {},
      safety: {},
    };
    await act(async () => {
      rerender(<App />);
    });

    // Clear back to showcase
    mockMoleculeData = null;
    await act(async () => {
      rerender(<App />);
    });

    // Check that ScrollView rendered with remembered scroll offset
    const restoredScrollView = getByTestId("featured-molecules-scroll");
    expect(restoredScrollView.props.contentOffset).toEqual({ x: 0, y: 420 });
  });

  it("remembers selected featured category chip when clearing back to showcase", async () => {
    const { getByTestId, queryByTestId, getByText, queryByText, rerender } =
      render(<App />);

    // Default category is Biochemicals (Caffeine visible)
    expect(getByText("Caffeine")).toBeTruthy();
    expect(queryByText("Aspirin")).toBeNull();

    // Switch to Medicinal tab
    await act(async () => {
      fireEvent.press(getByTestId("category-tab-medicinal"));
    });

    // Medicinal items are now visible
    expect(getByText("Aspirin")).toBeTruthy();
    expect(queryByText("Caffeine")).toBeNull();

    // Select a molecule to transition to 3D view
    mockMoleculeData = {
      name: "Aspirin",
      formula: "C9H8O4",
      molecularWeight: "180.16",
      cid: "2244",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {},
      safety: {},
    };
    await act(async () => {
      rerender(<App />);
    });

    // Click clear / return to showcase
    mockMoleculeData = null;
    await act(async () => {
      rerender(<App />);
    });

    // The chosen category (Medicinal) is remembered
    expect(getByTestId("featured-chip-aspirin")).toBeTruthy();
    expect(getByTestId("featured-chip-paracetamol")).toBeTruthy();
    expect(queryByTestId("featured-chip-caffeine")).toBeNull();
  });
});

describe("Recent Searches & Favorites", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});
    mockMoleculeData = {
      name: "Caffeine",
      formula: "C8H10N4O2",
      molecularWeight: "194.19",
      cid: "2519",
      sdf2d: "sdf2d-data",
      sdf3d: "sdf3d-data",
      properties: {},
      safety: {},
    };
  });

  it("allows opening and closing the History / Bookmarks modal from the header", async () => {
    const { getByTestId, queryByTestId } = render(<App />);

    const historyBtn = getByTestId("header-history-button");
    await act(async () => {
      fireEvent.press(historyBtn);
    });

    expect(getByTestId("tab-toggle-history")).toBeTruthy();
    expect(getByTestId("tab-toggle-bookmarks")).toBeTruthy();

    const closeBtn = getByTestId("close-history-modal");
    await act(async () => {
      fireEvent.press(closeBtn);
    });

    expect(queryByTestId("tab-toggle-history")).toBeNull();
  });

  it("toggles bookmark on active molecule from header", async () => {
    const { getByTestId, queryByTestId } = render(<App />);

    const headerBookmarkBtn = getByTestId("header-bookmark-button");
    await act(async () => {
      fireEvent.press(headerBookmarkBtn);
    });

    // Save button should not be in floating dock
    expect(queryByTestId("dock-bookmark-chip")).toBeNull();
  });

  it("revisits compound with one tap when selected from history modal", async () => {
    const { getByTestId, getByText } = render(<App />);

    // Open history modal
    const historyBtn = getByTestId("header-history-button");
    await act(async () => {
      fireEvent.press(historyBtn);
    });

    // The currently inspected compound (Caffeine) is in history
    await waitFor(() => {
      expect(getByText("Caffeine")).toBeTruthy();
    });

    // Tap to revisit with one tap
    await act(async () => {
      fireEvent.press(getByText("Caffeine"));
    });

    expect(mockSelectSuggestion).toHaveBeenCalledWith("Caffeine");
  });
});
