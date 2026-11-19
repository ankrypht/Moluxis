import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Keyboard,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Insets, getScaleMetrics } from "../utils/scaling";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, addOpacity } from "../constants/colors";
import { triggerSelectionHaptic, triggerWarningHaptic } from "../utils/haptics";
import { getCustomAlertStyles, CustomAlertStyles } from "./CustomAlert.styles";
import {
  AlertButtonStyle,
  CustomAlertButton,
  CustomAlertType,
  CustomAlertOptions,
  CustomAlertPayload,
  AlertListener,
  CustomAlertManagerClass,
  customAlertManager,
  Alert,
  resetAlertIdCounter,
} from "../services/alert/customAlertManager";

import { useActiveAlert } from "../hooks/useActiveAlert";

export type {
  AlertButtonStyle,
  CustomAlertButton,
  CustomAlertType,
  CustomAlertOptions,
  CustomAlertPayload,
  AlertListener,
};
export {
  CustomAlertManagerClass,
  customAlertManager,
  Alert,
  useActiveAlert,
  resetAlertIdCounter,
};

interface ResolvedTheme {
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
}

export function resolveAlertTheme(
  title: string,
  buttons: CustomAlertButton[],
  options?: CustomAlertOptions,
): ResolvedTheme {
  const lowerTitle = (title || "").toLowerCase();
  const hasDestructive = buttons.some((b) => b.style === "destructive");

  if (options?.icon) {
    const accentColor =
      options.type === "destructive"
        ? COLORS.danger
        : options.type === "warning"
          ? COLORS.warning
          : options.type === "error"
            ? COLORS.danger
            : options.type === "success"
              ? COLORS.emerald
              : COLORS.primary;

    return {
      iconName: options.icon,
      accentColor,
      badgeBg: addOpacity(accentColor, 0.14),
      badgeBorder: addOpacity(accentColor, 0.35),
    };
  }

  if (
    options?.type === "destructive" ||
    hasDestructive ||
    lowerTitle.includes("clear") ||
    lowerTitle.includes("delete") ||
    lowerTitle.includes("remove")
  ) {
    return {
      iconName: "trash-outline",
      accentColor: COLORS.danger,
      badgeBg: addOpacity(COLORS.danger, 0.14),
      badgeBorder: addOpacity(COLORS.danger, 0.35),
    };
  }

  if (
    options?.type === "error" ||
    lowerTitle.includes("error") ||
    lowerTitle.includes("invalid") ||
    lowerTitle.includes("failed")
  ) {
    return {
      iconName: "alert-circle-outline",
      accentColor: COLORS.danger,
      badgeBg: addOpacity(COLORS.danger, 0.14),
      badgeBorder: addOpacity(COLORS.danger, 0.35),
    };
  }

  if (
    options?.type === "warning" ||
    lowerTitle.includes("unavailable") ||
    lowerTitle.includes("busy") ||
    lowerTitle.includes("warning")
  ) {
    const isBusy = lowerTitle.includes("busy");
    return {
      iconName: isBusy ? "hourglass-outline" : "warning-outline",
      accentColor: COLORS.warning,
      badgeBg: addOpacity(COLORS.warning, 0.14),
      badgeBorder: addOpacity(COLORS.warning, 0.35),
    };
  }

  if (lowerTitle.includes("not found")) {
    return {
      iconName: "search-outline",
      accentColor: COLORS.cyan,
      badgeBg: addOpacity(COLORS.cyan, 0.14),
      badgeBorder: addOpacity(COLORS.cyan, 0.35),
    };
  }

  if (options?.type === "success" || lowerTitle.includes("success")) {
    return {
      iconName: "checkmark-circle-outline",
      accentColor: COLORS.emerald,
      badgeBg: addOpacity(COLORS.emerald, 0.14),
      badgeBorder: addOpacity(COLORS.emerald, 0.35),
    };
  }

  return {
    iconName: "information-circle-outline",
    accentColor: COLORS.primary,
    badgeBg: addOpacity(COLORS.primary, 0.14),
    badgeBorder: addOpacity(COLORS.primary, 0.35),
  };
}

const DEFAULT_INSETS: Insets = { top: 0, bottom: 0, left: 0, right: 0 };

export interface CustomAlertModalProps {
  styles?: Partial<CustomAlertStyles>;
  insets?: Insets;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = React.memo(
  ({ styles: passedStyles, insets: passedInsets }) => {
    const { width, height } = useWindowDimensions();
    const insets = passedInsets || DEFAULT_INSETS;
    const [alertData, setAlertData] = useState<CustomAlertPayload | null>(null);
    const currentAlertIdRef = useRef<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;

    const metrics = useMemo(
      () => getScaleMetrics(width, height, insets),
      [width, height, insets],
    );

    const styles = useMemo(() => {
      const defaultStyles = getCustomAlertStyles(metrics);
      if (!passedStyles) return defaultStyles;
      return {
        ...defaultStyles,
        ...passedStyles,
      };
    }, [metrics, passedStyles]);

    useEffect(() => {
      const unsubscribe = customAlertManager.subscribe((incoming) => {
        if (incoming) {
          Keyboard.dismiss();
          currentAlertIdRef.current = incoming.id;
          setAlertData(incoming);
          fadeAnim.setValue(0);
          scaleAnim.setValue(0.92);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          currentAlertIdRef.current = null;
          setAlertData((prev) => {
            if (!prev) return null;
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 130,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0.94,
                duration: 130,
                useNativeDriver: true,
              }),
            ]).start((result) => {
              if (result && !result.finished) return;
              setAlertData((currentAlert) => {
                if (currentAlert && currentAlert.id === prev.id) {
                  return null;
                }
                return currentAlert;
              });
            });
            return prev;
          });
        }
      });

      return () => {
        unsubscribe();
        fadeAnim.stopAnimation();
        scaleAnim.stopAnimation();
      };
    }, [fadeAnim, scaleAnim]);

    const handleDismissAnimation = useCallback(
      (dismissingId?: string, onComplete?: () => void) => {
        const dismissingAlertId = dismissingId ?? currentAlertIdRef.current;
        if (
          dismissingAlertId &&
          customAlertManager.getCurrentAlert()?.id !== dismissingAlertId
        ) {
          return;
        }

        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 130,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.94,
            duration: 130,
            useNativeDriver: true,
          }),
        ]).start((result) => {
          if (result && !result.finished) return;
          setAlertData((currentAlert) => {
            if (
              !currentAlert ||
              (dismissingAlertId && currentAlert.id !== dismissingAlertId)
            ) {
              return currentAlert;
            }
            return null;
          });
          customAlertManager.dismiss(dismissingAlertId ?? undefined);
          onComplete?.();
        });
      },
      [fadeAnim, scaleAnim],
    );

    const handleBackdropPress = useCallback(() => {
      if (!alertData) return;
      if (alertData.options?.cancelable === false) return;

      const dismissingAlertId = alertData.id;
      const cancelButton = alertData.buttons.find((b) => b.style === "cancel");
      cancelButton?.onPress?.();
      alertData.options?.onDismiss?.();

      if (
        dismissingAlertId &&
        customAlertManager.getCurrentAlert()?.id !== dismissingAlertId
      ) {
        return;
      }
      handleDismissAnimation(dismissingAlertId);
    }, [alertData, handleDismissAnimation]);

    const handleButtonPress = useCallback(
      (button: CustomAlertButton) => {
        if (!alertData) return;
        const dismissingAlertId = alertData.id;

        if (button.style === "destructive") {
          triggerWarningHaptic();
        } else {
          triggerSelectionHaptic();
        }
        button.onPress?.();

        if (
          dismissingAlertId &&
          customAlertManager.getCurrentAlert()?.id !== dismissingAlertId
        ) {
          return;
        }
        handleDismissAnimation(dismissingAlertId);
      },
      [alertData, handleDismissAnimation],
    );

    if (!alertData) {
      return null;
    }

    const { title, message, buttons, options } = alertData;
    const theme = resolveAlertTheme(title, buttons, options);

    const shouldUseRowLayout =
      buttons.length === 2 && buttons.every((b) => (b.text || "").length <= 14);

    return (
      <View style={styles.alertContainer} testID="custom-alert-container">
        {/* Semi-transparent backdrop strictly behind the card */}
        <Animated.View
          style={[styles.alertBackdrop, { opacity: fadeAnim }]}
          pointerEvents="auto"
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
            accessible={false}
            testID="custom-alert-backdrop"
          />
        </Animated.View>

        {/* Elevated crisp Alert Card */}
        <Animated.View
          style={[
            styles.alertCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          testID="custom-alert-card"
          accessibilityRole="alert"
        >
          {/* Contextual Icon Badge */}
          <View
            style={[
              styles.alertIconBadge,
              {
                backgroundColor: theme.badgeBg,
                borderColor: theme.badgeBorder,
              },
            ]}
            testID="custom-alert-icon-badge"
          >
            <Ionicons
              name={theme.iconName}
              size={metrics.scaleSize(26)}
              color={theme.accentColor}
            />
          </View>

          {/* Title */}
          <Text
            allowFontScaling={false}
            style={styles.alertTitle}
            testID="custom-alert-title"
            accessibilityRole="header"
          >
            {title}
          </Text>

          {/* Message (if present) */}
          {message ? (
            <Text
              allowFontScaling={false}
              style={styles.alertMessage}
              testID="custom-alert-message"
            >
              {message}
            </Text>
          ) : null}

          {/* Buttons Container */}
          <View
            style={
              shouldUseRowLayout
                ? styles.alertButtonRow
                : styles.alertButtonColumn
            }
            testID="custom-alert-buttons-container"
          >
            {buttons.map((btn, index) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";

              const buttonStyle = [
                shouldUseRowLayout
                  ? styles.alertButton
                  : styles.alertButtonFullWidth,
                isDestructive
                  ? styles.alertButtonDestructive
                  : isCancel
                    ? styles.alertButtonSecondary
                    : styles.alertButtonPrimary,
              ];

              const textStyle = [
                styles.alertButtonText,
                isDestructive
                  ? styles.alertButtonTextDestructive
                  : isCancel
                    ? styles.alertButtonTextSecondary
                    : styles.alertButtonTextPrimary,
              ];

              return (
                <TouchableOpacity
                  key={`${btn.text || "btn"}-${index}`}
                  style={buttonStyle}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={btn.text || "OK"}
                  testID={`custom-alert-button-${index}`}
                >
                  <Text allowFontScaling={false} style={textStyle}>
                    {btn.text || "OK"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    );
  },
);

CustomAlertModal.displayName = "CustomAlertModal";
