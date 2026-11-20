import { render, fireEvent, act } from "@testing-library/react-native";
import {
  HomeScreen,
  resetShowcaseScrollOffset,
  getSavedShowcaseScrollOffset,
  resetSavedFeaturedCategory,
  resetCategoryTabsScrollOffset,
} from "../HomeScreen";
import { getHomeScreenStyles } from "../HomeScreen.styles";
import { getScaleMetrics } from "../../utils/scaling";
import { SavedCompoundItem } from "../../types";

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

describe("HomeScreen Component", () => {
  const dummyInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const metrics = getScaleMetrics(360, 736, dummyInsets);
  const styles = getHomeScreenStyles(metrics);

  beforeEach(() => {
    resetShowcaseScrollOffset();
    resetCategoryTabsScrollOffset();
    resetSavedFeaturedCategory();
  });

  it("renders outer vertical ScrollView and all composed home sections", () => {
    const mockSelect = jest.fn();
    const { getByTestId, getByText } = render(
      <HomeScreen onSelectMolecule={mockSelect} styles={styles} />,
    );

    // Outer ScrollView
    expect(getByTestId("featured-molecules-scroll")).toBeTruthy();

    // Attributions Banner
    expect(getByTestId("showcase-about-banner")).toBeTruthy();

    // Featured Molecules showcase
    expect(getByText("Featured Molecules")).toBeTruthy();
    expect(getByText("Curated Showcase")).toBeTruthy();
    expect(getByTestId("category-tabs-scroll")).toBeTruthy();
  });

  it("renders Jump Back In when history is provided", () => {
    const mockHistory: SavedCompoundItem[] = [
      { cid: "1", name: "Water", formula: "H2O", timestamp: 1000 },
    ];
    const { getByText, getByTestId } = render(
      <HomeScreen
        onSelectMolecule={jest.fn()}
        styles={styles}
        history={mockHistory}
      />,
    );

    expect(getByText("Jump Back In")).toBeTruthy();
    expect(getByTestId("recent-chip-water")).toBeTruthy();
  });

  it("applies topOffset to the outer ScrollView content container", () => {
    const { getByTestId } = render(
      <HomeScreen
        onSelectMolecule={jest.fn()}
        styles={styles}
        topOffset={50}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    expect(scrollView.props.contentContainerStyle).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 50 })]),
    );
  });

  it("tracks vertical scroll and invokes onScrollOffsetChange", () => {
    const mockScrollChange = jest.fn();
    const { getByTestId } = render(
      <HomeScreen
        onSelectMolecule={jest.fn()}
        styles={styles}
        onScrollOffsetChange={mockScrollChange}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 150, x: 0 },
        contentSize: { height: 1000, width: 360 },
        layoutMeasurement: { height: 736, width: 360 },
      },
    });

    expect(mockScrollChange).toHaveBeenCalledWith(150);
    expect(getSavedShowcaseScrollOffset()).toBe(150);
  });

  it("restores vertical scroll offset on remount", () => {
    const { getByTestId } = render(
      <HomeScreen
        onSelectMolecule={jest.fn()}
        styles={styles}
        initialScrollOffset={200}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    expect(scrollView.props.contentOffset).toEqual({ x: 0, y: 200 });
  });

  it("cancels pending scroll restoration requestAnimationFrame on unmount", () => {
    const cancelSpy = jest.spyOn(global, "cancelAnimationFrame");
    const { getByTestId, unmount } = render(
      <HomeScreen
        onSelectMolecule={jest.fn()}
        styles={styles}
        initialScrollOffset={100}
      />,
    );

    const scrollView = getByTestId("featured-molecules-scroll");
    act(() => {
      scrollView.props.onContentSizeChange(360, 1200);
    });

    unmount();
    expect(cancelSpy).toHaveBeenCalled();
    cancelSpy.mockRestore();
  });
});
