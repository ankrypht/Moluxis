import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { OverlaysStyles } from "./Overlays.styles";
import { triggerZenModeHaptic } from "../utils/haptics";

export interface ExitFullScreenButtonProps {
  onPress: () => void;
  styles: OverlaysStyles;
}

export const ExitFullScreenButton: React.FC<ExitFullScreenButtonProps> = ({
  onPress,
  styles,
}) => {
  return (
    <TouchableOpacity
      style={styles.exitFullScreenButton}
      onPress={() => {
        triggerZenModeHaptic();
        onPress();
      }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Exit Zen mode"
    >
      <Ionicons
        allowFontScaling={false}
        name="contract-outline"
        size={22}
        color={COLORS.primary}
      />
    </TouchableOpacity>
  );
};
