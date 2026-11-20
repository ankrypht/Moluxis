import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  ScrollView,
  type ScrollViewInstance,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useScaleMetrics } from "../utils/scaling";
import { BREAKPOINTS } from "../constants/theme";
import { SavedCompoundItem } from "../types";
import { normalizeCompoundName } from "../utils/compound";
import { FeaturedCategoryKey } from "../constants/featuredMolecules";
import { getHomeScreenStyles, HomeScreenStyles } from "./HomeScreen.styles";
import { AttributionsBanner } from "./AttributionsBanner";
import { JumpBackInSection } from "./JumpBackInSection";
import {
  FeaturedMolecules,
  getSavedShowcaseScrollOffset,
  setSavedShowcaseScrollOffset,
  resetShowcaseScrollOffset,
  resetSavedFeaturedCategory,
  setSavedFeaturedCategory,
  getSavedFeaturedCategory,
  resetCategoryTabsScrollOffset,
  getSavedCategoryTabsScrollOffset,
  setSavedCategoryTabsScrollOffset,
  subscribeCategoryChange,
} from "./FeaturedMolecules";

export {
  resetShowcaseScrollOffset,
  getSavedShowcaseScrollOffset,
  setSavedShowcaseScrollOffset,
  resetSavedFeaturedCategory,
  setSavedFeaturedCategory,
  getSavedFeaturedCategory,
  resetCategoryTabsScrollOffset,
  getSavedCategoryTabsScrollOffset,
  setSavedCategoryTabsScrollOffset,
  subscribeCategoryChange,
};
export type { HomeScreenStyles };

export interface HomeScreenProps {
  onSelectMolecule: (query: string) => void;
  styles?: Partial<HomeScreenStyles>;
  topOffset?: number;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
  history?: SavedCompoundItem[];
  bookmarks?: SavedCompoundItem[];
  onOpenHistory?: (initialTab?: "history" | "bookmarks") => void;
  onOpenAbout?: () => void;
  initialCategory?: FeaturedCategoryKey;
  onCategoryChange?: (category: FeaturedCategoryKey) => void;
  initialCategoryScrollOffset?: number;
  onCategoryScrollOffsetChange?: (offset: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = React.memo(
  ({
    onSelectMolecule,
    styles: passedStyles,
    topOffset,
    initialScrollOffset: propsInitialScrollOffset,
    onScrollOffsetChange,
    history,
    bookmarks,
    onOpenHistory,
    onOpenAbout,
    initialCategory,
    onCategoryChange,
    initialCategoryScrollOffset,
    onCategoryScrollOffsetChange,
  }) => {
    const metrics = useScaleMetrics();
    const isPartial = Boolean(
      passedStyles &&
      !(
        "featuredContainer" in passedStyles &&
        "featuredScrollContent" in passedStyles
      ),
    );
    const ownStyles = useMemo(
      () => (passedStyles && !isPartial ? null : getHomeScreenStyles(metrics)),
      [passedStyles, isPartial, metrics],
    );
    const styles = useMemo(
      () =>
        passedStyles
          ? ownStyles
            ? { ...ownStyles, ...passedStyles }
            : (passedStyles as HomeScreenStyles)
          : ownStyles!,
      [passedStyles, ownStyles],
    );

    const { height, isLandscape } = metrics;
    const isPhoneLandscape = isLandscape && height < BREAKPOINTS.TABLET;
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

    const [initialScrollOffset] = useState(
      () => propsInitialScrollOffset ?? getSavedShowcaseScrollOffset(),
    );

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
        setSavedShowcaseScrollOffset(offsetY);
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
          if (contentHeight >= initialScrollOffset) {
            hasRestoredScrollRef.current = true;
          }
          if (restoreScrollRafRef.current !== null) {
            cancelAnimationFrame(restoreScrollRafRef.current);
          }
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

      const processItems = (items?: SavedCompoundItem[]) => {
        if (!items) return;
        for (const item of items) {
          if (!item?.name) continue;
          const lower = normalizeCompoundName(item.name);
          const existing = itemMap.get(lower);
          const timestamp = item.timestamp || 0;
          if (!existing || timestamp > (existing.timestamp || 0)) {
            itemMap.set(lower, item);
          }
        }
      };

      processItems(history);
      processItems(bookmarks);

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

    const contentContainerStyle = useMemo(
      () => [
        styles.featuredScrollContent,
        topOffset ? { paddingTop: topOffset } : null,
      ],
      [styles.featuredScrollContent, topOffset],
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
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
        >
          {/* Creator & Open Source Banner */}
          <AttributionsBanner
            onOpenAbout={onOpenAbout}
            styles={styles}
            isPhoneLandscape={isPhoneLandscape}
          />

          {/* Jump Back In (Recent Searches & Favorites) */}
          {recentItems.length > 0 && (
            <JumpBackInSection
              recentItems={recentItems}
              bookmarkNamesSet={bookmarkNamesSet}
              onSelectMolecule={onSelectMolecule}
              onOpenHistory={onOpenHistory}
              styles={styles}
              isPhoneLandscape={isPhoneLandscape}
            />
          )}

          {/* Featured Molecules (Hero + Category Tabs + Cards Grid) */}
          <FeaturedMolecules
            onSelectMolecule={onSelectMolecule}
            styles={styles}
            initialCategory={initialCategory}
            onCategoryChange={onCategoryChange}
            initialCategoryScrollOffset={initialCategoryScrollOffset}
            onCategoryScrollOffsetChange={onCategoryScrollOffsetChange}
            isPhoneLandscape={isPhoneLandscape}
          />
        </ScrollView>
      </View>
    );
  },
);

HomeScreen.displayName = "HomeScreen";
