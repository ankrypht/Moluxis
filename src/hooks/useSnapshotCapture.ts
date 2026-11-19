import { useState, useRef, useEffect, useCallback, RefObject } from "react";
import { MoleculeViewerRef } from "../components/MoleculeViewer";

export function useSnapshotCapture(
  moleculeViewerRef: RefObject<MoleculeViewerRef | null>,
) {
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const [isCapturingSnapshot, setIsCapturingSnapshot] = useState(false);
  const snapshotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

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
    setSnapshotUri(null);

    snapshotTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsCapturingSnapshot(false);
      }
    }, 4000);

    moleculeViewerRef.current.captureSnapshot();
  }, [moleculeViewerRef]);

  const handleSnapshotCaptured = useCallback((uri: string | null) => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
      snapshotTimeoutRef.current = null;
    }
    if (isMountedRef.current) {
      setSnapshotUri(uri);
      setIsCapturingSnapshot(false);
    }
  }, []);

  const resetSnapshot = useCallback(() => {
    if (snapshotTimeoutRef.current) {
      clearTimeout(snapshotTimeoutRef.current);
      snapshotTimeoutRef.current = null;
    }
    if (isMountedRef.current) {
      setSnapshotUri(null);
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
