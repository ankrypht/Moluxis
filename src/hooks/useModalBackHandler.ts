import { useEffect, useRef } from "react";
import { BackHandler } from "react-native";

/**
 * Intercepts Android hardware back press when a modal is visible,
 * invoking the provided dismiss callback.
 */
export function useModalBackHandler(
  visible: boolean,
  onDismiss: () => void,
): void {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onDismissRef.current();
      return true;
    });
    return () => sub.remove();
  }, [visible]);
}
