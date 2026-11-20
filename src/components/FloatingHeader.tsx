import React, { useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  type TextInputInstance,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleProp,
  ViewStyle,
  useWindowDimensions,
  BackHandler,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { MoleculeInfo } from "../types";
import { COLORS } from "../constants/colors";
import { SuggestionItem } from "./SuggestionItem";
import { StructureControls } from "./StructureControls";
import {
  FloatingHeaderStyles,
  getFloatingHeaderStyles,
} from "./FloatingHeader.styles";
import { StructureControlsStyles } from "./StructureControls.styles";
import { triggerImpactLight, triggerSelectionHaptic } from "../utils/haptics";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { useScaleMetrics } from "../utils/scaling";

export interface FloatingHeaderProps {
  searchInputRef?: React.RefObject<TextInputInstance | null>;
  searchText?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
  isLoading: boolean;
  moleculeData: MoleculeInfo | null;
  isLandscape: boolean;
  showInfo: boolean;
  isAnimated: boolean;
  structureFormat: "3d" | "2d";
  containerStyle?: StyleProp<ViewStyle>;
  styles?: FloatingHeaderStyles & Partial<StructureControlsStyles>;
  onTextChange?: (text: string) => void;
  onFocus?: () => void;
  onSearch: (query?: string) => void;
  onSelectSuggestion?: (item: string) => void;
  onToggleAnimation: () => void;
  onSelectFormat: (format: "3d" | "2d") => void;
  onLayoutHeader?: (height: number) => void;
  onClear?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onOpenHistory?: () => void;
  onOpenShare?: () => void;
  onOpenDevTools?: () => void;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = React.memo(
  (props) => {
    const {
      searchInputRef,
      isLoading,
      moleculeData,
      isLandscape,
      showInfo,
      isAnimated,
      structureFormat,
      containerStyle,
      styles: passedStyles,
      onSearch,
      onSelectSuggestion,
      onToggleAnimation,
      onSelectFormat,
      onLayoutHeader,
      onClear,
      isBookmarked,
      onToggleBookmark,
      onOpenHistory,
      onOpenShare,
      onOpenDevTools,
    } = props;

    const localInputRef = useRef<TextInputInstance>(null);
    const inputRef = searchInputRef || localInputRef;

    const metrics = useScaleMetrics();
    const ownStyles = useMemo(
      () => getFloatingHeaderStyles(metrics),
      [metrics],
    );
    const styles = passedStyles ?? ownStyles;

    const autocomplete = useAutocomplete();
    const isControlled = props.searchText !== undefined;
    const searchText = isControlled
      ? props.searchText!
      : autocomplete.searchText;
    const suggestions =
      props.suggestions !== undefined
        ? props.suggestions
        : autocomplete.suggestions;
    const showSuggestions =
      props.showSuggestions !== undefined
        ? props.showSuggestions
        : autocomplete.showSuggestions;
    const onTextChange = props.onTextChange || autocomplete.handleTextChange;
    const onFocus =
      props.onFocus || (() => autocomplete.setShowSuggestions(true));

    const lastMoleculeKeyRef = useRef<string | null>(null);
    const currentKey = moleculeData?.cid || moleculeData?.name || null;

    useEffect(() => {
      if (isControlled) return;
      if (currentKey !== lastMoleculeKeyRef.current) {
        lastMoleculeKeyRef.current = currentKey;
        autocomplete.setSearchText(moleculeData?.name || "");
        autocomplete.clearSuggestions();
      }
    }, [currentKey, moleculeData?.name, isControlled, autocomplete]);

    const isSuggestionsDropdownVisible =
      showSuggestions && suggestions.length > 0;

    useEffect(() => {
      if (!isSuggestionsDropdownVisible) return;
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (!isControlled) {
            autocomplete.clearSuggestions();
          }
          return true;
        },
      );
      return () => backHandler.remove();
    }, [isSuggestionsDropdownVisible, isControlled, autocomplete]);

    const handleSelectSuggestion = useCallback(
      (item: string) => {
        inputRef.current?.blur();
        Keyboard.dismiss();
        if (!isControlled) {
          autocomplete.setSearchText(item);
          autocomplete.clearSuggestions();
        }
        if (onSelectSuggestion) {
          onSelectSuggestion(item);
        } else {
          onSearch(item);
        }
      },
      [inputRef, isControlled, autocomplete, onSelectSuggestion, onSearch],
    );

    const handleSubmitSearch = useCallback(() => {
      inputRef.current?.blur();
      Keyboard.dismiss();
      if (!isControlled) {
        autocomplete.clearSuggestions();
      }
      onSearch(searchText.trim() || undefined);
    }, [inputRef, isControlled, autocomplete, onSearch, searchText]);

    const handleClear = useCallback(() => {
      if (!isControlled) {
        autocomplete.setSearchText("");
        autocomplete.clearSuggestions();
      }
      onClear?.();
    }, [isControlled, autocomplete, onClear]);

    const renderSuggestionItem = useCallback(
      ({ item }: { item: string }) => (
        <SuggestionItem item={item} onSelect={handleSelectSuggestion} />
      ),
      [handleSelectSuggestion],
    );

    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;

    const actionIconSize = isLandscape && !isTablet ? 18 : 20;
    const actionButtonStyle = isLandscape
      ? [styles.headerIconButton, styles.headerIconButtonLandscape]
      : styles.headerIconButton;

    const renderActionButtons = () => (
      <>
        {moleculeData && onToggleBookmark && (
          <TouchableOpacity
            testID="header-bookmark-button"
            accessibilityRole="button"
            accessibilityLabel={
              isBookmarked
                ? `Remove ${moleculeData.name} from bookmarks`
                : `Bookmark ${moleculeData.name}`
            }
            style={[
              actionButtonStyle,
              isBookmarked && styles.headerIconButtonActive,
            ]}
            onPress={() => {
              triggerImpactLight();
              onToggleBookmark();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={actionIconSize}
              color={isBookmarked ? COLORS.warning : COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

        {moleculeData && onOpenShare && (
          <TouchableOpacity
            testID={
              isLandscape
                ? "header-share-button-landscape"
                : "header-share-button"
            }
            accessibilityRole="button"
            accessibilityLabel={`Share ${moleculeData.name}`}
            style={actionButtonStyle}
            onPress={() => {
              triggerImpactLight();
              onOpenShare();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="share-social-outline"
              size={actionIconSize}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

        {onOpenHistory && (
          <TouchableOpacity
            testID="header-history-button"
            accessibilityRole="button"
            accessibilityLabel="Open search history and bookmarks"
            style={actionButtonStyle}
            onPress={() => {
              triggerImpactLight();
              onOpenHistory();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="time-outline"
              size={actionIconSize}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </>
    );

    return (
      <View
        style={[styles.floatingHeaderContainer, containerStyle]}
        pointerEvents="box-none"
      >
        <View style={styles.header} pointerEvents="box-none">
          <View
            pointerEvents="box-none"
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              onLayoutHeader?.(Math.round(y + height));
            }}
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
                    testID="header-moluxis-home-button"
                    onPress={() => {
                      triggerImpactLight();
                      handleClear();
                    }}
                    onLongPress={
                      onOpenDevTools
                        ? () => {
                            triggerImpactLight();
                            onOpenDevTools();
                          }
                        : undefined
                    }
                    delayLongPress={800}
                    disabled={!onClear && !onOpenDevTools}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Moluxis Home"
                  >
                    <Text allowFontScaling={false} style={styles.title}>
                      Moluxis
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.headerTopActions}>
                    {renderActionButtons()}
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.searchRow,
                  isLandscape && styles.searchRowLandscape,
                ]}
              >
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={inputRef}
                    allowFontScaling={false}
                    style={[
                      styles.input,
                      isLandscape && styles.inputLandscape,
                      Boolean(searchText || moleculeData) &&
                        styles.inputWithClear,
                    ]}
                    placeholder="Search by name or formula"
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchText}
                    onChangeText={onTextChange}
                    onFocus={onFocus}
                    returnKeyType="search"
                    onSubmitEditing={() => {
                      triggerSelectionHaptic();
                      handleSubmitSearch();
                    }}
                    keyboardAppearance="dark"
                  />
                  {Boolean(searchText || moleculeData) && onClear && (
                    <TouchableOpacity
                      testID="clear-search-button"
                      accessibilityRole="button"
                      accessibilityLabel="Clear and back to showcase"
                      style={styles.clearButton}
                      onPress={() => {
                        triggerImpactLight();
                        handleClear();
                      }}
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
                  onPress={() => {
                    triggerSelectionHaptic();
                    handleSubmitSearch();
                  }}
                  onLongPress={
                    isLandscape && onOpenDevTools
                      ? () => {
                          triggerImpactLight();
                          onOpenDevTools();
                        }
                      : undefined
                  }
                  delayLongPress={1000}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      color={COLORS.textPrimary}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name="search"
                      size={20}
                      color={COLORS.textPrimary}
                    />
                  )}
                </TouchableOpacity>

                {isLandscape && renderActionButtons()}
              </View>
            </View>

            {/* In PORTRAIT: controls row BELOW the island */}
            {!isLandscape &&
              moleculeData &&
              !isLoading &&
              !isSuggestionsDropdownVisible && (
                <View
                  testID="floating-header-controls-row"
                  style={styles.controlsRow}
                  pointerEvents={showInfo ? "none" : "auto"}
                >
                  <StructureControls
                    moleculeData={moleculeData}
                    isAnimated={isAnimated}
                    structureFormat={structureFormat}
                    onToggleAnimation={onToggleAnimation}
                    onSelectFormat={onSelectFormat}
                    styles={
                      passedStyles && "toggleContainer" in passedStyles
                        ? (passedStyles as any)
                        : undefined
                    }
                  />
                </View>
              )}
          </View>

          {/* Autocomplete Dropdown */}
          {isSuggestionsDropdownVisible && (
            <View
              style={[
                styles.suggestionsContainer,
                isLandscape && styles.suggestionsContainerLandscape,
              ]}
            >
              <FlatList
                data={suggestions}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={renderSuggestionItem}
                keyboardShouldPersistTaps="handled"
                style={styles.suggestionsList}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
);

FloatingHeader.displayName = "FloatingHeader";
