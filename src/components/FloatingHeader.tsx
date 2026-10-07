import React, { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MoleculeInfo } from "../types";
import { COLORS } from "../constants/colors";
import { SuggestionItem } from "./SuggestionItem";
import { StructureControls } from "./StructureControls";
import { FloatingHeaderStyles } from "./FloatingHeader.styles";
import { StructureControlsStyles } from "./StructureControls.styles";

export interface FloatingHeaderProps {
  searchInputRef: React.RefObject<TextInput | null>;
  searchText: string;
  suggestions: string[];
  showSuggestions: boolean;
  isLoading: boolean;
  moleculeData: MoleculeInfo | null;
  isLandscape: boolean;
  showInfo: boolean;
  isAnimated: boolean;
  structureFormat: "3d" | "2d";
  containerStyle?: StyleProp<ViewStyle>;
  styles: FloatingHeaderStyles & StructureControlsStyles;
  onTextChange: (text: string) => void;
  onFocus: () => void;
  onSearch: (query?: string) => void;
  onSelectSuggestion: (item: string) => void;
  onToggleAnimation: () => void;
  onSelectFormat: (format: "3d" | "2d") => void;
  onLayoutHeader?: (height: number) => void;
  onClear?: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  searchInputRef,
  searchText,
  suggestions,
  showSuggestions,
  isLoading,
  moleculeData,
  isLandscape,
  showInfo,
  isAnimated,
  structureFormat,
  containerStyle,
  styles,
  onTextChange,
  onFocus,
  onSearch,
  onSelectSuggestion,
  onToggleAnimation,
  onSelectFormat,
  onLayoutHeader,
  onClear,
}) => {
  const renderSuggestionItem = useCallback(
    ({ item }: { item: string }) => (
      <SuggestionItem item={item} onSelect={onSelectSuggestion} />
    ),
    [onSelectSuggestion],
  );

  return (
    <View
      style={[styles.floatingHeaderContainer, containerStyle]}
      pointerEvents="box-none"
    >
      <View
        style={styles.header}
        pointerEvents="box-none"
        onLayout={(e) =>
          onLayoutHeader?.(Math.round(e.nativeEvent.layout.height))
        }
      >
        <View
          style={[
            styles.headerIsland,
            isLandscape && styles.headerIslandLandscape,
          ]}
        >
          {!isLandscape && (
            <View style={styles.titleRow}>
              <TouchableOpacity
                onPress={onClear}
                disabled={!onClear}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Moluxis Home"
              >
                <Text allowFontScaling={false} style={styles.title}>
                  Moluxis
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <View
            style={[styles.searchRow, isLandscape && styles.searchRowLandscape]}
          >
            <View style={styles.inputWrapper}>
              <TextInput
                ref={searchInputRef}
                allowFontScaling={false}
                style={[
                  styles.input,
                  isLandscape && styles.inputLandscape,
                  Boolean(searchText || moleculeData) && styles.inputWithClear,
                ]}
                placeholder="Search by name or formula"
                placeholderTextColor={COLORS.textSecondary}
                value={searchText}
                onChangeText={onTextChange}
                onFocus={onFocus}
                returnKeyType="search"
                onSubmitEditing={() => onSearch()}
                keyboardAppearance="dark"
              />
              {Boolean(searchText || moleculeData) && onClear && (
                <TouchableOpacity
                  testID="clear-search-button"
                  accessibilityRole="button"
                  accessibilityLabel="Clear and back to showcase"
                  style={styles.clearButton}
                  onPress={onClear}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                isLandscape && styles.buttonLandscape,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={() => onSearch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.textPrimary} size="small" />
              ) : (
                <Ionicons name="search" size={20} color={COLORS.textPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item}
                renderItem={renderSuggestionItem}
                keyboardShouldPersistTaps="handled"
                style={{ maxHeight: 200 }}
              />
            </View>
          )}

          {/* In LANDSCAPE: compact controls row INSIDE the island */}
          {isLandscape && moleculeData && !isLoading && (
            <View style={styles.islandInlineControls}>
              <StructureControls
                moleculeData={moleculeData}
                isAnimated={isAnimated}
                structureFormat={structureFormat}
                onToggleAnimation={onToggleAnimation}
                onSelectFormat={onSelectFormat}
                styles={styles}
              />
            </View>
          )}
        </View>

        {/* In PORTRAIT: controls row BELOW the island */}
        {!isLandscape && moleculeData && !isLoading && (
          <View
            style={styles.controlsRow}
            pointerEvents={showInfo ? "none" : "auto"}
          >
            <StructureControls
              moleculeData={moleculeData}
              isAnimated={isAnimated}
              structureFormat={structureFormat}
              onToggleAnimation={onToggleAnimation}
              onSelectFormat={onSelectFormat}
              styles={styles}
            />
          </View>
        )}
      </View>
    </View>
  );
};
