import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { FloatingHeader } from "../FloatingHeader";
import { getFloatingHeaderStyles } from "../FloatingHeader.styles";
import { getStructureControlsStyles } from "../StructureControls.styles";
import { getScaleMetrics } from "../../utils/scaling";
import { MoleculeInfo } from "../../types";

// Mock @expo/vector-icons
jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

const mockTriggerImpactLight = jest.fn();
const mockTriggerSelectionHaptic = jest.fn();

jest.mock("../../utils/haptics", () => ({
  triggerImpactLight: () => mockTriggerImpactLight(),
  triggerSelectionHaptic: () => mockTriggerSelectionHaptic(),
  triggerWarningHaptic: jest.fn(),
}));

describe("FloatingHeader Component & Styles", () => {
  const dummyInsets = { top: 44, right: 0, bottom: 34, left: 0 };
  const landscapeInsets = { top: 0, right: 44, bottom: 21, left: 44 };

  const mockMoleculeData: MoleculeInfo = {
    name: "Caffeine",
    formula: "C8H10N4O2",
    cid: "2519",
    molecularWeight: "194.19",
    sdf2d: "M  END",
    sdf3d: "M  END",
    useCif: false,
    synonyms: ["caffeine"],
    description: "A stimulant.",
    properties: {},
    safety: {},
  };

  const getCombinedStyles = (
    width: number,
    height: number,
    insets = dummyInsets,
  ) => {
    const metrics = getScaleMetrics(width, height, insets);
    return {
      ...getFloatingHeaderStyles(metrics),
      ...getStructureControlsStyles(metrics),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Breakpoint Max Widths & Capsule Proportions", () => {
    it("applies phone portrait styles (maxWidth 500, space-between controls, no capsule)", () => {
      const styles = getCombinedStyles(390, 844);
      expect(styles.headerIsland.maxWidth).toBe(500);
      expect(styles.suggestionsContainer.maxWidth).toBe(500);
      expect(styles.controlsRow.maxWidth).toBe(500);
      expect(styles.controlsRow.justifyContent).toBe("space-between");
      expect(styles.controlsRow.backgroundColor).toBe("transparent");
      expect(styles.controlsRow.borderRadius).toBe(0);
    });

    it("applies tablet portrait styles (maxWidth 680, space-between transparent controls matching mobile)", () => {
      const styles = getCombinedStyles(768, 1024);
      expect(styles.headerIsland.maxWidth).toBe(680);
      expect(styles.suggestionsContainer.maxWidth).toBe(680);
      expect(styles.controlsRow.maxWidth).toBe(680);
      expect(styles.controlsRow.justifyContent).toBe("space-between");
      expect(styles.controlsRow.alignSelf).toBe("center");
      expect(styles.controlsRow.backgroundColor).toBe("transparent");
      expect(styles.controlsRow.borderWidth).toBe(0);
      expect(styles.controlsRow.elevation).toBe(0);
      expect(styles.controlsRow.shadowOpacity).toBe(0);
    });

    it("applies phone landscape styles (maxWidth 520, compact buttons, zero container margin with safe padding)", () => {
      const styles = getCombinedStyles(844, 390, landscapeInsets);
      expect(styles.floatingHeaderContainer.left).toBe(0);
      expect(styles.floatingHeaderContainer.right).toBe(0);
      expect(styles.header.paddingLeft).toBe(landscapeInsets.left);
      expect(styles.header.paddingRight).toBe(landscapeInsets.right);
      expect(styles.headerIslandLandscape.width).toBe("100%");
      expect(styles.headerIslandLandscape.maxWidth).toBe(520);
      expect(styles.suggestionsContainerLandscape.maxWidth).toBe(520);
      expect(styles.headerIconButtonLandscape.width).toBeLessThanOrEqual(40);
    });

    it("applies tablet landscape styles (maxWidth 860, generous touch targets, zero container margin with safe padding)", () => {
      const styles = getCombinedStyles(1024, 768, landscapeInsets);
      expect(styles.floatingHeaderContainer.left).toBe(0);
      expect(styles.floatingHeaderContainer.right).toBe(0);
      expect(styles.header.paddingLeft).toBe(landscapeInsets.left);
      expect(styles.header.paddingRight).toBe(landscapeInsets.right);
      expect(styles.headerIslandLandscape.width).toBe("100%");
      expect(styles.headerIslandLandscape.maxWidth).toBe(860);
      expect(styles.suggestionsContainerLandscape.maxWidth).toBe(860);
      expect(styles.headerIconButtonLandscape.width).toBeGreaterThanOrEqual(44);
    });
  });

  describe("Rendering & User Interactions", () => {
    it("renders title, search input, bookmark, share, and history buttons in portrait", () => {
      const styles = getCombinedStyles(390, 844);
      const mockSearch = jest.fn();
      const mockToggleBookmark = jest.fn();
      const mockOpenShare = jest.fn();
      const mockOpenHistory = jest.fn();
      const mockClear = jest.fn();

      const { getByText, getByPlaceholderText, getByTestId } = render(
        <FloatingHeader
          searchInputRef={{ current: null }}
          searchText="Caffeine"
          suggestions={[]}
          showSuggestions={false}
          isLoading={false}
          moleculeData={mockMoleculeData}
          isLandscape={false}
          showInfo={false}
          isAnimated={false}
          structureFormat="3d"
          styles={styles}
          onTextChange={jest.fn()}
          onFocus={jest.fn()}
          onSearch={mockSearch}
          onSelectSuggestion={jest.fn()}
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
          onClear={mockClear}
          isBookmarked={false}
          onToggleBookmark={mockToggleBookmark}
          onOpenShare={mockOpenShare}
          onOpenHistory={mockOpenHistory}
        />,
      );

      expect(getByText("Moluxis")).toBeTruthy();
      expect(getByPlaceholderText("Search by name or formula")).toBeTruthy();

      // Bookmark
      const bookmarkBtn = getByTestId("header-bookmark-button");
      fireEvent.press(bookmarkBtn);
      expect(mockToggleBookmark).toHaveBeenCalledTimes(1);

      // Share
      const shareBtn = getByTestId("header-share-button");
      fireEvent.press(shareBtn);
      expect(mockOpenShare).toHaveBeenCalledTimes(1);

      // History
      const historyBtn = getByTestId("header-history-button");
      fireEvent.press(historyBtn);
      expect(mockOpenHistory).toHaveBeenCalledTimes(1);

      // Clear button
      const clearBtn = getByTestId("clear-search-button");
      fireEvent.press(clearBtn);
      expect(mockClear).toHaveBeenCalledTimes(1);

      // Controls row is rendered when moleculeData is present in portrait
      expect(getByTestId("floating-header-controls-row")).toBeTruthy();
    });

    it("renders tablet portrait controls with space-between alignment and 680 max width", () => {
      const styles = getCombinedStyles(768, 1024);

      const { getByTestId } = render(
        <FloatingHeader
          searchInputRef={{ current: null }}
          searchText=""
          suggestions={[]}
          showSuggestions={false}
          isLoading={false}
          moleculeData={mockMoleculeData}
          isLandscape={false}
          showInfo={false}
          isAnimated={false}
          structureFormat="3d"
          styles={styles}
          onTextChange={jest.fn()}
          onFocus={jest.fn()}
          onSearch={jest.fn()}
          onSelectSuggestion={jest.fn()}
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
        />,
      );

      const controlsRow = getByTestId("floating-header-controls-row");
      expect(controlsRow.props.style).toMatchObject({
        justifyContent: "space-between",
        maxWidth: 680,
        backgroundColor: "transparent",
      });
    });

    it("does not render controls row on home screen (moleculeData is null)", () => {
      const styles = getCombinedStyles(390, 844);

      const { queryByTestId } = render(
        <FloatingHeader
          searchInputRef={{ current: null }}
          searchText=""
          suggestions={[]}
          showSuggestions={false}
          isLoading={false}
          moleculeData={null}
          isLandscape={false}
          showInfo={false}
          isAnimated={false}
          structureFormat="3d"
          styles={styles}
          onTextChange={jest.fn()}
          onFocus={jest.fn()}
          onSearch={jest.fn()}
          onSelectSuggestion={jest.fn()}
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
        />,
      );

      expect(queryByTestId("floating-header-controls-row")).toBeNull();
    });

    it("renders autocomplete suggestions and hides controls row when dropdown is visible", () => {
      const styles = getCombinedStyles(390, 844);
      const mockSelect = jest.fn();

      const { getByText, queryByTestId } = render(
        <FloatingHeader
          searchInputRef={{ current: null }}
          searchText="Caf"
          suggestions={["Caffeine", "Caffeic acid"]}
          showSuggestions={true}
          isLoading={false}
          moleculeData={mockMoleculeData}
          isLandscape={false}
          showInfo={false}
          isAnimated={false}
          structureFormat="3d"
          styles={styles}
          onTextChange={jest.fn()}
          onFocus={jest.fn()}
          onSearch={jest.fn()}
          onSelectSuggestion={mockSelect}
          onToggleAnimation={jest.fn()}
          onSelectFormat={jest.fn()}
        />,
      );

      // Suggestions visible
      expect(getByText("Caffeine")).toBeTruthy();
      expect(getByText("Caffeic acid")).toBeTruthy();

      // Controls row hidden while suggestions dropdown is open
      expect(queryByTestId("floating-header-controls-row")).toBeNull();

      fireEvent.press(getByText("Caffeine"));
      expect(mockSelect).toHaveBeenCalledWith("Caffeine");
    });
  });
});
