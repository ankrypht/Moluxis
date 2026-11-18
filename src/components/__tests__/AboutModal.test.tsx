import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import { BackHandler, Linking, Share } from "react-native";
import { AboutModal } from "../AboutModal";
import { getAboutModalStyles } from "../AboutModal.styles";
import { getScaleMetrics } from "../../utils/scaling";
import {
  CONTACT_MAILTO_URL,
  DATA_SOURCES,
  GITHUB_ISSUES_URL,
  GITHUB_LICENSE_URL,
  GITHUB_REPO_URL,
  PLAY_STORE_MARKET_URI,
  PRIVACY_POLICY_URL,
} from "../../constants/distributions";

describe("AboutModal Component", () => {
  const dummyInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const metrics = getScaleMetrics(360, 736, dummyInsets);
  const styles = getAboutModalStyles(metrics);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when visible is false", () => {
    const { queryByTestId } = render(
      <AboutModal visible={false} onClose={jest.fn()} styles={styles} />,
    );
    expect(queryByTestId("about-modal")).toBeNull();
  });

  it("renders author credit, version, open source section, and data sources when visible", () => {
    const { getByTestId, getByText, getAllByText } = render(
      <AboutModal
        visible={true}
        onClose={jest.fn()}
        onOpenWhatsNew={jest.fn()}
        onCheckForUpdates={jest.fn().mockResolvedValue(null)}
        styles={styles}
      />,
    );

    expect(getByTestId("about-modal")).toBeTruthy();
    expect(getByTestId("about-hero-card")).toBeTruthy();
    expect(getByText("About Moluxis")).toBeTruthy();
    expect(getAllByText(/Ankush Sarkar/).length).toBeGreaterThanOrEqual(2);
    expect(getByText("Open Source on GitHub")).toBeTruthy();
    expect(getByText("PubChem")).toBeTruthy();
    expect(getByText("Crystallography Open Database")).toBeTruthy();
    expect(getByText("3Dmol.js")).toBeTruthy();
  });

  it("opens GitHub repository, email feedback, GitHub issues, Play Store, data sources, and legal links", async () => {
    const openSpy = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(undefined as never);

    const { getByTestId } = render(
      <AboutModal visible={true} onClose={jest.fn()} styles={styles} />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-github-row"));
    });
    expect(openSpy).toHaveBeenCalledWith(GITHUB_REPO_URL);

    await act(async () => {
      fireEvent.press(getByTestId("about-email-feedback-button"));
    });
    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining("mailto:ankushsarkar128@gmail.com?subject="),
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-issues-button"));
    });
    expect(openSpy).toHaveBeenCalledWith(GITHUB_ISSUES_URL);

    await act(async () => {
      fireEvent.press(getByTestId("about-rate-row"));
    });
    expect(openSpy).toHaveBeenCalledWith(PLAY_STORE_MARKET_URI);

    await act(async () => {
      fireEvent.press(getByTestId("about-source-pubchem"));
    });
    expect(openSpy).toHaveBeenCalledWith(DATA_SOURCES[0].url);

    await act(async () => {
      fireEvent.press(getByTestId("about-license-chip"));
    });
    expect(openSpy).toHaveBeenCalledWith(GITHUB_LICENSE_URL);

    await act(async () => {
      fireEvent.press(getByTestId("about-privacy-chip"));
    });
    expect(openSpy).toHaveBeenCalledWith(PRIVACY_POLICY_URL);

    await act(async () => {
      fireEvent.press(getByTestId("about-contact-chip"));
    });
    expect(openSpy).toHaveBeenCalledWith(CONTACT_MAILTO_URL);

    openSpy.mockRestore();
  });

  it("shares the app via native Share sheet", async () => {
    const shareSpy = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: Share.sharedAction } as never);

    const { getByTestId } = render(
      <AboutModal visible={true} onClose={jest.fn()} styles={styles} />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-share-row"));
    });

    expect(shareSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(GITHUB_REPO_URL),
      }),
    );
    shareSpy.mockRestore();
  });

  it("closes modal and opens What's New when What's New row is pressed", async () => {
    const onClose = jest.fn();
    const onOpenWhatsNew = jest.fn();

    const { getByTestId } = render(
      <AboutModal
        visible={true}
        onClose={onClose}
        onOpenWhatsNew={onOpenWhatsNew}
        styles={styles}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-whats-new-row"));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpenWhatsNew).toHaveBeenCalledTimes(1);
  });

  it("shows up-to-date feedback when live update check returns null", async () => {
    const onClose = jest.fn();
    const onCheckForUpdates = jest.fn().mockResolvedValue(null);

    const { getByTestId, getByText } = render(
      <AboutModal
        visible={true}
        onClose={onClose}
        onCheckForUpdates={onCheckForUpdates}
        styles={styles}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-check-updates-row"));
    });

    await waitFor(() => {
      expect(getByText(/You're on the latest version/)).toBeTruthy();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes modal when live update check discovers a newer version", async () => {
    const onClose = jest.fn();
    const onCheckForUpdates = jest.fn().mockResolvedValue({
      version: "3.0.0",
      releaseUrl: "https://github.com/ankrypht/Moluxis/releases/latest",
      isNewer: true,
    });

    const { getByTestId } = render(
      <AboutModal
        visible={true}
        onClose={onClose}
        onCheckForUpdates={onCheckForUpdates}
        styles={styles}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-check-updates-row"));
    });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("shows retry message when update check throws", async () => {
    const onCheckForUpdates = jest
      .fn()
      .mockRejectedValue(new Error("Network error"));

    const { getByTestId, getByText } = render(
      <AboutModal
        visible={true}
        onClose={jest.fn()}
        onCheckForUpdates={onCheckForUpdates}
        styles={styles}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("about-check-updates-row"));
    });

    await waitFor(() => {
      expect(getByText(/Couldn't check right now/)).toBeTruthy();
    });
  });

  it("dismisses via close button, backdrop press, and Android hardware back press", async () => {
    let backHandlerCb: (() => boolean | null | undefined) | undefined;
    const backSpy = jest
      .spyOn(BackHandler, "addEventListener")
      .mockImplementation((_event, cb) => {
        backHandlerCb = () => (cb as () => boolean | null | undefined)();
        return { remove: jest.fn() } as never;
      });

    const onClose = jest.fn();
    const { getByTestId } = render(
      <AboutModal
        visible={true}
        onClose={onClose}
        styles={styles}
        isLandscape={true}
        height={390}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId("close-about-modal"));
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByTestId("about-modal-backdrop"));
    });
    expect(onClose).toHaveBeenCalledTimes(2);

    act(() => {
      expect(backHandlerCb?.()).toBe(true);
    });
    expect(onClose).toHaveBeenCalledTimes(3);

    backSpy.mockRestore();
  });
});
