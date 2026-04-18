import React, { useMemo } from "react";
import { Text, StyleSheet } from "react-native";

interface ChemicalFormulaProps {
  formula: string;
}

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = React.memo(
  ({ formula }) => {
    const renderedFormula = useMemo(() => {
      const len = formula.length;
      const elements = new Array(len);

      for (let i = 0; i < len; i++) {
        const char = formula[i];
        const isDigit = char >= "0" && char <= "9";

        elements[i] = (
          <Text
            allowFontScaling={false}
            key={i}
            style={isDigit ? styles.subscript : undefined}
          >
            {char}
          </Text>
        );
      }

      return elements;
    }, [formula]);

    return (
      <Text allowFontScaling={false} style={styles.statValue}>
        {renderedFormula}
      </Text>
    );
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
