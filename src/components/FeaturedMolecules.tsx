import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  FeaturedMolecule,
  FeaturedCategoryKey,
  FEATURED_CATEGORIES,
  FEATURED_MOLECULES_BY_CATEGORY,
} from "../constants/featuredMolecules";
import { FeaturedMoleculesStyles } from "./FeaturedMolecules.styles";
import { COLORS, addOpacity } from "../constants/colors";

import { SavedCompoundItem } from "../types";
import { ChemicalFormula } from "./ChemicalFormula";
import { triggerSelectionHaptic, triggerImpactLight } from "../utils/haptics";

let savedShowcaseScrollOffset = 0;
let savedFeaturedCategory: FeaturedCategoryKey = "biochemicals";

export const resetShowcaseScrollOffset = () => {
  savedShowcaseScrollOffset = 0;
};

export const getSavedShowcaseScrollOffset = () => {
  return savedShowcaseScrollOffset;
};

export const resetSavedFeaturedCategory = () => {
  savedFeaturedCategory = "biochemicals";
};

export const getSavedFeaturedCategory = () => {
  return savedFeaturedCategory;
};

export interface FeaturedMoleculesProps {
  onSelectMolecule: (query: string) => void;
  styles: FeaturedMoleculesStyles;
  topOffset?: number;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
  history?: SavedCompoundItem[];
  bookmarks?: SavedCompoundItem[];
  onOpenHistory?: (initialTab?: "history" | "bookmarks") => void;
  initialCategory?: FeaturedCategoryKey;
  onCategoryChange?: (category: FeaturedCategoryKey) => void;
}

export const FeaturedMolecules: React.FC<FeaturedMoleculesProps> = React.memo(
  ({
    onSelectMolecule,
    styles,
    topOffset,
    initialScrollOffset: propsInitialScrollOffset,
    onScrollOffsetChange,
    history,
    bookmarks,
    onOpenHistory,
    initialCategory,
    onCategoryChange,
  }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const scrollViewRef = useRef<ScrollView>(null);
    const hasRestoredScrollRef = useRef(false);

    const [selectedCategory, setSelectedCategory] =
      useState<FeaturedCategoryKey>(
        () => initialCategory ?? savedFeaturedCategory,
      );

    const handleSelectCategory = useCallback(
      (category: FeaturedCategoryKey) => {
        triggerSelectionHaptic();
        savedFeaturedCategory = category;
        setSelectedCategory(category);
        onCategoryChange?.(category);
      },
      [onCategoryChange],
    );

    const [initialScrollOffset] = useState(
      () => propsInitialScrollOffset ?? savedShowcaseScrollOffset,
    );

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
        savedShowcaseScrollOffset = offsetY;
        onScrollOffsetChange?.(offsetY);
      },
      [onScrollOffsetChange],
    );

    const handleContentSizeChange = useCallback(
      (_contentWidth: number, contentHeight: number) => {
        if (
          initialScrollOffset > 0 &&
          !hasRestoredScrollRef.current &&
          contentHeight > 0
        ) {
          hasRestoredScrollRef.current = true;
          requestAnimationFrame(() => {
            scrollViewRef.current?.scrollTo({
              y: initialScrollOffset,
              animated: false,
            });
          });
        }
      },
      [initialScrollOffset],
    );

    const recentItems = useMemo(() => {
      const itemMap = new Map<string, SavedCompoundItem>();

      for (const item of history || []) {
        if (!item?.name) continue;
        const lower = item.name.trim().toLowerCase();
        if (
          !itemMap.has(lower) ||
          (item.timestamp &&
            item.timestamp > (itemMap.get(lower)?.timestamp || 0))
        ) {
          itemMap.set(lower, item);
        }
      }

      for (const item of bookmarks || []) {
        if (!item?.name) continue;
        const lower = item.name.trim().toLowerCase();
        if (
          !itemMap.has(lower) ||
          (item.timestamp &&
            item.timestamp > (itemMap.get(lower)?.timestamp || 0))
        ) {
          itemMap.set(lower, item);
        }
      }

      return Array.from(itemMap.values())
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 8);
    }, [history, bookmarks]);

    const bookmarkNamesSet = useMemo(() => {
      const set = new Set<string>();
      for (const item of bookmarks || []) {
        if (item?.name) set.add(item.name.trim().toLowerCase());
      }
      return set;
    }, [bookmarks]);

    const activeCategory = useMemo(
      () =>
        FEATURED_CATEGORIES.find((c) => c.key === selectedCategory) ||
        FEATURED_CATEGORIES[0],
      [selectedCategory],
    );

    const renderCard = useCallback(
      (molecule: FeaturedMolecule) => {
        return (
          <TouchableOpacity
            key={molecule.id}
            testID={`featured-chip-${molecule.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Explore ${molecule.name} in 3D`}
            activeOpacity={0.7}
            style={[
              styles.card,
              { borderColor: addOpacity(molecule.color, 0.35) },
            ]}
            onPress={() => {
              triggerSelectionHaptic();
              onSelectMolecule(molecule.query);
            }}
          >
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.moleculeIconContainer,
                  { backgroundColor: molecule.accentBg },
                ]}
              >
                <Ionicons
                  name={molecule.iconName}
                  size={18}
                  color={molecule.color}
                />
              </View>
              <View style={styles.spinBadge}>
                <Ionicons
                  name="cube-outline"
                  size={11}
                  color={COLORS.primary}
                />
                <Text allowFontScaling={false} style={styles.spinBadgeText}>
                  3D
                </Text>
              </View>
            </View>

            <View>
              <Text
                allowFontScaling={false}
                style={styles.cardName}
                numberOfLines={1}
              >
                {molecule.name}
              </Text>
              <Text
                allowFontScaling={false}
                style={styles.cardFormula}
                numberOfLines={1}
              >
                {molecule.formattedFormula}
              </Text>
              <Text
                allowFontScaling={false}
                style={styles.cardTag}
                numberOfLines={1}
              >
                {molecule.tag}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <Text allowFontScaling={false} style={styles.cardFooterAction}>
                Spin 3D
              </Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={14}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>
        );
      },
      [styles, onSelectMolecule],
    );

    const renderCategorySection = useCallback(
      (
        title: string,
        icon: keyof typeof Ionicons.glyphMap,
        color: string,
        items: FeaturedMolecule[],
      ) => {
        const chunkSize = isLandscape || width >= 600 ? 4 : 2;
        const rows: FeaturedMolecule[][] = [];
        for (let i = 0; i < items.length; i += chunkSize) {
          rows.push(items.slice(i, i + chunkSize));
        }

        return (
          <View key={title} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={styles.categoryHeaderLeft}>
                <View
                  style={[
                    styles.categoryIconBadge,
                    { backgroundColor: addOpacity(color, 0.15) },
                  ]}
                >
                  <Ionicons name={icon} size={15} color={color} />
                </View>
                <Text allowFontScaling={false} style={styles.categoryTitle}>
                  {title}
                </Text>
              </View>
              <Text allowFontScaling={false} style={styles.categoryCount}>
                {items.length} items
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {rows.map((rowItems, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {rowItems.map((item) => renderCard(item))}
                </View>
              ))}
            </View>
          </View>
        );
      },
      [isLandscape, width, styles, renderCard],
    );

    return (
      <View style={styles.featuredContainer}>
        <ScrollView
          ref={scrollViewRef}
          testID="featured-molecules-scroll"
          showsVerticalScrollIndicator={false}
          contentOffset={
            initialScrollOffset > 0
              ? { x: 0, y: initialScrollOffset }
              : undefined
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={[
            styles.featuredScrollContent,
            topOffset ? { paddingTop: topOffset + 14 } : null,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Jump Back In (Recent Searches & Favorites) */}
          {recentItems.length > 0 && (
            <View style={styles.jumpBackSection}>
              <View style={styles.jumpBackHeader}>
                <View style={styles.jumpBackHeaderLeft}>
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                  <Text allowFontScaling={false} style={styles.jumpBackTitle}>
                    Jump Back In
                  </Text>
                </View>
                {onOpenHistory && (
                  <TouchableOpacity
                    testID="jump-back-view-all"
                    accessibilityRole="button"
                    accessibilityLabel="View full history and bookmarks"
                    style={styles.jumpBackViewAllBtn}
                    onPress={() => {
                      triggerImpactLight();
                      onOpenHistory();
                    }}
                  >
                    <Text
                      allowFontScaling={false}
                      style={styles.jumpBackViewAllText}
                    >
                      View All
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color={COLORS.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.jumpBackChipsScroll}
                keyboardShouldPersistTaps="handled"
              >
                {recentItems.map((item) => {
                  const isFav = bookmarkNamesSet.has(
                    item.name.trim().toLowerCase(),
                  );
                  return (
                    <TouchableOpacity
                      key={item.name}
                      testID={`recent-chip-${item.name.toLowerCase()}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Revisit ${item.name}`}
                      style={styles.jumpBackChip}
                      onPress={() => {
                        triggerSelectionHaptic();
                        onSelectMolecule(item.name);
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.jumpBackChipIcon,
                          isFav && styles.jumpBackChipIconFav,
                        ]}
                      >
                        <Ionicons
                          name={isFav ? "bookmark" : "time-outline"}
                          size={14}
                          color={isFav ? COLORS.warning : COLORS.primary}
                        />
                      </View>
                      <View>
                        <Text
                          allowFontScaling={false}
                          style={styles.jumpBackChipName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        {item.formula ? (
                          <ChemicalFormula
                            formula={item.formula}
                            style={styles.jumpBackChipFormula}
                          />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={13} color={COLORS.primary} />
              <Text allowFontScaling={false} style={styles.heroBadgeText}>
                Curated Showcase
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.heroTitle}>
              Featured Molecules
            </Text>
            <Text allowFontScaling={false} style={styles.heroSubtitle}>
              Tap any compound below to load and interact with its 3D spinning
              structure.
            </Text>
          </View>

          {/* Category Filter Tabs */}
          <View style={styles.tabBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBarScroll}
              keyboardShouldPersistTaps="handled"
            >
              {FEATURED_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category.key;
                return (
                  <TouchableOpacity
                    key={category.key}
                    testID={`category-tab-${category.key}`}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`${category.title} category`}
                    activeOpacity={0.75}
                    style={[
                      styles.categoryTab,
                      isActive && [
                        styles.categoryTabActive,
                        {
                          backgroundColor: addOpacity(category.color, 0.16),
                          borderColor: addOpacity(category.color, 0.55),
                        },
                      ],
                    ]}
                    onPress={() => handleSelectCategory(category.key)}
                  >
                    <View
                      style={[
                        styles.categoryTabIconBadge,
                        {
                          backgroundColor: isActive
                            ? addOpacity(category.color, 0.25)
                            : addOpacity(COLORS.surfaceElevated, 0.9),
                        },
                      ]}
                    >
                      <Ionicons
                        name={category.icon}
                        size={12}
                        color={isActive ? category.color : COLORS.textMuted}
                      />
                    </View>
                    <Text
                      allowFontScaling={false}
                      style={[
                        styles.categoryTabText,
                        isActive && styles.categoryTabTextActive,
                      ]}
                    >
                      {category.title}
                    </Text>
                    <View
                      style={[
                        styles.categoryTabCountBadge,
                        isActive && {
                          backgroundColor: addOpacity(category.color, 0.22),
                        },
                      ]}
                    >
                      <Text
                        allowFontScaling={false}
                        style={[
                          styles.categoryTabCountText,
                          isActive && { color: category.color },
                        ]}
                      >
                        {FEATURED_MOLECULES_BY_CATEGORY[category.key]?.length ||
                          4}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Active Category Molecules */}
          {renderCategorySection(
            activeCategory.title,
            activeCategory.icon,
            activeCategory.color,
            FEATURED_MOLECULES_BY_CATEGORY[activeCategory.key] || [],
          )}
        </ScrollView>
      </View>
    );
  },
);

FeaturedMolecules.displayName = "FeaturedMolecules";
