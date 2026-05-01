import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { getResponsiveSize } from "../utils/responsive";

interface PropertyRowProps {
  label: string;
  value: string | undefined;
}

export const PropertyRow: React.FC<PropertyRowProps> = ({ label, value }) => {
  const { width, height } = useWindowDimensions();

  if (!value || value === "N/A") return null;

  const responsiveFontSize = getResponsiveSize(14, width, height);

  return (
    <View
      style={[
        styles.propertyRow,
        { paddingVertical: getResponsiveSize(8, width, height) },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[styles.propertyLabel, { fontSize: responsiveFontSize }]}
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        style={[styles.propertyValue, { fontSize: responsiveFontSize }]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  propertyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  propertyLabel: {
    color: "#AAA",
    flex: 1,
  },
  propertyValue: {
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});
