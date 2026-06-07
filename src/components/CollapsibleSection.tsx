import React, { useState } from "react";
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
  const responsivePadding = getResponsiveSize(16, width, height);
  const responsiveGap = getResponsiveSize(10, width, height);
  const responsiveFontSize = getResponsiveSize(16, width, height);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View
      style={[
        styles.section,
        { marginBottom: getResponsiveSize(12, width, height) },
      ]}
    >
      <TouchableOpacity
        style={[styles.sectionHeader, { padding: responsivePadding }]}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={[styles.sectionHeaderLeft, { gap: responsiveGap }]}>
          <Ionicons
            allowFontScaling={false}
            name={icon}
            size={getResponsiveSize(20, width, height)}
            color={COLORS.primary}
          />
          <Text
            allowFontScaling={false}
            style={[styles.sectionTitle, { fontSize: responsiveFontSize }]}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          allowFontScaling={false}
          name={expanded ? "chevron-up" : "chevron-down"}
          size={getResponsiveSize(20, width, height)}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
      {expanded && (
        <View
          style={[
            styles.sectionContent,
            {
              paddingHorizontal: responsivePadding,
              paddingBottom: responsivePadding,
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
