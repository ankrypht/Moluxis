import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../constants/colors";
import { ChemicalFormula } from "./ChemicalFormula";
import { triggerSelectionHaptic, triggerImpactLight } from "../utils/haptics";
import { useScaleMetrics } from "../utils/scaling";
import { BREAKPOINTS } from "../constants/theme";
import { SavedCompoundItem } from "../types";
import { normalizeCompoundName } from "../utils/compound";
import {
  getJumpBackInSectionStyles,
  JumpBackInSectionStyles,
} from "./JumpBackInSection.styles";

export interface JumpBackInSectionProps {
  recentItems: SavedCompoundItem[];
  bookmarkNamesSet: Set<string>;
  onSelectMolecule: (query: string) => void;
  onOpenHistory?: (initialTab?: "history" | "bookmarks") => void;
  styles?: Partial<JumpBackInSectionStyles>;
  isPhoneLandscape?: boolean;
}

export const JumpBackInSection: React.FC<JumpBackInSectionProps> = React.memo(
  ({
    recentItems,
    bookmarkNamesSet,
    onSelectMolecule,
    onOpenHistory,
    styles: passedStyles,
    isPhoneLandscape: passedIsPhoneLandscape,
  }) => {
    const metrics = useScaleMetrics();
    const ownStyles = useMemo(
      () => (passedStyles ? null : getJumpBackInSectionStyles(metrics)),
      [passedStyles, metrics],
    );
    const styles = passedStyles ?? ownStyles!;
    const isLandscape = metrics.isLandscape;
    const isPhoneLandscape =
      passedIsPhoneLandscape ??
      (isLandscape && metrics.height < BREAKPOINTS.TABLET);

    if (!recentItems || recentItems.length === 0) {
      return null;
    }

    return (
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
              <Text allowFontScaling={false} style={styles.jumpBackViewAllText}>
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
          {recentItems.map((item, index) => {
            const normName = normalizeCompoundName(item?.name);
            const isFav = normName
              ? (bookmarkNamesSet?.has(normName) ?? false)
              : false;
            const itemName = item?.name || "";
            return (
              <TouchableOpacity
                key={`${item.cid || item.name}-${index}`}
                testID={`recent-chip-${itemName.toLowerCase()}`}
                accessibilityRole="button"
                accessibilityLabel={`Revisit ${itemName}`}
                style={styles.jumpBackChip}
                onPress={() => {
                  triggerSelectionHaptic();
                  onSelectMolecule(itemName);
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
                    {itemName}
                  </Text>
                  {item?.formula ? (
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
    );
  },
);

JumpBackInSection.displayName = "JumpBackInSection";
