import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  useAnimatedValue,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "./CustomAlert";
import { SavedCompoundItem } from "../types";
import { COLORS } from "../constants/colors";
import { HistoryBookmarksModalStyles } from "./HistoryBookmarksModal.styles";
import { ChemicalFormula } from "./ChemicalFormula";
import { formatRelativeTime } from "../utils/formatTime";
import {
  triggerSelectionHaptic,
  triggerImpactLight,
  triggerWarningHaptic,
} from "../utils/haptics";

export interface HistoryBookmarksModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCompound: (name: string) => void;
  history: SavedCompoundItem[];
  bookmarks: SavedCompoundItem[];
  onToggleBookmark: (item: SavedCompoundItem) => void;
  onRemoveHistoryItem: (name: string) => void;
  onRemoveBookmarkItem: (name: string) => void;
  onClearHistory: () => void;
  onClearBookmarks: () => void;
  isBookmarked: (name?: string | null) => boolean;
  initialTab?: "history" | "bookmarks";
  styles: HistoryBookmarksModalStyles;
  isLandscape?: boolean;
  height?: number;
}

export const HistoryBookmarksModal: React.FC<HistoryBookmarksModalProps> =
  React.memo(
    ({
      visible,
      onClose,
      onSelectCompound,
      history,
      bookmarks,
      onToggleBookmark,
      onRemoveHistoryItem,
      onRemoveBookmarkItem,
      onClearHistory,
      onClearBookmarks,
      isBookmarked,
      initialTab = "history",
      styles,
      isLandscape = false,
      height = 700,
    }) => {
      const [userSelectedTab, setUserSelectedTab] = useState<
        "history" | "bookmarks" | null
      >(null);
      const [prevVisible, setPrevVisible] = useState(visible);

      if (visible !== prevVisible) {
        setPrevVisible(visible);
        if (visible) {
          setUserSelectedTab(null);
        }
      }

      const activeTab = userSelectedTab ?? initialTab;
      const setActiveTab = setUserSelectedTab;

      const { width: windowWidth } = useWindowDimensions();
      const sheetHeight = isLandscape ? height : Math.round(height * 0.75);
      const slideDistance = isLandscape ? windowWidth : sheetHeight;
      const slideAnim = useAnimatedValue(slideDistance);
      const fadeAnim = useAnimatedValue(0);

      useEffect(() => {
        if (visible) {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: true,
              friction: 9,
              tension: 65,
              overshootClamping: true,
            }),
          ]).start();
        }
      }, [visible, slideAnim, fadeAnim]);

      const activeItems = useMemo(
        () => (activeTab === "history" ? history : bookmarks),
        [activeTab, history, bookmarks],
      );

      const handlePromptClear = useCallback(() => {
        const isHist = activeTab === "history";
        const title = isHist ? "Clear Search History?" : "Clear All Bookmarks?";
        const message = isHist
          ? "This will remove all recently inspected compounds from your history."
          : "This will remove all saved bookmarks.";

        Alert.alert(title, message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear All",
            style: "destructive",
            onPress: () => {
              if (isHist) {
                onClearHistory();
              } else {
                onClearBookmarks();
              }
            },
          },
        ]);
      }, [activeTab, onClearHistory, onClearBookmarks]);

      const handleSelectItem = useCallback(
        (name: string) => {
          triggerSelectionHaptic();
          onSelectCompound(name);
          onClose();
        },
        [onSelectCompound, onClose],
      );

      const renderItem = useCallback(
        ({ item }: { item: SavedCompoundItem }) => {
          const bookmarked = isBookmarked(item.name);
          const isHistoryTab = activeTab === "history";

          return (
            <View style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemLeftSection}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Revisit ${item.name}`}
                onPress={() => handleSelectItem(item.name)}
              >
                <View
                  style={[
                    styles.iconBadge,
                    !isHistoryTab && styles.iconBadgeFavorite,
                  ]}
                >
                  <Ionicons
                    name={isHistoryTab ? "time-outline" : "bookmark"}
                    size={20}
                    color={isHistoryTab ? COLORS.primary : COLORS.warning}
                  />
                </View>

                <View style={styles.itemDetails}>
                  <Text
                    allowFontScaling={false}
                    style={styles.itemName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.itemMetaRow}>
                    {item.formula ? (
                      <ChemicalFormula
                        formula={item.formula}
                        style={styles.itemFormulaText}
                      />
                    ) : null}
                    {item.timestamp ? (
                      <Text
                        allowFontScaling={false}
                        style={styles.itemTimeText}
                      >
                        • {formatRelativeTime(item.timestamp)}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.itemRightSection}>
                <TouchableOpacity
                  testID={`bookmark-toggle-${item.name.toLowerCase()}`}
                  accessibilityRole="button"
                  accessibilityLabel={
                    bookmarked
                      ? `Remove ${item.name} from bookmarks`
                      : `Bookmark ${item.name}`
                  }
                  style={styles.actionIconButton}
                  onPress={() => {
                    triggerImpactLight();
                    onToggleBookmark(item);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={bookmarked ? COLORS.warning : COLORS.textSecondary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  testID={`remove-item-${item.name.toLowerCase()}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${item.name} from list`}
                  style={styles.actionIconButton}
                  onPress={() => {
                    triggerImpactLight();
                    if (isHistoryTab) {
                      onRemoveHistoryItem(item.name);
                    } else {
                      onRemoveBookmarkItem(item.name);
                    }
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        },
        [
          activeTab,
          isBookmarked,
          onToggleBookmark,
          onRemoveHistoryItem,
          onRemoveBookmarkItem,
          handleSelectItem,
          styles,
        ],
      );

      const renderEmptyState = useCallback(() => {
        const isHist = activeTab === "history";
        return (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconBadge}>
              <Ionicons
                name={isHist ? "time-outline" : "bookmark-outline"}
                size={32}
                color={isHist ? COLORS.primary : COLORS.warning}
              />
            </View>
            <Text allowFontScaling={false} style={styles.emptyStateTitle}>
              {isHist ? "No Recent Searches" : "No Saved Bookmarks"}
            </Text>
            <Text allowFontScaling={false} style={styles.emptyStateMessage}>
              {isHist
                ? "Compounds you inspect or search will appear here so you can revisit them with one tap."
                : "Tap the bookmark icon when viewing any molecule to save it here for instant one-tap access."}
            </Text>
          </View>
        );
      }, [activeTab, styles]);

      if (!visible) return null;

      return (
        <Animated.View
          style={[styles.backdrop, { opacity: fadeAnim }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable style={{ flex: 1 }} onPress={onClose} />

          <Animated.View
            style={[
              styles.modalContainer,
              isLandscape && styles.modalContainerLandscape,
              {
                height: sheetHeight,
                transform: isLandscape
                  ? [{ translateX: slideAnim }]
                  : [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header with Title, Actions, and Segmented Control */}
            <View style={styles.modalHeader}>
              {/* Top Row: Title & Action Buttons */}
              <View style={styles.modalTopBar}>
                <Text
                  allowFontScaling={false}
                  style={styles.modalTitle}
                  numberOfLines={1}
                >
                  {activeTab === "history"
                    ? "Recent History"
                    : "Saved Bookmarks"}
                </Text>

                {/* Right Action Icons: Clear and Close */}
                <View style={styles.headerRightActions}>
                  {activeItems.length > 0 && (
                    <TouchableOpacity
                      testID="clear-history-bookmarks-button"
                      accessibilityRole="button"
                      accessibilityLabel={
                        activeTab === "history"
                          ? "Clear all history"
                          : "Clear all bookmarks"
                      }
                      style={styles.modalClearButton}
                      onPress={() => {
                        triggerWarningHaptic();
                        handlePromptClear();
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={13}
                        color={COLORS.danger}
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.modalClearButtonText}
                      >
                        Clear
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    testID="close-history-modal"
                    accessibilityRole="button"
                    accessibilityLabel="Close history and bookmarks"
                    style={styles.closeButton}
                    onPress={() => {
                      triggerImpactLight();
                      onClose();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={COLORS.textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quick History / Bookmarks Segment Toggle (Full Width) */}
              <View
                style={styles.toggleSegmentContainer}
                accessibilityRole="tablist"
              >
                <TouchableOpacity
                  testID="tab-toggle-history"
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "history" }}
                  accessibilityLabel={`Recent History (${history.length})`}
                  style={[
                    styles.toggleSegmentButton,
                    activeTab === "history" && styles.toggleSegmentButtonActive,
                  ]}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setActiveTab("history");
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={
                      activeTab === "history"
                        ? COLORS.textOnPrimary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.toggleSegmentText,
                      activeTab === "history" && styles.toggleSegmentTextActive,
                    ]}
                  >
                    History
                  </Text>
                  {history.length > 0 && (
                    <View
                      style={[
                        styles.badgeCount,
                        activeTab === "history" && styles.badgeCountActive,
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.badgeCountText}
                      >
                        {history.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  testID="tab-toggle-bookmarks"
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === "bookmarks" }}
                  accessibilityLabel={`Bookmarks (${bookmarks.length})`}
                  style={[
                    styles.toggleSegmentButton,
                    activeTab === "bookmarks" &&
                      styles.toggleSegmentButtonActive,
                  ]}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setActiveTab("bookmarks");
                  }}
                >
                  <Ionicons
                    name="bookmark"
                    size={14}
                    color={
                      activeTab === "bookmarks"
                        ? COLORS.textOnPrimary
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.toggleSegmentText,
                      activeTab === "bookmarks" &&
                        styles.toggleSegmentTextActive,
                    ]}
                  >
                    Bookmarks
                  </Text>
                  {bookmarks.length > 0 && (
                    <View
                      style={[
                        styles.badgeCount,
                        activeTab === "bookmarks" && styles.badgeCountActive,
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        style={styles.badgeCountText}
                      >
                        {bookmarks.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* List of Compounds */}
            <FlatList
              data={activeItems}
              keyExtractor={(item, index) =>
                `${activeTab}-${item.name.trim().toLowerCase()}-${index}`
              }
              renderItem={renderItem}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </Animated.View>
        </Animated.View>
      );
    },
  );

HistoryBookmarksModal.displayName = "HistoryBookmarksModal";
