import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SuggestionItemProps {
  item: string;
  onSelect: (item: string) => void;
}

export const SuggestionItem = React.memo<SuggestionItemProps>(({ item, onSelect }) => (
  <TouchableOpacity
    style={styles.suggestionItem}
    onPress={() => onSelect(item)}
  >
    <Ionicons
      name="search-outline"
      size={16}
      color="#AAA"
      style={{ marginRight: 10 }}
    />
    <Text style={styles.suggestionText}>{item}</Text>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2C",
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionText: {
    fontSize: 16,
    color: "#DDD",
  },
});
