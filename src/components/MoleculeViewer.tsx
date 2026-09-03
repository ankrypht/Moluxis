import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

import { MoleculeInfo, VisualizationType } from "../types";
import { VIEWER_HTML } from "../constants/viewerHtml";
import { MoleculeViewerStyles } from "./MoleculeViewer.styles";

interface WebViewReadyMessage {
  type: "WEBVIEW_READY";
}

function isWebViewReadyMessage(data: unknown): data is WebViewReadyMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>).type === "WEBVIEW_READY"
  );
}

const LOAD_DELAY_MS = 500;
const UPDATE_DELAY_MS = 150;

export interface MoleculeViewerProps {
  moleculeData: MoleculeInfo | null;
  isLoading: boolean;
  structureFormat: "3d" | "2d";
  vizStyle: VisualizationType;
  showLabels: boolean;
  isAnimated: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  styles: MoleculeViewerStyles;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  moleculeData,
  isLoading,
  structureFormat,
  vizStyle,
  showLabels,
  isAnimated,
  containerStyle,
  styles,
}) => {
  const webViewRef = useRef<WebView>(null);

  const webViewSource = useMemo(
    () => ({
      html: VIEWER_HTML,
      baseUrl: "https://3Dmol.csb.pitt.edu",
    }),
    [],
  );

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const useCif = moleculeData.useCif;
      const message = JSON.stringify({
        type: "LOAD_STRUCTURE",
        data:
          structureFormat === "2d"
            ? moleculeData.sdf2d
            : useCif
              ? moleculeData.cif
              : moleculeData.sdf3d,
        format: structureFormat === "2d" ? "sdf" : useCif ? "cif" : "sdf",
        style: vizStyle,
        labels: showLabels,
        animate: isAnimated,
      });

      const timer = setTimeout(() => {
        webViewRef.current?.postMessage(message);
      }, LOAD_DELAY_MS);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moleculeData, structureFormat]);

  useEffect(() => {
    if (moleculeData && webViewRef.current) {
      const timer = setTimeout(() => {
        const message = JSON.stringify({
          type: "UPDATE_SETTINGS",
          style: vizStyle,
          labels: showLabels,
          animate: isAnimated,
        });
        webViewRef.current?.postMessage(message);
      }, UPDATE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [moleculeData, vizStyle, showLabels, isAnimated]);

  const onWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (isWebViewReadyMessage(data) && moleculeData && webViewRef.current) {
          const useCif = moleculeData.useCif;
          const message = JSON.stringify({
            type: "LOAD_STRUCTURE",
            data:
              structureFormat === "2d"
                ? moleculeData.sdf2d
                : useCif
                  ? moleculeData.cif
                  : moleculeData.sdf3d,
            format: structureFormat === "2d" ? "sdf" : useCif ? "cif" : "sdf",
            style: vizStyle,
            labels: showLabels,
            animate: isAnimated,
          });
          webViewRef.current.postMessage(message);
        }
      } catch {
        // Silently handle non-JSON messages
      }
    },
    [moleculeData, structureFormat, vizStyle, showLabels, isAnimated],
  );

  return (
    <View style={[styles.viewerContainer, containerStyle]}>
      {(moleculeData || isLoading) && (
        <WebView
          ref={webViewRef}
          originWhitelist={["https://3Dmol.csb.pitt.edu"]}
          source={webViewSource}
          style={styles.webview}
          scrollEnabled={false}
          onMessage={onWebViewMessage}
        />
      )}
      {!moleculeData && !isLoading && (
        <View style={styles.placeholderOverlay}>
          <Ionicons
            allowFontScaling={false}
            name="cube-outline"
            size={styles.placeholderIcon.fontSize}
            color={styles.placeholderIcon.color}
          />
          <Text allowFontScaling={false} style={styles.placeholderText}>
            Search for a compound to view 3D structure
          </Text>
        </View>
      )}
    </View>
  );
};
