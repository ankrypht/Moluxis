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

export const MoleculeViewer: React.FC<MoleculeViewerProps> = React.memo(
  ({
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
    const isWebViewReadyRef = useRef(false);
    const isAnimatedRef = useRef(isAnimated);
    const pendingStructureRef = useRef<string | null>(null);
    const lastLoadedSignatureRef = useRef<string | null>(null);
    const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      isAnimatedRef.current = isAnimated;
    }, [isAnimated]);

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
            if (isAnimatedRef.current) {
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
    }, [postToWebView]);

    // Reset readiness and loaded signature when WebView is unmounted (e.g., returning to showcase)
    useEffect(() => {
      if (!moleculeData && !isLoading) {
        isWebViewReadyRef.current = false;
        lastLoadedSignatureRef.current = null;
        pendingStructureRef.current = null;
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      }
    }, [moleculeData, isLoading]);

    const currentSignature = useMemo(() => {
      if (!moleculeData) return null;
      return `${moleculeData.cid || moleculeData.name}_${structureFormat}_${moleculeData.useCif ? "cif" : "sdf"}`;
    }, [moleculeData, structureFormat]);

    // Dispatch LOAD_STRUCTURE when moleculeData or structureFormat changes
    useEffect(() => {
      if (!moleculeData || !currentSignature) return;

      // Avoid redundant LOAD_STRUCTURE if this exact structure has already been rendered in this ready WebView
      if (lastLoadedSignatureRef.current === currentSignature) {
        return;
      }

      const useCif = moleculeData.useCif;
      const structureData =
        structureFormat === "2d"
          ? moleculeData.sdf2d || moleculeData.sdf3d
          : useCif
            ? moleculeData.cif
            : moleculeData.sdf3d;
      const structureFormatType =
        structureFormat === "2d" && moleculeData.sdf2d
          ? "sdf"
          : useCif
            ? "cif"
            : "sdf";

      const message = JSON.stringify({
        type: "LOAD_STRUCTURE",
        data: structureData,
        format: structureFormatType,
        style: vizStyle,
        labels: showLabels,
        animate: isAnimated,
      });

      if (isWebViewReadyRef.current) {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        lastLoadedSignatureRef.current = currentSignature;
        pendingStructureRef.current = null;
        postToWebView(message);
      } else {
        // WebView is mounting or initializing. Queue the structure to be loaded upon WEBVIEW_READY.
        pendingStructureRef.current = message;

        // Fallback safety timeout in case the message bridge dropped WEBVIEW_READY
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
        }
        fallbackTimerRef.current = setTimeout(() => {
          if (
            lastLoadedSignatureRef.current !== currentSignature &&
            pendingStructureRef.current
          ) {
            isWebViewReadyRef.current = true;
            lastLoadedSignatureRef.current = currentSignature;
            postToWebView(pendingStructureRef.current);
            pendingStructureRef.current = null;
          }
        }, 1500);
      }

      return () => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      };
    }, [
      moleculeData,
      currentSignature,
      structureFormat,
      vizStyle,
      showLabels,
      isAnimated,
      postToWebView,
    ]);

    // Track settings changes to dispatch UPDATE_SETTINGS without re-clearing the model
    const prevSettingsRef = useRef({
      vizStyle,
      showLabels,
      isAnimated,
      signature: currentSignature,
    });

    useEffect(() => {
      // If the structure itself changed, LOAD_STRUCTURE already applies style/labels/animate
      if (prevSettingsRef.current.signature !== currentSignature) {
        prevSettingsRef.current = {
          vizStyle,
          showLabels,
          isAnimated,
          signature: currentSignature,
        };
        return;
      }

      // If settings have not changed, do nothing
      if (
        prevSettingsRef.current.vizStyle === vizStyle &&
        prevSettingsRef.current.showLabels === showLabels &&
        prevSettingsRef.current.isAnimated === isAnimated
      ) {
        return;
      }

      prevSettingsRef.current = {
        vizStyle,
        showLabels,
        isAnimated,
        signature: currentSignature,
      };

      if (moleculeData && isWebViewReadyRef.current) {
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
    }, [
      moleculeData,
      currentSignature,
      vizStyle,
      showLabels,
      isAnimated,
      postToWebView,
    ]);

    const onWebViewMessage = useCallback(
      (event: any) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (isWebViewReadyMessage(data)) {
            isWebViewReadyRef.current = true;
            if (fallbackTimerRef.current) {
              clearTimeout(fallbackTimerRef.current);
              fallbackTimerRef.current = null;
            }

            if (moleculeData && currentSignature) {
              if (lastLoadedSignatureRef.current !== currentSignature) {
                const useCif = moleculeData.useCif;
                const structureData =
                  structureFormat === "2d"
                    ? moleculeData.sdf2d || moleculeData.sdf3d
                    : useCif
                      ? moleculeData.cif
                      : moleculeData.sdf3d;
                const structureFormatType =
                  structureFormat === "2d" && moleculeData.sdf2d
                    ? "sdf"
                    : useCif
                      ? "cif"
                      : "sdf";

                const message =
                  pendingStructureRef.current ||
                  JSON.stringify({
                    type: "LOAD_STRUCTURE",
                    data: structureData,
                    format: structureFormatType,
                    style: vizStyle,
                    labels: showLabels,
                    animate: isAnimated,
                  });
                lastLoadedSignatureRef.current = currentSignature;
                pendingStructureRef.current = null;
                postToWebView(message);
              }
            }
          }
        } catch {
          // Silently handle non-JSON messages
        }
      },
      [
        moleculeData,
        currentSignature,
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
            onLoadStart={() => {
              isWebViewReadyRef.current = false;
            }}
            onRenderProcessGone={(syntheticEvent) => {
              const { didCrash } = syntheticEvent.nativeEvent;
              console.warn("WebView render process gone, didCrash:", didCrash);
              isWebViewReadyRef.current = false;
              lastLoadedSignatureRef.current = null;
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
  },
);

MoleculeViewer.displayName = "MoleculeViewer";
