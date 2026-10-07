import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import {
  FeaturedMolecules,
  resetShowcaseScrollOffset,
  getSavedShowcaseScrollOffset,
} from "../FeaturedMolecules";
import { getFeaturedMoleculesStyles } from "../FeaturedMolecules.styles";
import { getScaleMetrics } from "../../utils/scaling";

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

describe("FeaturedMolecules Component", () => {
  const dummyInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const metrics = getScaleMetrics(360, 736, dummyInsets);
  const styles = getFeaturedMoleculesStyles(metrics);

  beforeEach(() => {
    resetShowcaseScrollOffset();
  });

  it("renders header and all 3 categories with 4 examples each in grid layout", async () => {
    const mockSelect = jest.fn();
    const { getByText, getAllByText } = render(
      <FeaturedMolecules onSelectMolecule={mockSelect} styles={styles} />,
    );

    // Header & Showcase
    expect(getByText("Featured Molecules")).toBeTruthy();
    expect(getByText("Curated Showcase")).toBeTruthy();

    // Category section titles
    expect(getByText("Biochemicals")).toBeTruthy();
    expect(getByText("Medicinal")).toBeTruthy();
    expect(getByText("Crystals / Minerals")).toBeTruthy();

    // 4 items indicator in all 3 sections
    expect(getAllByText("4 items")).toHaveLength(3);

    // Biochemicals (4 items)
    expect(getByText("Caffeine")).toBeTruthy();
    expect(getByText("Dopamine")).toBeTruthy();
    expect(getByText("Serotonin")).toBeTruthy();
    expect(getByText("Adenine")).toBeTruthy();

    // Medicinal (4 items)
    expect(getByText("Aspirin")).toBeTruthy();
    expect(getByText("Penicillin")).toBeTruthy();
    expect(getByText("Ibuprofen")).toBeTruthy();
    expect(getByText("Paracetamol")).toBeTruthy();

    // Crystals / Minerals (4 items)
    expect(getByText("Diamond")).toBeTruthy();
    expect(getByText("Sodium Chloride")).toBeTruthy();
    expect(getByText("Quartz")).toBeTruthy();
    expect(getByText("Calcite")).toBeTruthy();
  });

  it("triggers onSelectMolecule immediately when any molecule chip is pressed", async () => {
    const mockSelect = jest.fn();
    const { getByTestId } = render(
      <FeaturedMolecules onSelectMolecule={mockSelect} styles={styles} />,
    );

    const caffeineChip = getByTestId("featured-chip-caffeine");
    await act(async () => {
      fireEvent.press(caffeineChip);
    });

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockSelect).toHaveBeenCalledWith("Caffeine");

    const paracetamolChip = getByTestId("featured-chip-paracetamol");
    await act(async () => {
      fireEvent.press(paracetamolChip);
    });

    expect(mockSelect).toHaveBeenCalledTimes(2);
    expect(mockSelect).toHaveBeenCalledWith("Paracetamol");

    const calciteChip = getByTestId("featured-chip-calcite");
    await act(async () => {
      fireEvent.press(calciteChip);
    });

    expect(mockSelect).toHaveBeenCalledTimes(3);
    expect(mockSelect).toHaveBeenCalledWith("Calcite");
  });

  it("applies topOffset when provided", async () => {
    const mockSelect = jest.fn();
    const { getByText } = render(
      <FeaturedMolecules
        onSelectMolecule={mockSelect}
        styles={styles}
        topOffset={180}
      />,
    );

    expect(getByText("Featured Molecules")).toBeTruthy();
  });

  it("calls onScrollOffsetChange when scrolled", () => {
    const mockSelect = jest.fn();
    const mockScrollOffsetChange = jest.fn();
    const { getByTestId } = render(
      <FeaturedMolecules
        onSelectMolecule={mockSelect}
        styles={styles}
        onScrollOffsetChange={mockScrollOffsetChange}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 250 },
      },
    });

    expect(mockScrollOffsetChange).toHaveBeenCalledWith(250);
    expect(getSavedShowcaseScrollOffset()).toBe(250);
  });

  it("initializes ScrollView with initialScrollOffset", () => {
    const mockSelect = jest.fn();
    const { getByTestId } = render(
      <FeaturedMolecules
        onSelectMolecule={mockSelect}
        styles={styles}
        initialScrollOffset={350}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    expect(scrollView.props.contentOffset).toEqual({ x: 0, y: 350 });
  });

  it("renders correctly on wider tablet screens", () => {
    const tabletMetrics = getScaleMetrics(768, 1024, dummyInsets);
    const tabletStyles = getFeaturedMoleculesStyles(tabletMetrics);
    const mockSelect = jest.fn();
    const { getByText } = render(
      <FeaturedMolecules onSelectMolecule={mockSelect} styles={tabletStyles} />,
    );

    expect(getByText("Featured Molecules")).toBeTruthy();
    expect(getByText("Caffeine")).toBeTruthy();
  });
});
