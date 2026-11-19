import { useState, useEffect } from "react";
import { customAlertManager } from "../services/alert/customAlertManager";

export function useActiveAlert(): boolean {
  const [active, setActive] = useState<boolean>(() =>
    Boolean(customAlertManager.getCurrentAlert()),
  );

  useEffect(() => {
    return customAlertManager.subscribe((alert) => {
      setActive(Boolean(alert));
    });
  }, []);

  return active;
}
