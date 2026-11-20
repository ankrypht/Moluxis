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
  type ScrollViewInstance,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  FeaturedMolecule,
  FeaturedCategoryKey,
  FEATURED_CATEGORIES,
  FEATURED_MOLECULES_BY_CATEGORY,
} from "../constants/featuredMolecules";
import {
  FeaturedMoleculesCoreStyles,
  getFeaturedMoleculesCoreStyles,
} from "./FeaturedMolecules.styles";
import { useScaleMetrics } from "../utils/scaling";
import { COLORS, addOpacity } from "../constants/colors";
import { triggerSelectionHaptic } from "../utils/haptics";
import { BREAKPOINTS } from "../constants/theme";

// Module-level persistent state
let savedShowcaseScrollOffset = 0;
let savedCategoryTabsScrollOffset = 0;
let savedFeaturedCategory: FeaturedCategoryKey = "biochemicals";
const categoryListeners = new Set<(category: FeaturedCategoryKey) => void>();

export const resetShowcaseScrollOffset = () => {
  savedShowcaseScrollOffset = 0;
};

export const getSavedShowcaseScrollOffset = () => {
  return savedShowcaseScrollOffset;
};

export const setSavedShowcaseScrollOffset = (offset: number) => {
  savedShowcaseScrollOffset = Math.max(0, offset);
};

export const resetCategoryTabsScrollOffset = () => {
  savedCategoryTabsScrollOffset = 0;
};

export const getSavedCategoryTabsScrollOffset = () => {
  return savedCategoryTabsScrollOffset;
};

export const setSavedCategoryTabsScrollOffset = (offset: number) => {
  savedCategoryTabsScrollOffset = Math.max(0, offset);
};

export const resetSavedFeaturedCategory = () => {
  savedFeaturedCategory = "biochemicals";
  categoryListeners.forEach((listener) => listener("biochemicals"));
};

export const setSavedFeaturedCategory = (category: FeaturedCategoryKey) => {
  savedFeaturedCategory = category;
  categoryListeners.forEach((listener) => listener(category));
};

export const getSavedFeaturedCategory = () => {
  return savedFeaturedCategory;
};

export const subscribeCategoryChange = (
  listener: (category: FeaturedCategoryKey) => void,
) => {
  categoryListeners.add(listener);
  return () => {
    categoryListeners.delete(listener);
  };
};

export interface FeaturedMoleculesProps {
  onSelectMolecule: (query: string) => void;
  styles?: Partial<FeaturedMoleculesCoreStyles>;
  initialCategory?: FeaturedCategoryKey;
  onCategoryChange?: (category: FeaturedCategoryKey) => void;
  initialCategoryScrollOffset?: number;
  onCategoryScrollOffsetChange?: (offset: number) => void;
  isPhoneLandscape?: boolean;
}

export const FeaturedMolecules: React.FC<FeaturedMoleculesProps> = React.memo(
  ({
    onSelectMolecule,
    styles: passedStyles,
    initialCategory,
    onCategoryChange,
    initialCategoryScrollOffset: propsInitialCategoryScrollOffset,
    onCategoryScrollOffsetChange,
    isPhoneLandscape: passedIsPhoneLandscape,
  }) => {
    const metrics = useScaleMetrics();
    const isPartial = Boolean(
      passedStyles &&
      !("featuredMoleculesSection" in passedStyles && "card" in passedStyles),
    );
    const ownStyles = useMemo(
      () =>
        passedStyles && !isPartial
          ? null
          : getFeaturedMoleculesCoreStyles(metrics),
      [passedStyles, isPartial, metrics],
    );
    const styles = useMemo(
      () =>
        passedStyles
          ? ownStyles
            ? { ...ownStyles, ...passedStyles }
            : (passedStyles as FeaturedMoleculesCoreStyles)
          : ownStyles!,
      [passedStyles, ownStyles],
    );
    const { width, height, isLandscape } = metrics;
    const isPhoneLandscape =
      passedIsPhoneLandscape ?? (isLandscape && height < BREAKPOINTS.TABLET);

    const categoryTabsScrollRef = useRef<ScrollViewInstance>(null);
    const hasRestoredTabsScrollRef = useRef(false);
    const restoreTabsScrollRafRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (restoreTabsScrollRafRef.current !== null) {
          cancelAnimationFrame(restoreTabsScrollRafRef.current);
          restoreTabsScrollRafRef.current = null;
        }
      };
    }, []);

    const [selectedCategory, setSelectedCategory] =
      useState<FeaturedCategoryKey>(
        () => initialCategory ?? getSavedFeaturedCategory(),
      );

    useEffect(() => {
      if (initialCategory) {
        setSavedFeaturedCategory(initialCategory);
      }
    }, [initialCategory]);

    useEffect(() => {
      return subscribeCategoryChange(setSelectedCategory);
    }, []);

    const handleSelectCategory = useCallback(
      (category: FeaturedCategoryKey) => {
        triggerSelectionHaptic();
        setSavedFeaturedCategory(category);
        onCategoryChange?.(category);
      },
      [onCategoryChange],
    );

    const [initialCategoryScrollOffset] = useState(
      () =>
        propsInitialCategoryScrollOffset ?? getSavedCategoryTabsScrollOffset(),
    );

    const handleCategoryTabsScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = Math.max(0, event.nativeEvent.contentOffset.x);
        setSavedCategoryTabsScrollOffset(offsetX);
        onCategoryScrollOffsetChange?.(offsetX);
      },
      [onCategoryScrollOffsetChange],
    );

    const handleCategoryTabsContentSizeChange = useCallback(
      (contentWidth: number, _contentHeight: number) => {
        if (
          initialCategoryScrollOffset > 0 &&
          !hasRestoredTabsScrollRef.current &&
          contentWidth > 0
        ) {
          if (contentWidth >= initialCategoryScrollOffset) {
            hasRestoredTabsScrollRef.current = true;
          }
          if (restoreTabsScrollRafRef.current !== null) {
            cancelAnimationFrame(restoreTabsScrollRafRef.current);
          }
          restoreTabsScrollRafRef.current = requestAnimationFrame(() => {
            restoreTabsScrollRafRef.current = null;
            categoryTabsScrollRef.current?.scrollTo({
              x: initialCategoryScrollOffset,
              animated: false,
            });
          });
        }
      },
      [initialCategoryScrollOffset],
    );

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
                  size={isPhoneLandscape ? 15 : 18}
                  color={molecule.color}
                />
              </View>
              <View style={styles.spinBadge}>
                <Ionicons
                  name="cube-outline"
                  size={isPhoneLandscape ? 9 : 11}
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
                View 3D
              </Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={isPhoneLandscape ? 12 : 14}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>
        );
      },
      [styles, onSelectMolecule, isPhoneLandscape],
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
                  <Ionicons
                    name={icon}
                    size={isPhoneLandscape ? 13 : 15}
                    color={color}
                  />
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
      [isLandscape, width, isPhoneLandscape, styles, renderCard],
    );

    return (
      <View style={styles.featuredMoleculesSection}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons
              name="sparkles"
              size={isPhoneLandscape ? 11 : 13}
              color={COLORS.primary}
            />
            <Text allowFontScaling={false} style={styles.heroBadgeText}>
              Curated Showcase
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.heroTitle}>
            Featured Molecules
          </Text>
          <Text allowFontScaling={false} style={styles.heroSubtitle}>
            Tap any compound below to load and interact with its 3D structure.
          </Text>
        </View>

        {/* Category Filter Tabs (With Remembered Horizontal Scroll Position) */}
        <View style={styles.tabBarContainer}>
          <ScrollView
            ref={categoryTabsScrollRef}
            testID="category-tabs-scroll"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentOffset={
              initialCategoryScrollOffset > 0
                ? { x: initialCategoryScrollOffset, y: 0 }
                : undefined
            }
            onScroll={handleCategoryTabsScroll}
            scrollEventThrottle={64}
            onContentSizeChange={handleCategoryTabsContentSizeChange}
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
                      size={isPhoneLandscape ? 10 : 12}
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
      </View>
    );
  },
);

FeaturedMolecules.displayName = "FeaturedMolecules";
