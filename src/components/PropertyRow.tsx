import React, { useMemo } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { scaleSize } from "../utils/scaling";
import { COLORS } from "../constants/colors";

interface PropertyRowProps {
  label: string;
  value: string | undefined;
}

export const PropertyRow: React.FC<PropertyRowProps> = React.memo(
  ({ label, value }) => {
    const { width, height } = useWindowDimensions();

    const computedStyles = useMemo(() => {
      const fontSize = scaleSize(14, width, height);
      const paddingVertical = scaleSize(8, width, height);
      return {
        row: [styles.propertyRow, { paddingVertical }],
        label: [styles.propertyLabel, { fontSize }],
        value: [styles.propertyValue, { fontSize }],
      };
    }, [width, height]);

    if (!value || value === "N/A") return null;

    return (
      <View style={computedStyles.row}>
        <Text allowFontScaling={false} style={computedStyles.label}>
          {label}
        </Text>
        <Text allowFontScaling={false} style={computedStyles.value}>
          {value}
        </Text>
      </View>
    );
  },
);

PropertyRow.displayName = "PropertyRow";

const styles = StyleSheet.create({
  propertyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  propertyLabel: {
    color: COLORS.textSecondary,
    flex: 1,
  },
  propertyValue: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});
