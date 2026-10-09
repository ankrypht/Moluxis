import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Alert } from "../CustomAlert";
import { HistoryBookmarksModal } from "../HistoryBookmarksModal";
import { getHistoryBookmarksModalStyles } from "../HistoryBookmarksModal.styles";
import { getScaleMetrics } from "../../utils/scaling";

jest.mock("@expo/vector-icons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    Ionicons: (props: any) => React.createElement(View, props),
  };
});

describe("HistoryBookmarksModal", () => {
  const metrics = getScaleMetrics(360, 736, {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const styles = getHistoryBookmarksModalStyles(metrics);

  const mockOnClose = jest.fn();
  const mockOnSelectCompound = jest.fn();
  const mockOnToggleBookmark = jest.fn();
  const mockOnRemoveHistoryItem = jest.fn();
  const mockOnRemoveBookmarkItem = jest.fn();
  const mockOnClearHistory = jest.fn();
  const mockOnClearBookmarks = jest.fn();
  const mockIsBookmarked = jest.fn(
    (name?: string | null) => name === "Aspirin",
  );

  const sampleHistory = [
    {
      name: "Caffeine",
      formula: "C8H10N4O2",
      cid: "2519",
      timestamp: Date.now() - 60000,
    },
    {
      name: "Aspirin",
      formula: "C9H8O4",
      cid: "2244",
      timestamp: Date.now() - 120000,
    },
  ];

  const sampleBookmarks = [
    {
      name: "Aspirin",
      formula: "C9H8O4",
      cid: "2244",
      timestamp: Date.now() - 120000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when visible is false", () => {
    const { queryByText } = render(
      <HistoryBookmarksModal
        visible={false}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );
    expect(queryByText("History")).toBeNull();
  });

  it("renders history tab by default and switches to bookmarks tab on tap", () => {
    const { getByTestId, getByText, queryByText } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    // Both history items should be visible
    expect(getByText("Caffeine")).toBeTruthy();
    expect(getByText("Aspirin")).toBeTruthy();

    // Switch to Bookmarks tab
    const bookmarksTab = getByTestId("tab-toggle-bookmarks");
    fireEvent.press(bookmarksTab);

    // Bookmarks list only has Aspirin
    expect(getByText("Aspirin")).toBeTruthy();
    expect(queryByText("Caffeine")).toBeNull();
  });

  it("selects compound with one tap and closes modal", () => {
    const { getByText } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    const caffeineRow = getByText("Caffeine");
    fireEvent.press(caffeineRow);

    expect(mockOnSelectCompound).toHaveBeenCalledWith("Caffeine");
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("toggles bookmark directly from row", () => {
    const { getByTestId } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    const bookmarkBtn = getByTestId("bookmark-toggle-caffeine");
    fireEvent.press(bookmarkBtn);

    expect(mockOnToggleBookmark).toHaveBeenCalledWith(sampleHistory[0]);
  });

  it("removes individual item from history", () => {
    const { getByTestId } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    const removeBtn = getByTestId("remove-item-caffeine");
    fireEvent.press(removeBtn);

    expect(mockOnRemoveHistoryItem).toHaveBeenCalledWith("Caffeine");
  });

  it("prompts before clearing all history", () => {
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    const clearBtn = getByTestId("clear-history-bookmarks-button");
    fireEvent.press(clearBtn);

    expect(alertSpy).toHaveBeenCalledWith(
      "Clear Search History?",
      expect.any(String),
      expect.any(Array),
    );

    // Call destructive handler
    const buttons = alertSpy.mock.calls[0][2] as any[];
    const destructiveButton = buttons.find((b) => b.style === "destructive");
    destructiveButton.onPress();

    expect(mockOnClearHistory).toHaveBeenCalled();
  });

  it("renders empty state when history is empty", () => {
    const { getByText } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={[]}
        bookmarks={[]}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    expect(getByText("No Recent Searches")).toBeTruthy();
  });

  it("closes modal on close button press", () => {
    const { getByTestId } = render(
      <HistoryBookmarksModal
        visible={true}
        onClose={mockOnClose}
        onSelectCompound={mockOnSelectCompound}
        history={sampleHistory}
        bookmarks={sampleBookmarks}
        onToggleBookmark={mockOnToggleBookmark}
        onRemoveHistoryItem={mockOnRemoveHistoryItem}
        onRemoveBookmarkItem={mockOnRemoveBookmarkItem}
        onClearHistory={mockOnClearHistory}
        onClearBookmarks={mockOnClearBookmarks}
        isBookmarked={mockIsBookmarked}
        styles={styles}
      />,
    );

    const closeBtn = getByTestId("close-history-modal");
    fireEvent.press(closeBtn);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
