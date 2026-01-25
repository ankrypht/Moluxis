import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface PropertyRowProps {
  label: string;
  value: string | undefined;
}

export const PropertyRow: React.FC<PropertyRowProps> = ({ label, value }) => {
  if (!value || value === "N/A") return null;

  return (
    <View style={styles.propertyRow}>
      <Text style={styles.propertyLabel}>{label}</Text>
      <Text style={styles.propertyValue}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  propertyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  propertyLabel: {
    fontSize: 14,
    color: "#AAA",
    flex: 1,
  },
  propertyValue: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});
