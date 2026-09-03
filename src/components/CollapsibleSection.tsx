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
import { COLORS } from "../constants/colors";

interface CollapsibleSectionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { width, height } = useWindowDimensions();

  // Memoize all responsive sizes so getResponsiveSize is not recalculated
  // on every render — only when width/height actually change (e.g. rotation).
  const sizes = useMemo(
    () => ({
      padding: getResponsiveSize(16, width, height),
      gap: getResponsiveSize(10, width, height),
      fontSize: getResponsiveSize(16, width, height),
      iconSize: getResponsiveSize(20, width, height),
      marginBottom: getResponsiveSize(12, width, height),
    }),
    [width, height],
  );

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.section, { marginBottom: sizes.marginBottom }]}>
      <TouchableOpacity
        style={[styles.sectionHeader, { padding: sizes.padding }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={[styles.sectionHeaderLeft, { gap: sizes.gap }]}>
          <Ionicons
            allowFontScaling={false}
            name={icon}
            size={sizes.iconSize}
            color={COLORS.primary}
          />
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
          color={COLORS.textSecondary}
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
  sectionTitle: {
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionContent: {
    overflow: "hidden",
  },
});
