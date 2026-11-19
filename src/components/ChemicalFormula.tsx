import React, { useMemo } from "react";
import {
  Text,
  StyleSheet,
  useWindowDimensions,
  StyleProp,
  TextStyle,
} from "react-native";
import { getResponsiveSize } from "../utils/responsive";
import { COLORS } from "../constants/colors";
import { formatSubscriptFormula } from "../utils/formula";

export interface ChemicalFormulaProps {
  formula?: string | null;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export const ChemicalFormula: React.FC<ChemicalFormulaProps> = React.memo(
  ({ formula, style, testID }) => {
    const { width, height } = useWindowDimensions();

    const formattedFormula = useMemo(() => {
      return formatSubscriptFormula(formula);
    }, [formula]);

    const computedStyle = useMemo(() => {
      const fontSize = getResponsiveSize(18, width, height);
      return style
        ? [styles.statValue, { fontSize }, style]
        : [styles.statValue, { fontSize }];
    }, [width, height, style]);

    return (
      <Text allowFontScaling={false} testID={testID} style={computedStyle}>
        {formattedFormula}
      </Text>
    );
  },
);

ChemicalFormula.displayName = "ChemicalFormula";

const styles = StyleSheet.create({
  statValue: {
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
});
