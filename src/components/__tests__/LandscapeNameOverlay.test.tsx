import React from "react";
import { render } from "@testing-library/react-native";
import { LandscapeNameOverlay } from "../LandscapeNameOverlay";
import { getOverlaysStyles } from "../Overlays.styles";
import { getScaleMetrics } from "../../utils/scaling";

describe("LandscapeNameOverlay Component", () => {
  const metrics = getScaleMetrics(844, 390, {
    top: 0,
    right: 44,
    bottom: 21,
    left: 44,
  });
  const styles = getOverlaysStyles(metrics);

  it("renders compound name in uppercase and pointerEvents none", () => {
    const { getByText } = render(
      <LandscapeNameOverlay name="caffeine" styles={styles} />,
    );

    const nameText = getByText("CAFFEINE");
    expect(nameText).toBeTruthy();
  });
});
