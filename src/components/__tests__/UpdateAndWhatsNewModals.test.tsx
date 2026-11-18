import { render, fireEvent, act } from "@testing-library/react-native";
import { getScaleMetrics } from "../../utils/scaling";
import { AppReleaseInfo } from "../../constants/distributions";
import { UpdateAvailableModal } from "../UpdateAvailableModal";
import { getUpdateAvailableModalStyles } from "../UpdateAvailableModal.styles";
import { WhatsNewModal } from "../WhatsNewModal";
import { getWhatsNewModalStyles } from "../WhatsNewModal.styles";
import {
  openUpdateDestination,
  snoozeUpdatePrompt,
} from "../../services/updates/appUpdateChecker";
import { markCurrentVersionSeen } from "../../services/updates/updateNoticeService";

jest.mock("../../services/updates/appUpdateChecker", () => ({
  openUpdateDestination: jest.fn().mockResolvedValue(undefined),
  snoozeUpdatePrompt: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../services/updates/updateNoticeService", () => ({
  CURRENT_RELEASE_NOTES: {
    version: "2.1.1",
    releaseDate: "October 2026",
    features: ["Feature A"],
    improvements: ["Improvement B"],
    fixes: ["Fix C"],
  },
  markCurrentVersionSeen: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../utils/haptics", () => ({
  triggerImpactLight: jest.fn(),
  triggerSelectionHaptic: jest.fn(),
}));

const metrics = getScaleMetrics(360, 736, {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});
const updateStyles = getUpdateAvailableModalStyles(metrics);
const whatsNewStyles = getWhatsNewModalStyles(metrics);

const baseRelease: AppReleaseInfo = {
  version: "2.2.0",
  releaseTitle: "Moluxis 2.2.0",
  releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
  isNewer: true,
};

describe("UpdateAvailableModal & WhatsNewModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders UpdateAvailableModal and updates on Google Play", async () => {
    const onDismiss = jest.fn();
    const { getByTestId, getByText } = render(
      <UpdateAvailableModal
        visible={true}
        releaseInfo={baseRelease}
        onDismiss={onDismiss}
        styles={updateStyles}
      />,
    );

    expect(getByText("v2.2.0 Available")).toBeTruthy();
    expect(getByText("Update on Google Play")).toBeTruthy();
    expect(
      getByText(
        /A newer version of Moluxis \(v2\.2\.0\) is ready on Google Play/,
      ),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("update-primary-button"));
    });

    expect(openUpdateDestination).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("snoozes update prompt for 24h when Remind Me Later is pressed", async () => {
    const onDismiss = jest.fn();
    const { getByTestId } = render(
      <UpdateAvailableModal
        visible={true}
        releaseInfo={baseRelease}
        onDismiss={onDismiss}
        styles={updateStyles}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("update-snooze-button"));
    });

    expect(snoozeUpdatePrompt).toHaveBeenCalledWith(24);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders WhatsNewModal and marks version seen on confirmation", async () => {
    const onClose = jest.fn();

    const { getByTestId, getByText } = render(
      <WhatsNewModal
        visible={true}
        onClose={onClose}
        styles={whatsNewStyles}
      />,
    );

    expect(getByText("Feature A")).toBeTruthy();
    expect(getByText("Improvement B")).toBeTruthy();
    expect(getByText("Fix C")).toBeTruthy();
    expect(getByText("Got It")).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId("whats-new-dismiss-button"));
    });

    expect(markCurrentVersionSeen).toHaveBeenCalledWith("2.1.1");
    expect(onClose).toHaveBeenCalled();
  });
});
