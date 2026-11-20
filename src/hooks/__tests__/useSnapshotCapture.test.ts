import { renderHook, act } from "@testing-library/react-native";
import { useSnapshotCapture } from "../useSnapshotCapture";
import { MoleculeViewerRef } from "../../components/MoleculeViewer";

describe("useSnapshotCapture", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("initializes with default state", () => {
    const mockRef = { current: null };
    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    expect(result.current.snapshotUri).toBeNull();
    expect(result.current.isCapturingSnapshot).toBe(false);
  });

  it("handles captureSnapshot when viewer ref is null gracefully", () => {
    const mockRef = { current: null };
    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    act(() => {
      result.current.handleCaptureSnapshot();
    });

    expect(result.current.isCapturingSnapshot).toBe(false);
    expect(result.current.snapshotUri).toBeNull();
  });

  it("triggers viewer captureSnapshot and sets isCapturingSnapshot", () => {
    const captureSnapshot = jest.fn();
    const mockRef = {
      current: {
        captureSnapshot,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    act(() => {
      result.current.handleCaptureSnapshot();
    });

    expect(result.current.isCapturingSnapshot).toBe(true);
    expect(captureSnapshot).toHaveBeenCalledTimes(1);
  });

  it("updates state and cancels timeout when handleSnapshotCaptured is called with URI", () => {
    const captureSnapshot = jest.fn();
    const mockRef = {
      current: {
        captureSnapshot,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    act(() => {
      result.current.handleCaptureSnapshot();
    });
    expect(result.current.isCapturingSnapshot).toBe(true);

    act(() => {
      result.current.handleSnapshotCaptured(
        "data:image/png;base64,captured-data",
      );
    });

    expect(result.current.isCapturingSnapshot).toBe(false);
    expect(result.current.snapshotUri).toBe(
      "data:image/png;base64,captured-data",
    );

    // Advance past 4000ms to ensure no delayed timeout resets snapshot
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.snapshotUri).toBe(
      "data:image/png;base64,captured-data",
    );
    expect(result.current.isCapturingSnapshot).toBe(false);
  });

  it("handles synchronous completion without leaving orphaned timeout", () => {
    let hookResult: any;
    const captureSnapshot = jest.fn(() => {
      // Simulates synchronous callback when webview is not ready
      hookResult.current.handleSnapshotCaptured(null);
    });

    const mockRef = {
      current: {
        captureSnapshot,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));
    hookResult = result;

    act(() => {
      result.current.handleCaptureSnapshot();
    });

    expect(captureSnapshot).toHaveBeenCalledTimes(1);
    expect(result.current.isCapturingSnapshot).toBe(false);
    expect(result.current.snapshotUri).toBeNull();

    // Fast-forward timers - nothing should throw or re-trigger
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.isCapturingSnapshot).toBe(false);
  });

  it("times out after 4000ms if captureSnapshot never responds", () => {
    const captureSnapshot = jest.fn();
    const mockRef = {
      current: {
        captureSnapshot,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    act(() => {
      result.current.handleCaptureSnapshot();
    });

    expect(result.current.isCapturingSnapshot).toBe(true);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(result.current.isCapturingSnapshot).toBe(false);
    expect(result.current.snapshotUri).toBeNull();
  });

  it("resets snapshot state and clears pending timeout", () => {
    const captureSnapshot = jest.fn();
    const mockRef = {
      current: {
        captureSnapshot,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    act(() => {
      result.current.handleSnapshotCaptured("data:image/png;base64,sample");
    });
    expect(result.current.snapshotUri).toBe("data:image/png;base64,sample");

    act(() => {
      result.current.resetSnapshot();
    });

    expect(result.current.snapshotUri).toBeNull();
    expect(result.current.isCapturingSnapshot).toBe(false);
  });

  it("handleCaptureFullSnapshot delegates to viewer captureSnapshotAsync with full resolution", async () => {
    const captureSnapshotAsync = jest
      .fn()
      .mockResolvedValue("data:image/png;base64,high-res");
    const mockRef = {
      current: {
        captureSnapshot: jest.fn(),
        captureSnapshotAsync,
      } as unknown as MoleculeViewerRef,
    };

    const { result } = renderHook(() => useSnapshotCapture(mockRef));

    let fullSnapshotUri: string | null = null;
    await act(async () => {
      fullSnapshotUri = await result.current.handleCaptureFullSnapshot();
    });

    expect(captureSnapshotAsync).toHaveBeenCalledWith({ resolution: "full" });
    expect(fullSnapshotUri).toBe("data:image/png;base64,high-res");
    // snapshotUri in state must NOT be modified by full capture (avoids heap pressure)
    expect(result.current.snapshotUri).toBeNull();
  });
});
