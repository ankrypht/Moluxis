import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { OverlaysStyles } from "./Overlays.styles";

export interface ExitFullScreenButtonProps {
  onPress: () => void;
  styles: OverlaysStyles;
}

export const ExitFullScreenButton: React.FC<ExitFullScreenButtonProps> = ({
  onPress,
  styles,
}) => {
  return (
    <TouchableOpacity style={styles.exitFullScreenButton} onPress={onPress}>
      <Ionicons
        allowFontScaling={false}
        name="contract-outline"
        size={24}
        color={COLORS.textPrimary}
      />
    </TouchableOpacity>
  );
};
