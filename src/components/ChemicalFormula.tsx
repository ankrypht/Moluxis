import React, { useMemo } from "react";
import { Text, StyleSheet } from "react-native";

interface ChemicalFormulaProps {
  formula: string;
}

const DIGIT_REGEX = /\d/;

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = React.memo(
  ({ formula }) => {
    const formulaElements = useMemo(
      () =>
        formula.split("").map((char, index) =>
          DIGIT_REGEX.test(char) ? (
            <Text key={index} style={styles.subscript}>
              {char}
            </Text>
          ) : (
            <Text key={index}>{char}</Text>
          ),
        ),
      [formula],
    );

    return <Text style={styles.statValue}>{formulaElements}</Text>;
  },
);

ChemicalFormula.displayName = "ChemicalFormula";

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
