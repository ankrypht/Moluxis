import { Ionicons } from "@expo/vector-icons";

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

    const payload: CustomAlertPayload = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      buttons: resolvedButtons,
      options,
    };
    this.currentAlert = payload;
    this.listeners.forEach((listener) => listener(payload));
  };

  dismiss = (): void => {
    if (!this.currentAlert) return;
    this.currentAlert = null;
    this.listeners.forEach((listener) => listener(null));
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
  dismiss: (): void => {
    customAlertManager.dismiss();
  },
};
