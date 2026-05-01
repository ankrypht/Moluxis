import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getResponsiveSize } from "../utils/responsive";

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
  const animatedHeight = useRef(
    new Animated.Value(defaultExpanded ? 1 : 0),
  ).current;

  const { width, height } = useWindowDimensions();
  const responsivePadding = getResponsiveSize(16, width, height);
  const responsiveGap = getResponsiveSize(10, width, height);
  const responsiveFontSize = getResponsiveSize(16, width, height);

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
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
      >
        <View style={[styles.sectionHeaderLeft, { gap: responsiveGap }]}>
          <Ionicons
            name={icon}
            size={getResponsiveSize(20, width, height)}
            color="#0A84FF"
          />
          <Text style={[styles.sectionTitle, { fontSize: responsiveFontSize }]}>
            {title}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={getResponsiveSize(20, width, height)}
          color="#888"
        />
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.sectionContent,
          {
            paddingHorizontal: responsivePadding,
            paddingBottom: expanded ? responsivePadding : 0,
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 5000], // Increased for large content
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#252525",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
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
    color: "#FFF",
  },
  sectionContent: {
    overflow: "hidden",
  },
});
