import React, { useMemo } from "react";
import { Text, StyleSheet, useWindowDimensions } from "react-native";
import { getResponsiveSize } from "../utils/responsive";

interface ChemicalFormulaProps {
  formula: string;
}

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = React.memo(
  ({ formula }) => {
    const { width, height } = useWindowDimensions();

    const renderedFormula = useMemo(() => {
      // Split the string into chunks of digits and non-digits
      const chunks = formula.split(/(\d+)/).filter(Boolean);

      return chunks.map((chunk, index) => {
        const isDigit = /^\d+$/.test(chunk);

        return (
          <Text
            key={index}
            style={
              isDigit
                ? [
                    styles.subscript,
                    {
                      fontSize: getResponsiveSize(12, width, height),
                      lineHeight: getResponsiveSize(18, width, height),
                    },
                  ]
                : undefined
            }
          >
            {chunk}
          </Text>
        );
      });
    }, [formula, width, height]);

    return (
      <Text
        style={[
          styles.statValue,
          { fontSize: getResponsiveSize(16, width, height) },
        ]}
      >
        {renderedFormula}
      </Text>
    );
  },
);

ChemicalFormula.displayName = "ChemicalFormula";

const styles = StyleSheet.create({
  statValue: {
    color: "#FFF",
    fontWeight: "700",
  },
  subscript: {
    textAlignVertical: "bottom",
  },
});
