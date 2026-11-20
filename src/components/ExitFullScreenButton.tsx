import React, { useMemo } from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../constants/colors";
import { OverlaysStyles, getOverlaysStyles } from "./Overlays.styles";
import { triggerZenModeHaptic } from "../utils/haptics";
import { useScaleMetrics } from "../utils/scaling";

export interface ExitFullScreenButtonProps {
  onPress: () => void;
  styles?: OverlaysStyles;
}

export const ExitFullScreenButton: React.FC<ExitFullScreenButtonProps> =
  React.memo(({ onPress, styles: passedStyles }) => {
    const metrics = useScaleMetrics();
    const ownStyles = useMemo(() => getOverlaysStyles(metrics), [metrics]);
    const styles = passedStyles ?? ownStyles;

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
  });

ExitFullScreenButton.displayName = "ExitFullScreenButton";
