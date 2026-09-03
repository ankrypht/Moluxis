import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getResponsiveSize } from "../utils/responsive";
import { COLORS } from "../constants/colors";

interface SuggestionItemProps {
  item: string;
  onSelect: (item: string) => void;
}

export const SuggestionItem = React.memo<SuggestionItemProps>(
  ({ item, onSelect }) => {
    const { width, height } = useWindowDimensions();

    // Memoize responsive sizes — recalculate only on dimension change, not on
    // every FlatList render pass.
    const sizes = useMemo(
      () => ({
        padding: getResponsiveSize(15, width, height),
        iconSize: getResponsiveSize(16, width, height),
        iconMargin: getResponsiveSize(10, width, height),
        fontSize: getResponsiveSize(16, width, height),
      }),
      [width, height],
    );

    return (
      <TouchableOpacity
        style={[styles.suggestionItem, { padding: sizes.padding }]}
        onPress={() => onSelect(item)}
      >
        <Ionicons
          allowFontScaling={false}
          name="search-outline"
          size={sizes.iconSize}
          color={COLORS.textSecondary}
          style={{ marginRight: sizes.iconMargin }}
        />
        <Text
          allowFontScaling={false}
          style={[styles.suggestionText, { fontSize: sizes.fontSize }]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  },
);

SuggestionItem.displayName = "SuggestionItem";

const styles = StyleSheet.create({
  suggestionItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceElevated,
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    color: COLORS.textPrimary,
  },
});
