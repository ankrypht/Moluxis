import React from "react";
import { Text, StyleSheet } from "react-native";

interface ChemicalFormulaProps {
  formula: string;
}

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = ({
  formula,
}) => {
  return (
    <Text style={styles.statValue}>
      {formula.split("").map((char, index) =>
        /\d/.test(char) ? (
          <Text key={index} style={styles.subscript}>
            {char}
          </Text>
        ) : (
          <Text key={index}>{char}</Text>
        ),
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  statValue: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "700",
  },
  subscript: {
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: "bottom",
  },
});
