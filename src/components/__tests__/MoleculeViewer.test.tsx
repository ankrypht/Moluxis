import React from "react";
import { render, act } from "@testing-library/react-native";
import { MoleculeViewer } from "../MoleculeViewer";
import { MoleculeInfo } from "../../types";

const mockPostMessage = jest.fn();

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => <View testID="mock-icon" {...props} />,
  };
});

jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");

  const MockWebView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      postMessage: mockPostMessage,
      reload: jest.fn(),
    }));
    return <View testID="molecule-webview" {...props} />;
  });

  MockWebView.displayName = "MockWebView";

  return {
    WebView: MockWebView,
  };
});

const mockStyles: any = {
  viewerContainer: {},
  webview: {},
  loadingOverlay: {},
  loadingText: {},
  showcaseContainer: {},
};

const sampleMolecule: MoleculeInfo = {
  name: "Caffeine",
  formula: "C8H10N4O2",
  molecularWeight: "194.19 g/mol",
  cid: "2519",
  sdf2d: "sdf2d-data",
  sdf3d: "sdf3d-data",
  cif: "",
  codId: null,
  useCif: false,
  synonyms: ["caffeine"],
  description: "Caffeine description",
  properties: {},
  safety: {},
};

describe("MoleculeViewer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows showcase when moleculeData is null and isLoading is false", () => {
    const { getByText, queryByTestId } = render(
      <MoleculeViewer
        moleculeData={null}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
      />,
    );

    expect(getByText("Featured Molecules")).toBeTruthy();
    expect(queryByTestId("molecule-webview")).toBeNull();
  });

  it("shows loading overlay on fresh mount before WEBVIEW_READY arrives, and dispatches structure on WEBVIEW_READY", async () => {
    const { getByTestId, getByText, queryByText } = render(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
      />,
    );

    // Initial mount: WebView mounted, but not ready yet -> shows loading overlay
    expect(getByTestId("molecule-webview")).toBeTruthy();
    expect(getByText("Generating 3D Structure...")).toBeTruthy();

    const webview = getByTestId("molecule-webview");

    // Simulate WEBVIEW_READY message from WebView
    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: "WEBVIEW_READY" }),
        },
      });
    });

    // Structure message dispatched to WebView
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"type":"LOAD_STRUCTURE"'),
    );
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining("sdf3d-data"),
    );

    // Loading overlay dismissed once ready
    expect(queryByText("Generating 3D Structure...")).toBeNull();
  });

  it("safely dispatches structure upon WEBVIEW_READY even if 1500ms fallback retry timer fired beforehand", async () => {
    const { getByTestId, queryByText } = render(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
      />,
    );

    const webview = getByTestId("molecule-webview");

    // Advance timers past 1500ms fallback timeout (simulating slow CDN script load)
    act(() => {
      jest.advanceTimersByTime(1600);
    });

    mockPostMessage.mockClear();

    // Now WebView finishes loading and sends WEBVIEW_READY
    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: "WEBVIEW_READY" }),
        },
      });
    });

    // Structure MUST still be dispatched upon WEBVIEW_READY!
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"type":"LOAD_STRUCTURE"'),
    );
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining("sdf3d-data"),
    );
    expect(queryByText("Generating 3D Structure...")).toBeNull();
  });

  it("updates settings via UPDATE_SETTINGS without re-loading the structure", async () => {
    const { getByTestId, rerender } = render(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
      />,
    );

    const webview = getByTestId("molecule-webview");

    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: "WEBVIEW_READY" }),
        },
      });
    });

    mockPostMessage.mockClear();

    // Change style to "stick"
    rerender(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="stick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"type":"UPDATE_SETTINGS"'),
    );
    expect(mockPostMessage).toHaveBeenCalledWith(
      expect.stringContaining('"style":"stick"'),
    );
  });

  it("pauses animation when isInteracting becomes true and resumes when isInteracting becomes false", () => {
    const { getByTestId, rerender } = render(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        isInteracting={false}
        styles={mockStyles}
      />,
    );

    const webview = getByTestId("molecule-webview");

    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: "WEBVIEW_READY" }),
        },
      });
    });

    mockPostMessage.mockClear();

    // User starts interacting with search/modals/sheets
    rerender(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        isInteracting={true}
        styles={mockStyles}
      />,
    );

    expect(mockPostMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: "PAUSE_ANIMATION" }),
    );

    mockPostMessage.mockClear();

    // User finishes interacting
    rerender(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        isInteracting={false}
        styles={mockStyles}
      />,
    );

    expect(mockPostMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: "RESUME_ANIMATION" }),
    );
  });

  it("captures snapshot via ref and triggers onSnapshotCaptured when SNAPSHOT_RESULT is received", () => {
    const onSnapshotCaptured = jest.fn();
    const viewerRef = React.createRef<any>();

    const { getByTestId } = render(
      <MoleculeViewer
        ref={viewerRef}
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
        onSnapshotCaptured={onSnapshotCaptured}
      />,
    );

    const webview = getByTestId("molecule-webview");

    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({ type: "WEBVIEW_READY" }),
        },
      });
    });

    mockPostMessage.mockClear();

    act(() => {
      viewerRef.current?.captureSnapshot();
    });

    expect(mockPostMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: "CAPTURE_SNAPSHOT" }),
    );

    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            type: "SNAPSHOT_RESULT",
            dataUri: "data:image/png;base64,sample-base64",
          }),
        },
      });
    });

    expect(onSnapshotCaptured).toHaveBeenCalledWith(
      "data:image/png;base64,sample-base64",
    );
  });

  it("calls onSnapshotCaptured with null when SNAPSHOT_ERROR is received", () => {
    const onSnapshotCaptured = jest.fn();
    const { getByTestId } = render(
      <MoleculeViewer
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
        onSnapshotCaptured={onSnapshotCaptured}
      />,
    );

    const webview = getByTestId("molecule-webview");

    act(() => {
      webview.props.onMessage({
        nativeEvent: {
          data: JSON.stringify({
            type: "SNAPSHOT_ERROR",
            error: "Viewer not initialized",
          }),
        },
      });
    });

    expect(onSnapshotCaptured).toHaveBeenCalledWith(null);
  });

  it("calls onSnapshotCaptured with null if captureSnapshot is called before webview is ready", () => {
    const onSnapshotCaptured = jest.fn();
    const viewerRef = React.createRef<any>();

    render(
      <MoleculeViewer
        ref={viewerRef}
        moleculeData={sampleMolecule}
        isLoading={false}
        structureFormat="3d"
        vizStyle="ballStick"
        showLabels={false}
        isAnimated={true}
        styles={mockStyles}
        onSnapshotCaptured={onSnapshotCaptured}
      />,
    );

    act(() => {
      viewerRef.current?.captureSnapshot();
    });

    expect(onSnapshotCaptured).toHaveBeenCalledWith(null);
  });
});
