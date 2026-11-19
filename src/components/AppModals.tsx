import React from "react";
import { EdgeInsets } from "react-native-safe-area-context";
import { MoleculeInfo, SavedCompoundItem } from "../types";
import { AppReleaseInfo } from "../constants/distributions";
import { ReleaseHighlight } from "../services/updates/updateNoticeService";
import { IS_DEV_TEST_ENABLED } from "../hooks/useNotificationsAndUpdates";
import { HistoryBookmarksModal } from "./HistoryBookmarksModal";
import { ShareExportModal } from "./ShareExportModal";
import { AboutModal } from "./AboutModal";
import { UpdateAvailableModal } from "./UpdateAvailableModal";
import { WhatsNewModal } from "./WhatsNewModal";
import { DevTestModal } from "./DevTestModal";
import { CustomAlertModal } from "./CustomAlert";

import { HistoryBookmarksModalStyles } from "./HistoryBookmarksModal.styles";
import { ShareExportModalStyles } from "./ShareExportModal.styles";
import { AboutModalStyles } from "./AboutModal.styles";
import { UpdateAvailableModalStyles } from "./UpdateAvailableModal.styles";
import { WhatsNewModalStyles } from "./WhatsNewModal.styles";
import { DevTestModalStyles } from "./DevTestModal.styles";
import { CustomAlertStyles } from "./CustomAlert.styles";

export type AppModalsStyles = HistoryBookmarksModalStyles &
  ShareExportModalStyles &
  AboutModalStyles &
  UpdateAvailableModalStyles &
  WhatsNewModalStyles &
  DevTestModalStyles &
  CustomAlertStyles;

export interface AppModalsProps {
  styles: AppModalsStyles;
  insets: EdgeInsets;
  height: number;
  isLandscape: boolean;

  // History & Bookmarks
  showHistoryModal: boolean;
  historyModalTab: "history" | "bookmarks";
  onCloseHistoryModal: () => void;
  onSelectCompound: (item: string) => void;
  history: SavedCompoundItem[];
  bookmarks: SavedCompoundItem[];
  onToggleBookmark: (item: SavedCompoundItem) => void;
  onRemoveHistoryItem: (name: string) => void;
  onRemoveBookmarkItem: (name: string) => void;
  onClearHistory: () => void;
  onClearBookmarks: () => void;
  isBookmarked: (name?: string | null) => boolean;

  // Share & Export
  showShareModal: boolean;
  onCloseShareModal: () => void;
  moleculeData: MoleculeInfo | null;
  snapshotUri: string | null;
  isCapturingSnapshot: boolean;
  onRefreshSnapshot: () => void;

  // About
  showAboutModal: boolean;
  onCloseAboutModal: () => void;
  onOpenWhatsNew: () => void;
  onCheckForUpdates?: () => Promise<AppReleaseInfo | null>;

  // In-App Updates & What's New
  showUpdateModal: boolean;
  releaseInfo: AppReleaseInfo | null;
  dismissUpdateModal: () => void;
  showWhatsNewModal: boolean;
  whatsNewNotes: ReleaseHighlight | null;
  dismissWhatsNewModal: () => void;

  // Dev Test Lab
  showDevTestModal: boolean;
  onCloseDevTestModal: () => void;
  openPreviewUpdateModal: () => void;
  openPreviewWhatsNewModal: (notes: ReleaseHighlight) => void;
  runLiveUpdateCheck: () => Promise<AppReleaseInfo | null>;
  refreshVersionNotice: () => Promise<{ shouldShowModal: boolean }>;
}

export const AppModals: React.FC<AppModalsProps> = React.memo(
  function AppModals({
    styles,
    insets,
    height,
    isLandscape,
    showHistoryModal,
    historyModalTab,
    onCloseHistoryModal,
    onSelectCompound,
    history,
    bookmarks,
    onToggleBookmark,
    onRemoveHistoryItem,
    onRemoveBookmarkItem,
    onClearHistory,
    onClearBookmarks,
    isBookmarked,
    showShareModal,
    onCloseShareModal,
    moleculeData,
    snapshotUri,
    isCapturingSnapshot,
    onRefreshSnapshot,
    showAboutModal,
    onCloseAboutModal,
    onOpenWhatsNew,
    onCheckForUpdates,
    showUpdateModal,
    releaseInfo,
    dismissUpdateModal,
    showWhatsNewModal,
    whatsNewNotes,
    dismissWhatsNewModal,
    showDevTestModal,
    onCloseDevTestModal,
    openPreviewUpdateModal,
    openPreviewWhatsNewModal,
    runLiveUpdateCheck,
    refreshVersionNotice,
  }) {
    return (
      <>
        {/* RECENT SEARCHES & FAVORITES MODAL */}
        {showHistoryModal && (
          <HistoryBookmarksModal
            visible={showHistoryModal}
            onClose={onCloseHistoryModal}
            onSelectCompound={onSelectCompound}
            history={history}
            bookmarks={bookmarks}
            onToggleBookmark={onToggleBookmark}
            onRemoveHistoryItem={onRemoveHistoryItem}
            onRemoveBookmarkItem={onRemoveBookmarkItem}
            onClearHistory={onClearHistory}
            onClearBookmarks={onClearBookmarks}
            isBookmarked={isBookmarked}
            initialTab={historyModalTab}
            styles={styles}
            isLandscape={isLandscape}
            height={height}
          />
        )}

        {/* SHARE & EXPORT MODAL */}
        {showShareModal && (
          <ShareExportModal
            visible={showShareModal}
            onClose={onCloseShareModal}
            moleculeData={moleculeData}
            snapshotUri={snapshotUri}
            isCapturingSnapshot={isCapturingSnapshot}
            onRefreshSnapshot={onRefreshSnapshot}
            styles={styles}
            isLandscape={isLandscape}
            height={height}
          />
        )}

        {/* ABOUT MOLUXIS MODAL */}
        {showAboutModal && (
          <AboutModal
            visible={showAboutModal}
            onClose={onCloseAboutModal}
            onOpenWhatsNew={onOpenWhatsNew}
            onCheckForUpdates={onCheckForUpdates}
            styles={styles}
            isLandscape={isLandscape}
            height={height}
          />
        )}

        {/* IN-APP UPDATE AVAILABLE MODAL */}
        {showUpdateModal && Boolean(releaseInfo) && (
          <UpdateAvailableModal
            visible={showUpdateModal}
            releaseInfo={releaseInfo}
            onDismiss={dismissUpdateModal}
            styles={styles}
          />
        )}

        {/* POST-UPDATE WHAT'S NEW MODAL */}
        {showWhatsNewModal && (
          <WhatsNewModal
            visible={showWhatsNewModal}
            releaseNotes={whatsNewNotes}
            onClose={dismissWhatsNewModal}
            styles={styles}
          />
        )}

        {/* DEV-ONLY NOTIFICATIONS & UPDATES TEST LAB */}
        {IS_DEV_TEST_ENABLED && showDevTestModal && (
          <DevTestModal
            visible={showDevTestModal}
            onClose={onCloseDevTestModal}
            styles={styles}
            bookmarks={bookmarks}
            onPreviewUpdateModal={openPreviewUpdateModal}
            onPreviewWhatsNewModal={openPreviewWhatsNewModal}
            onRunLiveUpdateCheck={runLiveUpdateCheck}
            onRefreshVersionNotice={refreshVersionNotice}
          />
        )}

        {/* THEMED CUSTOM ALERT POPUP */}
        <CustomAlertModal styles={styles} insets={insets} />
      </>
    );
  },
);
