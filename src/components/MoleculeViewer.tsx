import React, { useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  AppState,
  AppStateStatus,
} from "react-native";
import { WebView } from "react-native-webview";

import { MoleculeInfo, VisualizationType, SavedCompoundItem } from "../types";
import { VIEWER_HTML } from "../constants/viewerHtml";
import { COLORS } from "../constants/colors";
import { MoleculeViewerStyles } from "./MoleculeViewer.styles";
import { FeaturedMolecules } from "./FeaturedMolecules";
import { FeaturedMoleculesStyles } from "./FeaturedMolecules.styles";

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
  styles: MoleculeViewerStyles & FeaturedMoleculesStyles;
  onSelectMolecule?: (query: string) => void;
  topOffset?: number;
  initialScrollOffset?: number;
  onScrollOffsetChange?: (offset: number) => void;
  history?: SavedCompoundItem[];
  bookmarks?: SavedCompoundItem[];
  onOpenHistory?: (initialTab?: "history" | "bookmarks") => void;
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
  onSelectMolecule,
  topOffset,
  initialScrollOffset,
  onScrollOffsetChange,
  history,
  bookmarks,
  onOpenHistory,
}) => {
  const webViewRef = useRef<WebView>(null);

  const postToWebView = useCallback((message: string) => {
    if (
      webViewRef.current &&
      typeof (webViewRef.current as any).postMessage === "function"
    ) {
      webViewRef.current.postMessage(message);
    }
  }, []);

  const webViewSource = useMemo(
    () => ({
      html: VIEWER_HTML,
      baseUrl: "https://3Dmol.csb.pitt.edu",
    }),
    [],
  );

  // Pause WebGL rendering when app is backgrounded or inactive, or on unmount, to prevent RenderThread deadlocks
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          if (isAnimated) {
            postToWebView(JSON.stringify({ type: "RESUME_ANIMATION" }));
          }
        } else {
          postToWebView(JSON.stringify({ type: "PAUSE_ANIMATION" }));
        }
      },
    );

    return () => {
      subscription.remove();
      postToWebView(JSON.stringify({ type: "PAUSE_ANIMATION" }));
    };
  }, [isAnimated, postToWebView]);

  useEffect(() => {
    if (moleculeData) {
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
        postToWebView(message);
      }, LOAD_DELAY_MS);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moleculeData, structureFormat, postToWebView]);

  // Track previous moleculeData to avoid redundant UPDATE_SETTINGS calls during LOAD_STRUCTURE
  const prevMoleculeDataRef = useRef(moleculeData);
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (prevMoleculeDataRef.current !== moleculeData) {
      prevMoleculeDataRef.current = moleculeData;
      return;
    }

    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    if (moleculeData) {
      const timer = setTimeout(() => {
        const message = JSON.stringify({
          type: "UPDATE_SETTINGS",
          style: vizStyle,
          labels: showLabels,
          animate: isAnimated,
        });
        postToWebView(message);
      }, UPDATE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [moleculeData, vizStyle, showLabels, isAnimated, postToWebView]);

  const onWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (isWebViewReadyMessage(data) && moleculeData) {
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
          postToWebView(message);
        }
      } catch {
        // Silently handle non-JSON messages
      }
    },
    [
      moleculeData,
      structureFormat,
      vizStyle,
      showLabels,
      isAnimated,
      postToWebView,
    ],
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
          overScrollMode="never"
          androidLayerType="none"
          onRenderProcessGone={(syntheticEvent) => {
            const { didCrash } = syntheticEvent.nativeEvent;
            console.warn("WebView render process gone, didCrash:", didCrash);
            webViewRef.current?.reload();
          }}
          onMessage={onWebViewMessage}
        />
      )}
      {isLoading && !moleculeData && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text allowFontScaling={false} style={styles.loadingText}>
            Generating 3D Structure...
          </Text>
        </View>
      )}
      {!moleculeData && !isLoading && (
        <FeaturedMolecules
          onSelectMolecule={onSelectMolecule || (() => {})}
          styles={styles}
          topOffset={topOffset}
          initialScrollOffset={initialScrollOffset}
          onScrollOffsetChange={onScrollOffsetChange}
          history={history}
          bookmarks={bookmarks}
          onOpenHistory={onOpenHistory}
        />
      )}
    </View>
  );
};
