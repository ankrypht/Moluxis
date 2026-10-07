import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  FEATURED_MOLECULES,
} from "../constants/featuredMolecules";
import { FeaturedMoleculesStyles } from "./FeaturedMolecules.styles";
import { COLORS, addOpacity } from "../constants/colors";

import { SavedCompoundItem } from "../types";
import { ChemicalFormula } from "./ChemicalFormula";

let savedShowcaseScrollOffset = 0;

export const resetShowcaseScrollOffset = () => {
  savedShowcaseScrollOffset = 0;
};

export const getSavedShowcaseScrollOffset = () => {
  return savedShowcaseScrollOffset;
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
  }) => {
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const scrollViewRef = useRef<ScrollView>(null);
    const hasRestoredScrollRef = useRef(false);

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

    useEffect(() => {
      if (initialScrollOffset > 0 && !hasRestoredScrollRef.current) {
        const timer = setTimeout(() => {
          if (!hasRestoredScrollRef.current) {
            hasRestoredScrollRef.current = true;
            scrollViewRef.current?.scrollTo({
              y: initialScrollOffset,
              animated: false,
            });
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [initialScrollOffset]);
    const groupedMolecules = useMemo(() => {
      const groups: Record<FeaturedCategoryKey, FeaturedMolecule[]> = {
        biochemicals: [],
        medicinal: [],
        crystals: [],
      };
      for (const item of FEATURED_MOLECULES) {
        if (groups[item.category]) {
          groups[item.category].push(item);
        }
      }
      return groups;
    }, []);

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
            onPress={() => onSelectMolecule(molecule.query)}
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
                    onPress={() => onOpenHistory()}
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
                  const isFav = bookmarks?.some(
                    (b) => b.name.toLowerCase() === item.name.toLowerCase(),
                  );
                  return (
                    <TouchableOpacity
                      key={item.name}
                      testID={`recent-chip-${item.name.toLowerCase()}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Revisit ${item.name}`}
                      style={styles.jumpBackChip}
                      onPress={() => onSelectMolecule(item.name)}
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

          {/* Curated Categories */}
          {FEATURED_CATEGORIES.map((category) =>
            renderCategorySection(
              category.title,
              category.icon,
              category.color,
              groupedMolecules[category.key],
            ),
          )}
        </ScrollView>
      </View>
    );
  },
);

FeaturedMolecules.displayName = "FeaturedMolecules";
