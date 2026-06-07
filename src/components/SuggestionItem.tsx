import React from "react";
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

    return (
      <TouchableOpacity
        style={[
          styles.suggestionItem,
          { padding: getResponsiveSize(15, width, height) },
        ]}
        onPress={() => onSelect(item)}
      >
        <Ionicons
          allowFontScaling={false}
          name="search-outline"
          size={getResponsiveSize(16, width, height)}
          color={COLORS.textSecondary}
          style={{ marginRight: getResponsiveSize(10, width, height) }}
        />
        <Text
          allowFontScaling={false}
          style={[
            styles.suggestionText,
            { fontSize: getResponsiveSize(16, width, height) },
          ]}
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
