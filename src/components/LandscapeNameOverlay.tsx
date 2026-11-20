import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { OverlaysStyles, getOverlaysStyles } from "./Overlays.styles";
import { useScaleMetrics } from "../utils/scaling";

export interface LandscapeNameOverlayProps {
  name: string;
  styles?: OverlaysStyles;
}

export const LandscapeNameOverlay: React.FC<LandscapeNameOverlayProps> =
  React.memo(({ name, styles: passedStyles }) => {
    const metrics = useScaleMetrics();
    const ownStyles = useMemo(() => getOverlaysStyles(metrics), [metrics]);
    const styles = passedStyles ?? ownStyles;

    return (
      <View style={styles.landscapeNameOverlay} pointerEvents="none">
        <Text allowFontScaling={false} style={styles.landscapeNameText}>
          {name.toUpperCase()}
        </Text>
      </View>
    );
  });

LandscapeNameOverlay.displayName = "LandscapeNameOverlay";
