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
import {
  APP_AUTHOR,
  GITHUB_REPO_URL,
  getAppVersion,
  openExternalUrl,
} from "../constants/distributions";

import { SavedCompoundItem } from "../types";
import { ChemicalFormula } from "./ChemicalFormula";
import { triggerSelectionHaptic, triggerImpactLight } from "../utils/haptics";
import { normalizeCompoundName } from "../utils/compound";

let savedShowcaseScrollOffset = 0;
let savedFeaturedCategory: FeaturedCategoryKey = "biochemicals";
const categoryListeners = new Set<(category: FeaturedCategoryKey) => void>();

export const resetShowcaseScrollOffset = () => {
  savedShowcaseScrollOffset = 0;
};

export const getSavedShowcaseScrollOffset = () => {
  return savedShowcaseScrollOffset;
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

export interface FeaturedMoleculesProps {
  onSelectMolecule: (query: string) => void;
  styles: FeaturedMoleculesStyles;
  topOffset?: number;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
  history?: SavedCompoundItem[];
  bookmarks?: SavedCompoundItem[];
  onOpenHistory?: (initialTab?: "history" | "bookmarks") => void;
  onOpenAbout?: () => void;
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
    onOpenAbout,
    initialCategory,
    onCategoryChange,
  }) => {
    const appVersion = getAppVersion();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    const isPhoneLandscape = isLandscape && height < 600;
    const scrollViewRef = useRef<ScrollViewInstance>(null);
    const hasRestoredScrollRef = useRef(false);
    const restoreScrollRafRef = useRef<number | null>(null);

    useEffect(() => {
      return () => {
        if (restoreScrollRafRef.current !== null) {
          cancelAnimationFrame(restoreScrollRafRef.current);
          restoreScrollRafRef.current = null;
        }
      };
    }, []);

    const [selectedCategory, setSelectedCategory] =
      useState<FeaturedCategoryKey>(
        () => initialCategory ?? savedFeaturedCategory,
      );

    useEffect(() => {
      categoryListeners.add(setSelectedCategory);
      return () => {
        categoryListeners.delete(setSelectedCategory);
      };
    }, []);

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
          restoreScrollRafRef.current = requestAnimationFrame(() => {
            restoreScrollRafRef.current = null;
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
        const lower = normalizeCompoundName(item.name);
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
        const lower = normalizeCompoundName(item.name);
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
        const norm = normalizeCompoundName(item?.name);
        if (norm) set.add(norm);
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
          scrollEventThrottle={64}
          onContentSizeChange={handleContentSizeChange}
          contentContainerStyle={[
            styles.featuredScrollContent,
            topOffset ? { paddingTop: topOffset } : null,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Compact Creator & Open Source Banner (immediately visible above the fold) */}
          <View
            style={styles.showcaseAboutBanner}
            testID="showcase-about-banner"
          >
            <View style={styles.showcaseAboutInfoCol}>
              <View style={styles.showcaseAboutCreditRow}>
                <Text
                  allowFontScaling={false}
                  style={styles.showcaseAboutCreditText}
                  numberOfLines={1}
                >
                  Made by{" "}
                  <Text style={styles.showcaseAboutAuthorName}>
                    {APP_AUTHOR}
                  </Text>
                </Text>
                <Text
                  allowFontScaling={false}
                  style={styles.showcaseAboutVersionText}
                >
                  v{appVersion}
                </Text>
              </View>

              <TouchableOpacity
                testID="showcase-github-button"
                accessibilityRole="button"
                accessibilityLabel="Open source on GitHub"
                style={styles.showcaseGithubLink}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 8, left: 4, right: 8 }}
                onPress={() => {
                  triggerSelectionHaptic();
                  openExternalUrl(GITHUB_REPO_URL).catch(() => {});
                }}
              >
                <Ionicons
                  name="logo-github"
                  size={isPhoneLandscape ? 11 : 12}
                  color={COLORS.textSecondary}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.showcaseGithubLinkText}
                >
                  Open source on GitHub
                </Text>
                <Ionicons
                  name="open-outline"
                  size={isPhoneLandscape ? 9 : 10}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {onOpenAbout && (
              <TouchableOpacity
                testID="showcase-about-button"
                accessibilityRole="button"
                accessibilityLabel="About Moluxis"
                style={styles.showcaseAboutPill}
                activeOpacity={0.75}
                onPress={() => {
                  triggerImpactLight();
                  onOpenAbout();
                }}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={isPhoneLandscape ? 13 : 15}
                  color={COLORS.primary}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.showcaseAboutPillText}
                >
                  About
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={isPhoneLandscape ? 10 : 12}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Jump Back In (Recent Searches & Favorites) */}
          {recentItems.length > 0 && (
            <View style={styles.jumpBackSection}>
              <View style={styles.jumpBackHeader}>
                <View style={styles.jumpBackHeaderLeft}>
                  <Ionicons
                    name="time-outline"
                    size={isPhoneLandscape ? 14 : 17}
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
                      size={isPhoneLandscape ? 10 : 12}
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
                          size={isPhoneLandscape ? 12 : 14}
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
        </ScrollView>
      </View>
    );
  },
);

FeaturedMolecules.displayName = "FeaturedMolecules";
