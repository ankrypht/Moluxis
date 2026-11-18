import { useState, useEffect } from "react";
import { Keyboard, Platform, AppState } from "react-native";
import { NavigationBar } from "expo-navigation-bar";

export function useSystemUI() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    // Hide navigation bar on Android only and re-apply on app resume
    if (Platform.OS === "android") {
      NavigationBar.setHidden(true);
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          NavigationBar.setHidden(true);
        }
      });
      return () => subscription.remove();
    }
  }, []);

  return { isKeyboardVisible };
}
