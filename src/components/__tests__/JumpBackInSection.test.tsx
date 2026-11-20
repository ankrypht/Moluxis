import { render, fireEvent } from "@testing-library/react-native";
import { JumpBackInSection } from "../JumpBackInSection";
import { getJumpBackInSectionStyles } from "../JumpBackInSection.styles";
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

describe("JumpBackInSection Component", () => {
  const dummyInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const metrics = getScaleMetrics(360, 736, dummyInsets);
  const styles = getJumpBackInSectionStyles(metrics);

  const mockItems: SavedCompoundItem[] = [
    {
      cid: "1234",
      name: "Ethanol",
      formula: "C2H6O",
      timestamp: 1700000000000,
    },
    {
      cid: "5678",
      name: "Benzene",
      formula: "C6H6",
      timestamp: 1699990000000,
    },
  ];

  it("renders null when recentItems is empty", () => {
    const { toJSON } = render(
      <JumpBackInSection
        recentItems={[]}
        bookmarkNamesSet={new Set()}
        onSelectMolecule={jest.fn()}
        styles={styles}
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders recent compound chips with names and formulas", () => {
    const { getByText, getByTestId } = render(
      <JumpBackInSection
        recentItems={mockItems}
        bookmarkNamesSet={new Set(["ethanol"])}
        onSelectMolecule={jest.fn()}
        styles={styles}
      />,
    );

    expect(getByText("Jump Back In")).toBeTruthy();
    expect(getByTestId("recent-chip-ethanol")).toBeTruthy();
    expect(getByTestId("recent-chip-benzene")).toBeTruthy();
    expect(getByText("Ethanol")).toBeTruthy();
    expect(getByText("Benzene")).toBeTruthy();
  });

  it("triggers onSelectMolecule when a chip is tapped", () => {
    const mockSelect = jest.fn();
    const { getByTestId } = render(
      <JumpBackInSection
        recentItems={mockItems}
        bookmarkNamesSet={new Set()}
        onSelectMolecule={mockSelect}
        styles={styles}
      />,
    );

    fireEvent.press(getByTestId("recent-chip-ethanol"));
    expect(mockSelect).toHaveBeenCalledWith("Ethanol");
  });

  it("triggers onOpenHistory when View All button is tapped", () => {
    const mockOpenHistory = jest.fn();
    const { getByTestId } = render(
      <JumpBackInSection
        recentItems={mockItems}
        bookmarkNamesSet={new Set()}
        onSelectMolecule={jest.fn()}
        onOpenHistory={mockOpenHistory}
        styles={styles}
      />,
    );

    const viewAllBtn = getByTestId("jump-back-view-all");
    expect(viewAllBtn).toBeTruthy();
    fireEvent.press(viewAllBtn);
    expect(mockOpenHistory).toHaveBeenCalledTimes(1);
  });
});
