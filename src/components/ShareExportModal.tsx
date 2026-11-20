import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MoleculeInfo } from "../types";
import { COLORS, addOpacity } from "../constants/colors";
import { ShareExportModalStyles } from "./ShareExportModal.styles";
import { ChemicalFormula } from "./ChemicalFormula";
import {
  getCompoundPubChemUrl,
  shareCompoundDetails,
  sharePubChemLink,
  shareNameAndFormula,
  shareSnapshotImage,
} from "../services/share/shareService";
import {
  triggerImpactLight,
  triggerSuccessHaptic,
  triggerSelectionHaptic,
} from "../utils/haptics";
import { formatSubscriptFormula } from "../utils/formula";
import { useBottomSheetAnimation } from "../hooks/useModalAnimation";

export interface ShareExportModalProps {
  visible: boolean;
  onClose: () => void;
  moleculeData: MoleculeInfo | null;
  snapshotUri: string | null;
  isCapturingSnapshot: boolean;
  onRefreshSnapshot: () => void;
  onCaptureFullSnapshot?: () => Promise<string | null>;
  onResetSnapshot?: () => void;
  styles: ShareExportModalStyles;
  isLandscape?: boolean;
  height?: number;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = React.memo(
  ({
    visible,
    onClose,
    moleculeData,
    snapshotUri,
    isCapturingSnapshot,
    onRefreshSnapshot,
    onCaptureFullSnapshot,
    onResetSnapshot,
    styles,
    isLandscape = false,
    height = 700,
  }) => {
    const { slideAnim, sheetHeight } = useBottomSheetAnimation({
      visible,
      height,
      isLandscape,
      heightRatio: 0.75,
    });

    const [isSharingImage, setIsSharingImage] = useState(false);
    const [pendingShareSnapshot, setPendingShareSnapshot] = useState(false);
    const hasAttemptedCaptureRef = useRef(false);
    const moleculeKey = moleculeData
      ? `${moleculeData.cid || ""}:${moleculeData.codId || ""}:${moleculeData.name || ""}`
      : null;
    const prevMoleculeKeyRef = useRef<string | null>(moleculeKey);

    if (moleculeKey !== prevMoleculeKeyRef.current) {
      prevMoleculeKeyRef.current = moleculeKey;
      hasAttemptedCaptureRef.current = false;
    }

    useEffect(() => {
      if (visible) {
        setPendingShareSnapshot(false);
      } else {
        hasAttemptedCaptureRef.current = false;
        onResetSnapshot?.();
      }
    }, [visible, onResetSnapshot]);

    useEffect(() => {
      return () => {
        onResetSnapshot?.();
      };
    }, [onResetSnapshot]);

    // Auto-request snapshot if not yet captured when modal is visible (once per session)
    useEffect(() => {
      if (
        visible &&
        !snapshotUri &&
        !isCapturingSnapshot &&
        !hasAttemptedCaptureRef.current
      ) {
        hasAttemptedCaptureRef.current = true;
        onRefreshSnapshot();
      }
    }, [
      visible,
      snapshotUri,
      isCapturingSnapshot,
      onRefreshSnapshot,
      moleculeKey,
    ]);

    // If user tapped share snapshot while it was capturing, share once ready
    useEffect(() => {
      if (pendingShareSnapshot && snapshotUri && moleculeData) {
        setPendingShareSnapshot(false);
        setIsSharingImage(true);
        shareSnapshotImage(snapshotUri, moleculeData.name).finally(() => {
          setIsSharingImage(false);
        });
      }
    }, [pendingShareSnapshot, snapshotUri, moleculeData]);

    const handleShareDetails = useCallback(async () => {
      if (!moleculeData) return;
      triggerSuccessHaptic();
      await shareCompoundDetails(moleculeData);
    }, [moleculeData]);

    const handleShareSnapshot = useCallback(async () => {
      if (!moleculeData) return;
      triggerSuccessHaptic();

      setIsSharingImage(true);
      try {
        let imageUriToShare: string | null = null;
        if (onCaptureFullSnapshot) {
          imageUriToShare = await onCaptureFullSnapshot();
        } else if (snapshotUri) {
          imageUriToShare = snapshotUri;
        }

        // Fall back to preview snapshotUri if on-demand capture returned null (e.g., timeout or unready viewer)
        if (!imageUriToShare && snapshotUri) {
          imageUriToShare = snapshotUri;
        }

        if (imageUriToShare) {
          await shareSnapshotImage(imageUriToShare, moleculeData.name);
        } else if (!onCaptureFullSnapshot && !snapshotUri) {
          // Trigger capture and wait (legacy fallback)
          setPendingShareSnapshot(true);
          onRefreshSnapshot();
        }
      } finally {
        setIsSharingImage(false);
      }
    }, [moleculeData, onCaptureFullSnapshot, snapshotUri, onRefreshSnapshot]);

    const handleSharePubChem = useCallback(async () => {
      if (!moleculeData) return;
      triggerSuccessHaptic();
      await sharePubChemLink(moleculeData);
    }, [moleculeData]);

    const handleShareFormula = useCallback(async () => {
      if (!moleculeData) return;
      triggerSuccessHaptic();
      await shareNameAndFormula(moleculeData);
    }, [moleculeData]);

    const pubchemUrl = useMemo(
      () => getCompoundPubChemUrl(moleculeData?.cid),
      [moleculeData?.cid],
    );

    if (!visible || !moleculeData) return null;

    return (
      <View style={styles.shareBackdrop}>
        <Pressable
          testID="share-modal-backdrop"
          style={StyleSheet.absoluteFill}
          onPress={() => {
            triggerImpactLight();
            onClose();
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss share modal"
        />

        <Animated.View
          style={[
            styles.shareModalContainer,
            isLandscape && styles.shareModalContainerLandscape,
            {
              height: sheetHeight,
              transform: isLandscape
                ? [{ translateX: slideAnim }]
                : [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.shareModalHeader}>
            <View style={styles.shareModalTopBar}>
              <View style={styles.shareModalTitleRow}>
                <View style={styles.shareModalIconBadge}>
                  <Ionicons
                    name="share-social"
                    size={17}
                    color={COLORS.primary}
                    allowFontScaling={false}
                  />
                </View>
                <View>
                  <Text allowFontScaling={false} style={styles.shareModalTitle}>
                    Share & Export
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={styles.shareModalSubtitle}
                  >
                    Share compound details or 3D snapshot
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                testID="close-share-modal"
                style={styles.shareCloseButton}
                onPress={() => {
                  triggerImpactLight();
                  onClose();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Close share modal"
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={COLORS.textPrimary}
                  allowFontScaling={false}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.shareContentScroll}
            contentContainerStyle={styles.shareContentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Compound Preview Card */}
            <View testID="share-preview-card" style={styles.sharePreviewCard}>
              <View style={styles.sharePreviewTopRow}>
                <View style={styles.sharePreviewMetaCol}>
                  <Text
                    allowFontScaling={false}
                    style={styles.sharePreviewMoleculeName}
                    numberOfLines={1}
                  >
                    {moleculeData.name.toUpperCase()}
                  </Text>
                  <View style={styles.sharePreviewFormulaRow}>
                    {moleculeData.formula ? (
                      <ChemicalFormula formula={moleculeData.formula} />
                    ) : (
                      <Text
                        allowFontScaling={false}
                        style={{ color: COLORS.textMuted }}
                      >
                        N/A
                      </Text>
                    )}
                  </View>

                  <View style={styles.sharePreviewBadgesRow}>
                    {Boolean(moleculeData.cid) && (
                      <View
                        style={[
                          styles.sharePreviewBadge,
                          {
                            backgroundColor: addOpacity(COLORS.blue, 0.15),
                            borderColor: addOpacity(COLORS.blue, 0.35),
                          },
                        ]}
                      >
                        <Text
                          allowFontScaling={false}
                          style={[
                            styles.sharePreviewBadgeText,
                            { color: COLORS.blue },
                          ]}
                        >
                          CID: {moleculeData.cid}
                        </Text>
                      </View>
                    )}

                    {Boolean(moleculeData.molecularWeight) && (
                      <View
                        style={[
                          styles.sharePreviewBadge,
                          {
                            backgroundColor: addOpacity(COLORS.cyan, 0.15),
                            borderColor: addOpacity(COLORS.cyan, 0.35),
                          },
                        ]}
                      >
                        <Text
                          allowFontScaling={false}
                          style={[
                            styles.sharePreviewBadgeText,
                            { color: COLORS.cyan },
                          ]}
                        >
                          {moleculeData.molecularWeight}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* 3D Snapshot Thumbnail */}
                <View style={styles.sharePreviewImageContainer}>
                  {snapshotUri ? (
                    <Image
                      testID="snapshot-preview-image"
                      source={{ uri: snapshotUri }}
                      style={styles.sharePreviewImage}
                      resizeMode="cover"
                    />
                  ) : isCapturingSnapshot ? (
                    <View style={styles.sharePreviewImagePlaceholder}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text
                        allowFontScaling={false}
                        style={styles.sharePreviewImagePlaceholderText}
                      >
                        Capturing...
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      testID="capture-snapshot-button"
                      style={styles.sharePreviewImagePlaceholder}
                      onPress={() => {
                        triggerSelectionHaptic();
                        onRefreshSnapshot();
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Capture snapshot"
                    >
                      <Ionicons
                        name="camera-outline"
                        size={20}
                        color={COLORS.textMuted}
                        allowFontScaling={false}
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.sharePreviewImagePlaceholderText}
                      >
                        Tap to snap
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* Sharing Options */}
            <Text allowFontScaling={false} style={styles.shareSectionLabel}>
              Share & Export Options
            </Text>

            <View style={styles.shareOptionsList}>
              {/* Option 1: Share 3D Snapshot Image */}
              <View
                testID="share-card-snapshot"
                style={[styles.shareOptionCard, styles.shareOptionCardActive]}
              >
                <View style={styles.shareOptionLeft}>
                  <View
                    style={[
                      styles.shareOptionIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.cyan, 0.15),
                        borderColor: addOpacity(COLORS.cyan, 0.4),
                      },
                    ]}
                  >
                    <Ionicons
                      name="image-outline"
                      size={18}
                      color={COLORS.cyan}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={styles.shareOptionTextCol}>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionTitle}
                    >
                      3D Snapshot Image
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionDescription}
                    >
                      Export high-res 3D render image
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  testID="action-share-snapshot"
                  style={[
                    styles.shareActionButton,
                    styles.shareActionButtonPrimary,
                  ]}
                  onPress={handleShareSnapshot}
                  disabled={isSharingImage || isCapturingSnapshot}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Share 3D Snapshot Image"
                >
                  {isSharingImage || isCapturingSnapshot ? (
                    <ActivityIndicator size="small" color={COLORS.background} />
                  ) : (
                    <>
                      <Ionicons
                        name="share-outline"
                        size={14}
                        color={COLORS.background}
                        allowFontScaling={false}
                      />
                      <Text
                        allowFontScaling={false}
                        style={styles.shareActionButtonText}
                      >
                        Share
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Option 2: Share Compound Full Details */}
              <View testID="share-card-details" style={styles.shareOptionCard}>
                <View style={styles.shareOptionLeft}>
                  <View
                    style={[
                      styles.shareOptionIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.primary, 0.15),
                        borderColor: addOpacity(COLORS.primary, 0.4),
                      },
                    ]}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={18}
                      color={COLORS.primary}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={styles.shareOptionTextCol}>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionTitle}
                    >
                      Compound Details
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionDescription}
                    >
                      Name, formula, weight & PubChem link
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  testID="action-share-details"
                  style={[
                    styles.shareActionButton,
                    styles.shareActionButtonSecondary,
                  ]}
                  onPress={handleShareDetails}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Share Compound Details"
                >
                  <Ionicons
                    name="share-outline"
                    size={14}
                    color={COLORS.textPrimary}
                    allowFontScaling={false}
                  />
                  <Text
                    allowFontScaling={false}
                    style={styles.shareActionButtonTextSecondary}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Option 3: PubChem Link */}
              {Boolean(pubchemUrl) && (
                <View
                  testID="share-card-pubchem"
                  style={styles.shareOptionCard}
                >
                  <View style={styles.shareOptionLeft}>
                    <View
                      style={[
                        styles.shareOptionIconBadge,
                        {
                          backgroundColor: addOpacity(COLORS.purple, 0.15),
                          borderColor: addOpacity(COLORS.purple, 0.4),
                        },
                      ]}
                    >
                      <Ionicons
                        name="link-outline"
                        size={18}
                        color={COLORS.purple}
                        allowFontScaling={false}
                      />
                    </View>
                    <View style={styles.shareOptionTextCol}>
                      <Text
                        allowFontScaling={false}
                        style={styles.shareOptionTitle}
                      >
                        PubChem Link
                      </Text>
                      <Text
                        allowFontScaling={false}
                        style={styles.shareOptionDescription}
                      >
                        {pubchemUrl}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    testID="action-share-pubchem"
                    style={[
                      styles.shareActionButton,
                      styles.shareActionButtonSecondary,
                    ]}
                    onPress={handleSharePubChem}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Share PubChem link"
                  >
                    <Ionicons
                      name="share-outline"
                      size={14}
                      color={COLORS.textPrimary}
                      allowFontScaling={false}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.shareActionButtonTextSecondary}
                    >
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Option 4: Formula & Name */}
              <View testID="share-card-formula" style={styles.shareOptionCard}>
                <View style={styles.shareOptionLeft}>
                  <View
                    style={[
                      styles.shareOptionIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.amber, 0.15),
                        borderColor: addOpacity(COLORS.amber, 0.4),
                      },
                    ]}
                  >
                    <Ionicons
                      name="flask-outline"
                      size={18}
                      color={COLORS.amber}
                      allowFontScaling={false}
                    />
                  </View>
                  <View style={styles.shareOptionTextCol}>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionTitle}
                    >
                      Name & Formula
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.shareOptionDescription}
                    >
                      {moleculeData.name}
                      {moleculeData.formula
                        ? ` • ${formatSubscriptFormula(moleculeData.formula)}`
                        : ""}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  testID="action-share-formula"
                  style={[
                    styles.shareActionButton,
                    styles.shareActionButtonSecondary,
                  ]}
                  onPress={handleShareFormula}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Share name and formula"
                >
                  <Ionicons
                    name="share-outline"
                    size={14}
                    color={COLORS.textPrimary}
                    allowFontScaling={false}
                  />
                  <Text
                    allowFontScaling={false}
                    style={styles.shareActionButtonTextSecondary}
                  >
                    Share
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    );
  },
);

ShareExportModal.displayName = "ShareExportModal";
