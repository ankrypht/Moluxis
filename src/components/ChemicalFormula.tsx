import React, { useMemo } from "react";
import { Text, StyleSheet } from "react-native";

interface ChemicalFormulaProps {
  formula: string;
}

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = React.memo(
  ({ formula }) => {
    const renderedFormula = useMemo(() => {
      // Split the string into chunks of digits and non-digits
      const chunks = formula.split(/(\d+)/).filter(Boolean);

      return chunks.map((chunk, index) => {
        const isDigit = /^\d+$/.test(chunk);

        return (
          <Text
            allowFontScaling={false}
            key={index}
            style={isDigit ? styles.subscript : undefined}
          >
            {chunk}
          </Text>
        );
      });
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
