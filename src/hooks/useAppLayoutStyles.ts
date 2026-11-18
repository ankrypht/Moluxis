import { useMemo } from "react";
import { ViewStyle } from "react-native";

interface UseAppLayoutStylesOptions {
  isLandscape: boolean;
  isMeasuring: boolean;
  showInfo: boolean;
  showShareModal: boolean;
  showDisplayOptions: boolean;
  measurePanelSize: {
    width: number;
    height: number;
    isLandscape: boolean;
  };
  measurementPanelWrapperStyle?: ViewStyle;
}

export function useAppLayoutStyles({
  isLandscape,
  isMeasuring,
  showInfo,
  showShareModal,
  showDisplayOptions,
  measurePanelSize,
  measurementPanelWrapperStyle,
}: UseAppLayoutStylesOptions) {
  const dynamicViewerContainerStyle = useMemo<ViewStyle>(() => {
    if (isMeasuring) {
      const hasMatchingSize = measurePanelSize.isLandscape === isLandscape;
      if (isLandscape) {
        const panelWidth =
          hasMatchingSize && measurePanelSize.width > 0
            ? measurePanelSize.width
            : measurementPanelWrapperStyle &&
                "width" in measurementPanelWrapperStyle &&
                typeof measurementPanelWrapperStyle.width === "number"
              ? measurementPanelWrapperStyle.width
              : 360;
        return {
          right: panelWidth,
          bottom: 0,
        };
      }
      const panelHeight =
        hasMatchingSize && measurePanelSize.height > 0
          ? measurePanelSize.height
          : 210;
      return {
        bottom: panelHeight,
        right: 0,
      };
    }
    return {
      right: isLandscape && showInfo ? "45%" : 0,
      bottom: 0,
    };
  }, [
    isMeasuring,
    isLandscape,
    showInfo,
    measurePanelSize.width,
    measurePanelSize.height,
    measurePanelSize.isLandscape,
    measurementPanelWrapperStyle,
  ]);

  const dynamicHeaderContainerStyle = useMemo<ViewStyle>(
    () => ({
      right: isLandscape ? (showInfo ? "45%" : 0) : 0,
    }),
    [isLandscape, showInfo],
  );

  const dynamicDockContainerStyle = useMemo<ViewStyle>(
    () => ({
      ...(isLandscape
        ? showInfo
          ? { right: "45%" }
          : showShareModal
            ? { right: "52%" }
            : {}
        : { right: 0 }),
      marginRight: isLandscape && (showInfo || showShareModal) ? 8 : 0,
      zIndex: showDisplayOptions ? 150 : 50,
    }),
    [isLandscape, showInfo, showShareModal, showDisplayOptions],
  );

  return {
    dynamicViewerContainerStyle,
    dynamicHeaderContainerStyle,
    dynamicDockContainerStyle,
  };
}
