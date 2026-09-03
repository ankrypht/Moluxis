import React from "react";
import { View, Text } from "react-native";
import { OverlaysStyles } from "./Overlays.styles";

export interface LandscapeNameOverlayProps {
  name: string;
  styles: OverlaysStyles;
}

export const LandscapeNameOverlay: React.FC<LandscapeNameOverlayProps> = ({
  name,
  styles,
}) => {
  return (
    <View style={styles.landscapeNameOverlay} pointerEvents="none">
      <Text allowFontScaling={false} style={styles.landscapeNameText}>
        {name.toUpperCase()}
      </Text>
    </View>
  );
};
