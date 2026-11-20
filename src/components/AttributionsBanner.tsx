import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  APP_AUTHOR,
  GITHUB_REPO_URL,
  getAppVersion,
  openExternalUrl,
} from "../constants/distributions";
import { COLORS } from "../constants/colors";
import { triggerSelectionHaptic, triggerImpactLight } from "../utils/haptics";
import { useScaleMetrics } from "../utils/scaling";
import { BREAKPOINTS } from "../constants/theme";
import {
  getAttributionsBannerStyles,
  AttributionsBannerStyles,
} from "./AttributionsBanner.styles";

const GITHUB_HIT_SLOP = { top: 6, bottom: 8, left: 4, right: 8 } as const;
const APP_VERSION = getAppVersion();

export interface AttributionsBannerProps {
  onOpenAbout?: () => void;
  styles?: Partial<AttributionsBannerStyles>;
  isPhoneLandscape?: boolean;
}

export const AttributionsBanner: React.FC<AttributionsBannerProps> = React.memo(
  ({
    onOpenAbout,
    styles: passedStyles,
    isPhoneLandscape: passedIsPhoneLandscape,
  }) => {
    const metrics = useScaleMetrics();
    const ownStyles = useMemo(
      () => (passedStyles ? null : getAttributionsBannerStyles(metrics)),
      [passedStyles, metrics],
    );
    const styles = passedStyles ?? ownStyles!;
    const isLandscape = metrics.isLandscape;
    const isPhoneLandscape =
      passedIsPhoneLandscape ??
      (isLandscape && metrics.height < BREAKPOINTS.TABLET);

    return (
      <View style={styles.showcaseAboutBanner} testID="showcase-about-banner">
        <View style={styles.showcaseAboutInfoCol}>
          <View style={styles.showcaseAboutCreditRow}>
            <Text
              allowFontScaling={false}
              style={styles.showcaseAboutCreditText}
              numberOfLines={1}
            >
              Made by{" "}
              <Text style={styles.showcaseAboutAuthorName}>{APP_AUTHOR}</Text>
            </Text>
            <Text
              allowFontScaling={false}
              style={styles.showcaseAboutVersionText}
            >
              v{APP_VERSION}
            </Text>
          </View>

          <TouchableOpacity
            testID="showcase-github-button"
            accessibilityRole="button"
            accessibilityLabel="Open source on GitHub"
            style={styles.showcaseGithubLink}
            activeOpacity={0.7}
            hitSlop={GITHUB_HIT_SLOP}
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
              color={COLORS.primary}
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
            <Text allowFontScaling={false} style={styles.showcaseAboutPillText}>
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
    );
  },
);

AttributionsBanner.displayName = "AttributionsBanner";
