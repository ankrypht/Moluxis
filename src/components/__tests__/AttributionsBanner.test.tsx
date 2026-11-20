import { render, fireEvent } from "@testing-library/react-native";
import { AttributionsBanner } from "../AttributionsBanner";
import { getAttributionsBannerStyles } from "../AttributionsBanner.styles";
import { getScaleMetrics } from "../../utils/scaling";
import {
  APP_AUTHOR,
  GITHUB_REPO_URL,
  openExternalUrl,
} from "../../constants/distributions";

jest.mock("../../constants/distributions", () => {
  const actual = jest.requireActual("../../constants/distributions");
  return {
    ...actual,
    openExternalUrl: jest.fn().mockResolvedValue(true),
  };
});

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

describe("AttributionsBanner Component", () => {
  const dummyInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const metrics = getScaleMetrics(360, 736, dummyInsets);
  const styles = getAttributionsBannerStyles(metrics);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders author name, app version, and GitHub link", () => {
    const { getByText, getByTestId } = render(
      <AttributionsBanner styles={styles} />,
    );

    expect(getByText(APP_AUTHOR)).toBeTruthy();
    expect(getByText(/v/)).toBeTruthy();
    expect(getByTestId("showcase-github-button")).toBeTruthy();
    expect(getByText("Open source on GitHub")).toBeTruthy();
  });

  it("triggers openExternalUrl when GitHub link is tapped", () => {
    const { getByTestId } = render(<AttributionsBanner styles={styles} />);

    fireEvent.press(getByTestId("showcase-github-button"));
    expect(openExternalUrl).toHaveBeenCalledWith(GITHUB_REPO_URL);
  });

  it("renders About button when onOpenAbout is provided and calls it on press", () => {
    const mockOpenAbout = jest.fn();
    const { getByTestId } = render(
      <AttributionsBanner styles={styles} onOpenAbout={mockOpenAbout} />,
    );

    const aboutBtn = getByTestId("showcase-about-button");
    expect(aboutBtn).toBeTruthy();
    fireEvent.press(aboutBtn);
    expect(mockOpenAbout).toHaveBeenCalledTimes(1);
  });

  it("does not render About button when onOpenAbout is omitted", () => {
    const { queryByTestId } = render(<AttributionsBanner styles={styles} />);

    expect(queryByTestId("showcase-about-button")).toBeNull();
  });
});
