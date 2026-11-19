import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { MoleculeViewerRef } from "../components/MoleculeViewer";

export function useSnapshotCapture(
  moleculeViewerRef: RefObject<MoleculeViewerRef | null>,
  moleculeKey?: string | null,
) {
  const [snapshotState, setSnapshotState] = useState<{
    moleculeKey: string | null;
    uri: string | null;
  }>({ moleculeKey: null, uri: null });
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Derive snapshotUri: immediately null on the first render of a different molecule
  const snapshotUri =
    moleculeKey !== undefined
      ? snapshotState.moleculeKey === moleculeKey
        ? snapshotState.uri
        : null
      : snapshotState.uri;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
      }
    };
  }, []);

  const handleCaptureSnapshot = useCallback(() => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
      snapshotTimeoutRef.current = null;
    }

    if (!moleculeViewerRef.current) {
      setIsCapturingSnapshot(false);
      return;
    }

    setIsCapturingSnapshot(true);
    setSnapshotState({ moleculeKey: moleculeKey ?? null, uri: null });

    snapshotTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsCapturingSnapshot(false);
      }
    }, 4000);

    moleculeViewerRef.current.captureSnapshot();
  }, [moleculeViewerRef, moleculeKey]);

  const handleSnapshotCaptured = useCallback(
    (uri: string | null) => {
      if (snapshotTimeoutRef.current) {
        clearTimeout(snapshotTimeoutRef.current);
        snapshotTimeoutRef.current = null;
      }
      if (isMountedRef.current) {
        setSnapshotState({ moleculeKey: moleculeKey ?? null, uri });
        setIsCapturingSnapshot(false);
      }
    },
    [moleculeKey],
  );

  const resetSnapshot = useCallback(() => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
      snapshotTimeoutRef.current = null;
    }
    if (isMountedRef.current) {
      setSnapshotState({ moleculeKey: null, uri: null });
      setIsCapturingSnapshot(false);
    }
  }, []);

  return {
    snapshotUri,
    isCapturingSnapshot,
    handleCaptureSnapshot,
    handleSnapshotCaptured,
    resetSnapshot,
  };
}
