import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  LayoutAnimation,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getResponsiveSize } from "../utils/responsive";
import { COLORS, addOpacity } from "../constants/colors";
import { triggerSelectionHaptic } from "../utils/haptics";

interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  iconColor?: string;
  iconBg?: string;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  iconColor,
  iconBg,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { width, height } = useWindowDimensions();

  const activeColor = iconColor || COLORS.primary;
  const activeBg = iconBg || addOpacity(activeColor, 0.15);

  // Memoize all responsive sizes so getResponsiveSize is not recalculated
  // on every render — only when width/height actually change (e.g. rotation).
  const sizes = useMemo(
    () => ({
      padding: getResponsiveSize(16, width, height),
      gap: getResponsiveSize(12, width, height),
      fontSize: getResponsiveSize(15, width, height),
      iconSize: getResponsiveSize(17, width, height),
      iconBadgeSize: getResponsiveSize(30, width, height),
      iconBadgeRadius: getResponsiveSize(10, width, height),
      marginBottom: getResponsiveSize(12, width, height),
    }),
    [width, height],
  );

  const toggleExpand = () => {
    triggerSelectionHaptic();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View
      style={[
        styles.section,
        {
          marginBottom: sizes.marginBottom,
          borderColor: expanded ? addOpacity(activeColor, 0.35) : COLORS.border,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.sectionHeader, { padding: sizes.padding }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${title}, ${expanded ? "expanded" : "collapsed"}`}
      >
        <View style={[styles.sectionHeaderLeft, { gap: sizes.gap }]}>
          <View
            style={[
              styles.iconBadge,
              {
                width: sizes.iconBadgeSize,
                height: sizes.iconBadgeSize,
                borderRadius: sizes.iconBadgeRadius,
                backgroundColor: activeBg,
              },
            ]}
          >
            <Ionicons
              allowFontScaling={false}
              name={icon}
              size={sizes.iconSize}
              color={activeColor}
            />
          </View>
          <Text
            allowFontScaling={false}
            style={[styles.sectionTitle, { fontSize: sizes.fontSize }]}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          allowFontScaling={false}
          name={expanded ? "chevron-up" : "chevron-down"}
          size={sizes.iconSize}
          color={expanded ? activeColor : COLORS.textSecondary}
        />
      </TouchableOpacity>
      {expanded && (
        <View
          style={[
            styles.sectionContent,
            {
              paddingHorizontal: sizes.padding,
              paddingBottom: sizes.padding,
            },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBadge: {
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  sectionContent: {
    overflow: "hidden",
  },
});
