import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  Image,
  ActivityIndicator,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, addOpacity } from "../constants/colors";
import {
  APP_AUTHOR,
  APP_LICENSE,
  APP_NAME,
  AppReleaseInfo,
  CONTACT_MAILTO_URL,
  DATA_SOURCES,
  GITHUB_ISSUES_URL,
  GITHUB_LICENSE_URL,
  GITHUB_REPO,
  GITHUB_REPO_URL,
  PLAY_STORE_URL,
  PRIVACY_POLICY_URL,
  getAppVersion,
  getFeedbackMailtoUrl,
  openExternalUrl,
  openPlayStoreUpdate,
} from "../constants/distributions";
import {
  triggerImpactLight,
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "../utils/haptics";
import { useModalBackHandler } from "../hooks/useModalBackHandler";
import { useBottomSheetAnimation } from "../hooks/useModalAnimation";
import { AboutModalStyles } from "./AboutModal.styles";

const APP_ICON = require("../../assets/icon.png");

export interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenWhatsNew?: () => void;
  onCheckForUpdates?: () => Promise<AppReleaseInfo | null>;
  styles: AboutModalStyles;
  isLandscape?: boolean;
  height?: number;
}

type UpdateCheckStatus = "idle" | "checking" | "upToDate" | "error";

const DATA_SOURCE_VISUALS: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  pubchem: { icon: "flask-outline", color: COLORS.emerald },
  cod: { icon: "cube-outline", color: COLORS.cyan },
  "3dmol": { icon: "layers-outline", color: COLORS.purple },
};

export const AboutModal: React.FC<AboutModalProps> = React.memo(
  ({
    visible,
    onClose,
    onOpenWhatsNew,
    onCheckForUpdates,
    styles,
    isLandscape = false,
    height = 700,
  }) => {
    const appVersion = getAppVersion();
    const { slideAnim, fadeAnim, sheetHeight } = useBottomSheetAnimation({
      visible,
      height,
      isLandscape,
      heightRatio: 0.82,
    });

    const [updateStatus, setUpdateStatus] = useState<UpdateCheckStatus>("idle");
    const [prevVisible, setPrevVisible] = useState(visible);

    if (visible !== prevVisible) {
      setPrevVisible(visible);
      if (visible) {
        setUpdateStatus("idle");
      }
    }

    const handleClose = useCallback(() => {
      triggerImpactLight();
      onClose();
    }, [onClose]);

    useModalBackHandler(visible, onClose);

    const handleOpenLink = useCallback((url: string) => {
      triggerSelectionHaptic();
      openExternalUrl(url).catch(() => {});
    }, []);

    const handleRateApp = useCallback(() => {
      triggerSelectionHaptic();
      openPlayStoreUpdate().catch((error) => {
        console.warn("Failed to open Google Play:", error);
      });
    }, []);

    const handleShareApp = useCallback(async () => {
      triggerSuccessHaptic();
      try {
        await Share.share({
          title: `${APP_NAME} — 3D Molecule & Crystal Explorer`,
          message: `Explore molecules and crystal lattices in interactive 3D with ${APP_NAME} (open source on GitHub)!\n\nGoogle Play: ${PLAY_STORE_URL}\nGitHub: ${GITHUB_REPO_URL}`,
        });
      } catch (error) {
        console.warn("Failed to share app:", error);
      }
    }, []);

    const handleWhatsNew = useCallback(() => {
      triggerImpactLight();
      onClose();
      onOpenWhatsNew?.();
    }, [onClose, onOpenWhatsNew]);

    const handleCheckUpdates = useCallback(async () => {
      if (!onCheckForUpdates || updateStatus === "checking") return;
      triggerSelectionHaptic();
      setUpdateStatus("checking");
      try {
        const info = await onCheckForUpdates();
        if (info) {
          setUpdateStatus("idle");
          onClose();
        } else {
          setUpdateStatus("upToDate");
        }
      } catch {
        setUpdateStatus("error");
      }
    }, [onCheckForUpdates, updateStatus, onClose]);

    if (!visible) return null;

    const getUpdateDescription = () => {
      switch (updateStatus) {
        case "checking":
          return "Checking GitHub Releases...";
        case "upToDate":
          return `You're on the latest version (v${appVersion})`;
        case "error":
          return "Couldn't check right now — tap to retry";
        default:
          return "Check GitHub Releases for newer versions";
      }
    };

    return (
      <Animated.View
        testID="about-modal"
        accessibilityViewIsModal={true}
        style={[styles.aboutBackdrop, { opacity: fadeAnim }]}
      >
        <Pressable
          testID="about-modal-backdrop"
          style={{ flex: 1 }}
          onPress={handleClose}
          accessible={false}
        />

        <Animated.View
          style={[
            styles.aboutModalContainer,
            isLandscape
              ? styles.aboutModalContainerLandscape
              : { maxHeight: sheetHeight, height: sheetHeight },
            {
              transform: [
                isLandscape
                  ? { translateX: slideAnim }
                  : { translateY: slideAnim },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.aboutModalHeader}>
            <View style={styles.aboutModalTopBar}>
              <View style={styles.aboutModalTitleRow}>
                <View style={styles.aboutModalIconBadge}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <Text allowFontScaling={false} style={styles.aboutModalTitle}>
                    About {APP_NAME}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={styles.aboutModalSubtitle}
                  >
                    v{appVersion} • Open Source
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                testID="close-about-modal"
                accessibilityRole="button"
                accessibilityLabel="Close about modal"
                style={styles.aboutCloseButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.aboutContentScroll}
            contentContainerStyle={styles.aboutContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Hero Card */}
            <View style={styles.aboutHeroCard} testID="about-hero-card">
              <View style={styles.aboutHeroTopRow}>
                <View style={styles.aboutAppIconFrame}>
                  <Image
                    source={APP_ICON}
                    style={styles.aboutAppIconImage}
                    resizeMode="cover"
                    accessibilityLabel={`${APP_NAME} app icon`}
                  />
                </View>

                <View style={styles.aboutHeroTextCol}>
                  <View style={styles.aboutHeroNameRow}>
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutHeroAppName}
                    >
                      {APP_NAME}
                    </Text>
                    <View style={styles.aboutVersionPill}>
                      <Text
                        allowFontScaling={false}
                        style={styles.aboutVersionPillText}
                      >
                        v{appVersion}
                      </Text>
                    </View>
                    <View style={styles.aboutOpenSourcePill}>
                      <Text
                        allowFontScaling={false}
                        style={styles.aboutOpenSourcePillText}
                      >
                        Open Source
                      </Text>
                    </View>
                  </View>
                  <Text
                    allowFontScaling={false}
                    style={styles.aboutHeroTagline}
                  >
                    Interactive 3D &amp; 2D molecule and crystal lattice
                    explorer.
                  </Text>
                </View>
              </View>

              <View style={styles.aboutAuthorBar}>
                <View style={styles.aboutAuthorLeft}>
                  <Ionicons
                    name="code-slash-outline"
                    size={14}
                    color={COLORS.primary}
                  />
                  <Text
                    allowFontScaling={false}
                    style={styles.aboutAuthorLabel}
                  >
                    Made by{" "}
                    <Text style={styles.aboutAuthorName}>{APP_AUTHOR}</Text>
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.aboutLicenseTag}>
                  {APP_LICENSE}
                </Text>
              </View>
            </View>

            {/* Open Source & Community */}
            <Text allowFontScaling={false} style={styles.aboutSectionLabel}>
              Open Source &amp; Community
            </Text>
            <View style={styles.aboutGroupCard}>
              <TouchableOpacity
                testID="about-github-row"
                accessibilityRole="button"
                accessibilityLabel="Open Source on GitHub"
                style={[
                  styles.aboutRow,
                  styles.aboutRowDivider,
                  styles.aboutRowGithubHighlight,
                ]}
                onPress={() => handleOpenLink(GITHUB_REPO_URL)}
                activeOpacity={0.75}
              >
                <View style={styles.aboutRowLeft}>
                  <View
                    style={[
                      styles.aboutRowIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.textPrimary, 0.1),
                        borderColor: addOpacity(COLORS.textPrimary, 0.25),
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-github"
                      size={20}
                      color={COLORS.textPrimary}
                    />
                  </View>
                  <View style={styles.aboutRowTextCol}>
                    <Text allowFontScaling={false} style={styles.aboutRowTitle}>
                      Open Source on GitHub
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutRowDescription}
                    >
                      {GITHUB_REPO} • Star, fork &amp; contribute
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              <View
                style={[styles.aboutFeedbackBlock, styles.aboutRowDivider]}
                testID="about-feedback-section"
              >
                <View style={styles.aboutRowLeft}>
                  <View
                    style={[
                      styles.aboutRowIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.amber, 0.14),
                        borderColor: addOpacity(COLORS.amber, 0.35),
                      },
                    ]}
                  >
                    <Ionicons
                      name="bug-outline"
                      size={18}
                      color={COLORS.amber}
                    />
                  </View>
                  <View style={styles.aboutRowTextCol}>
                    <Text allowFontScaling={false} style={styles.aboutRowTitle}>
                      Report a Bug or Suggest Feature
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutRowDescription}
                    >
                      Send an email directly or open a GitHub issue
                    </Text>
                  </View>
                </View>

                <View style={styles.aboutFeedbackActionsRow}>
                  <TouchableOpacity
                    testID="about-email-feedback-button"
                    accessibilityRole="button"
                    accessibilityLabel="Report a bug or suggest a feature via email"
                    style={[
                      styles.aboutFeedbackActionBtn,
                      styles.aboutFeedbackEmailBtn,
                    ]}
                    onPress={() =>
                      handleOpenLink(getFeedbackMailtoUrl(appVersion))
                    }
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={15}
                      color={COLORS.primary}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutFeedbackEmailText}
                    >
                      Email Developer
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    testID="about-issues-button"
                    accessibilityRole="button"
                    accessibilityLabel="Report a bug or suggest a feature on GitHub Issues"
                    style={[
                      styles.aboutFeedbackActionBtn,
                      styles.aboutFeedbackGithubBtn,
                    ]}
                    onPress={() => handleOpenLink(GITHUB_ISSUES_URL)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="logo-github"
                      size={15}
                      color={COLORS.textPrimary}
                    />
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutFeedbackGithubText}
                    >
                      GitHub Issues
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                testID="about-rate-row"
                accessibilityRole="button"
                accessibilityLabel="Rate Moluxis on Google Play"
                style={[styles.aboutRow, styles.aboutRowDivider]}
                onPress={handleRateApp}
                activeOpacity={0.75}
              >
                <View style={styles.aboutRowLeft}>
                  <View
                    style={[
                      styles.aboutRowIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.emerald, 0.14),
                        borderColor: addOpacity(COLORS.emerald, 0.35),
                      },
                    ]}
                  >
                    <Ionicons
                      name="logo-google-playstore"
                      size={18}
                      color={COLORS.emerald}
                    />
                  </View>
                  <View style={styles.aboutRowTextCol}>
                    <Text allowFontScaling={false} style={styles.aboutRowTitle}>
                      Rate on Google Play
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutRowDescription}
                    >
                      Support {APP_NAME} with a review
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>

              <TouchableOpacity
                testID="about-share-row"
                accessibilityRole="button"
                accessibilityLabel="Share Moluxis app"
                style={styles.aboutRow}
                onPress={handleShareApp}
                activeOpacity={0.75}
              >
                <View style={styles.aboutRowLeft}>
                  <View
                    style={[
                      styles.aboutRowIconBadge,
                      {
                        backgroundColor: addOpacity(COLORS.cyan, 0.14),
                        borderColor: addOpacity(COLORS.cyan, 0.35),
                      },
                    ]}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={18}
                      color={COLORS.cyan}
                    />
                  </View>
                  <View style={styles.aboutRowTextCol}>
                    <Text allowFontScaling={false} style={styles.aboutRowTitle}>
                      Share {APP_NAME}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={styles.aboutRowDescription}
                    >
                      Share with friends &amp; chemistry enthusiasts
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* App & Updates */}
            {(onOpenWhatsNew || onCheckForUpdates) && (
              <>
                <Text allowFontScaling={false} style={styles.aboutSectionLabel}>
                  App &amp; Releases
                </Text>
                <View style={styles.aboutGroupCard}>
                  {onOpenWhatsNew && (
                    <TouchableOpacity
                      testID="about-whats-new-row"
                      accessibilityRole="button"
                      accessibilityLabel="View What's New release highlights"
                      style={[
                        styles.aboutRow,
                        Boolean(onCheckForUpdates) && styles.aboutRowDivider,
                      ]}
                      onPress={handleWhatsNew}
                      activeOpacity={0.75}
                    >
                      <View style={styles.aboutRowLeft}>
                        <View
                          style={[
                            styles.aboutRowIconBadge,
                            {
                              backgroundColor: addOpacity(COLORS.purple, 0.14),
                              borderColor: addOpacity(COLORS.purple, 0.35),
                            },
                          ]}
                        >
                          <Ionicons
                            name="sparkles-outline"
                            size={18}
                            color={COLORS.purple}
                          />
                        </View>
                        <View style={styles.aboutRowTextCol}>
                          <Text
                            allowFontScaling={false}
                            style={styles.aboutRowTitle}
                          >
                            What&apos;s New in v{appVersion}
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={styles.aboutRowDescription}
                          >
                            View release highlights &amp; recent improvements
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  )}

                  {onCheckForUpdates && (
                    <TouchableOpacity
                      testID="about-check-updates-row"
                      accessibilityRole="button"
                      accessibilityLabel="Check for app updates"
                      style={styles.aboutRow}
                      onPress={handleCheckUpdates}
                      disabled={updateStatus === "checking"}
                      activeOpacity={0.75}
                    >
                      <View style={styles.aboutRowLeft}>
                        <View
                          style={[
                            styles.aboutRowIconBadge,
                            {
                              backgroundColor: addOpacity(COLORS.primary, 0.14),
                              borderColor: addOpacity(COLORS.primary, 0.35),
                            },
                          ]}
                        >
                          {updateStatus === "checking" ? (
                            <ActivityIndicator
                              size="small"
                              color={COLORS.primary}
                            />
                          ) : (
                            <Ionicons
                              name="refresh-outline"
                              size={18}
                              color={COLORS.primary}
                            />
                          )}
                        </View>
                        <View style={styles.aboutRowTextCol}>
                          <Text
                            allowFontScaling={false}
                            style={styles.aboutRowTitle}
                          >
                            Check for Updates
                          </Text>
                          <Text
                            allowFontScaling={false}
                            style={[
                              styles.aboutRowDescription,
                              updateStatus === "upToDate" &&
                                styles.aboutRowDescriptionSuccess,
                            ]}
                          >
                            {getUpdateDescription()}
                          </Text>
                        </View>
                      </View>
                      {updateStatus === "upToDate" ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={COLORS.emerald}
                        />
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={COLORS.textMuted}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* Powered By / Open Science Credits */}
            <Text allowFontScaling={false} style={styles.aboutSectionLabel}>
              Powered By Open Science
            </Text>
            <View style={styles.aboutGroupCard}>
              {DATA_SOURCES.map((source, index) => {
                const visual = DATA_SOURCE_VISUALS[source.id] || {
                  icon: "globe-outline" as const,
                  color: COLORS.primary,
                };
                const isLast = index === DATA_SOURCES.length - 1;
                return (
                  <TouchableOpacity
                    key={source.id}
                    testID={`about-source-${source.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${source.name} website`}
                    style={[styles.aboutRow, !isLast && styles.aboutRowDivider]}
                    onPress={() => handleOpenLink(source.url)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.aboutRowLeft}>
                      <View
                        style={[
                          styles.aboutRowIconBadge,
                          {
                            backgroundColor: addOpacity(visual.color, 0.14),
                            borderColor: addOpacity(visual.color, 0.35),
                          },
                        ]}
                      >
                        <Ionicons
                          name={visual.icon}
                          size={18}
                          color={visual.color}
                        />
                      </View>
                      <View style={styles.aboutRowTextCol}>
                        <Text
                          allowFontScaling={false}
                          style={styles.aboutRowTitle}
                        >
                          {source.name}
                        </Text>
                        <Text
                          allowFontScaling={false}
                          style={styles.aboutRowDescription}
                        >
                          {source.description}
                        </Text>
                      </View>
                    </View>
                    <Ionicons
                      name="open-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Legal & Contact */}
            <View style={styles.aboutLegalRow}>
              <TouchableOpacity
                testID="about-license-chip"
                accessibilityRole="button"
                accessibilityLabel="View Apache 2.0 License"
                style={styles.aboutLegalChip}
                onPress={() => handleOpenLink(GITHUB_LICENSE_URL)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="document-text-outline"
                  size={13}
                  color={COLORS.textSecondary}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.aboutLegalChipText}
                >
                  {APP_LICENSE}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="about-privacy-chip"
                accessibilityRole="button"
                accessibilityLabel="View Privacy Policy"
                style={styles.aboutLegalChip}
                onPress={() => handleOpenLink(PRIVACY_POLICY_URL)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color={COLORS.textSecondary}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.aboutLegalChipText}
                >
                  Privacy Policy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="about-contact-chip"
                accessibilityRole="button"
                accessibilityLabel="Contact developer by email"
                style={styles.aboutLegalChip}
                onPress={() => handleOpenLink(CONTACT_MAILTO_URL)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="mail-outline"
                  size={13}
                  color={COLORS.textSecondary}
                />
                <Text
                  allowFontScaling={false}
                  style={styles.aboutLegalChipText}
                >
                  Contact
                </Text>
              </TouchableOpacity>
            </View>

            {/* Colophon */}
            <View style={styles.aboutColophon}>
              <Text allowFontScaling={false} style={styles.aboutColophonText}>
                Crafted with
              </Text>
              <Ionicons name="heart" size={11} color={COLORS.rose} />
              <Text allowFontScaling={false} style={styles.aboutColophonText}>
                by {APP_AUTHOR}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    );
  },
);

AboutModal.displayName = "AboutModal";
