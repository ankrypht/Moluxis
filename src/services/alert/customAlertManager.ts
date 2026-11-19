import Ionicons from "@expo/vector-icons/Ionicons";

export type AlertButtonStyle = "default" | "cancel" | "destructive";

export interface CustomAlertButton {
  text?: string;
  onPress?: () => void;
  style?: AlertButtonStyle;
}

export type CustomAlertType =
  "default" | "info" | "warning" | "error" | "destructive" | "success";

export interface CustomAlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  type?: CustomAlertType;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface CustomAlertPayload {
  id: string;
  title: string;
  message?: string;
  buttons: CustomAlertButton[];
  options?: CustomAlertOptions;
}

export type AlertListener = (alert: CustomAlertPayload | null) => void;

let alertIdCounter = 0;

export function resetAlertIdCounter(): void {
  alertIdCounter = 0;
}

export class CustomAlertManagerClass {
  private listeners: Set<AlertListener> = new Set();
  private currentAlert: CustomAlertPayload | null = null;

  subscribe(listener: AlertListener): () => void {
    this.listeners.add(listener);
    if (this.currentAlert) {
      listener(this.currentAlert);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  alert = (
    title: string,
    message?: string,
    buttons?: CustomAlertButton[],
    options?: CustomAlertOptions,
  ): void => {
    const resolvedButtons: CustomAlertButton[] =
      buttons && buttons.length > 0
        ? buttons
        : [{ text: "OK", style: "default" }];

    alertIdCounter += 1;
    const payload: CustomAlertPayload = {
      id: `alert-${alertIdCounter}`,
      title,
      message,
      buttons: resolvedButtons,
      options,
    };
    this.currentAlert = payload;
    this.listeners.forEach((listener) => listener(payload));
  };

  dismiss = (id?: string): void => {
    if (!this.currentAlert) return;
    if (id && this.currentAlert.id !== id) return;
    this.currentAlert = null;
    this.listeners.forEach((listener) => listener(null));
  };

  handleBackPress = (): boolean => {
    if (!this.currentAlert) return false;
    if (this.currentAlert.options?.cancelable === false) {
      return true;
    }
    const current = this.currentAlert;
    const cancelButton = current.buttons.find((b) => b.style === "cancel");
    cancelButton?.onPress?.();
    current.options?.onDismiss?.();
    this.dismiss(current.id);
    return true;
  };

  getCurrentAlert = (): CustomAlertPayload | null => {
    return this.currentAlert;
  };
}

export const customAlertManager = new CustomAlertManagerClass();

export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: CustomAlertButton[],
    options?: CustomAlertOptions,
  ): void => {
    customAlertManager.alert(title, message, buttons, options);
  },
  dismiss: (id?: string): void => {
    customAlertManager.dismiss(id);
  },
  handleBackPress: (): boolean => {
    return customAlertManager.handleBackPress();
  },
  getCurrentAlert: (): CustomAlertPayload | null => {
    return customAlertManager.getCurrentAlert();
  },
};
