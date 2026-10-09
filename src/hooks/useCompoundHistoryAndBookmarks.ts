import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SavedCompoundItem } from "../types";
import {
  getRecentHistory,
  addRecentHistory,
  removeRecentHistory,
  clearRecentHistory,
  getBookmarks,
  removeBookmark,
  toggleBookmark,
  clearBookmarks,
} from "../services/storage/compoundStorage";
import { setMoleculePinned } from "../services/storage/moleculeDiskCache";

export interface UseCompoundHistoryAndBookmarksReturn {
  history: SavedCompoundItem[];
  bookmarks: SavedCompoundItem[];
  isLoadingStorage: boolean;
  addHistory: (
    item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
  ) => Promise<void>;
  removeHistory: (name: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  toggleBookmark: (
    item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
  ) => Promise<boolean>;
  removeBookmark: (name: string) => Promise<void>;
  clearBookmarks: () => Promise<void>;
  isBookmarked: (name?: string | null) => boolean;
  refresh: () => Promise<void>;
}

export const useCompoundHistoryAndBookmarks =
  (): UseCompoundHistoryAndBookmarksReturn => {
    const [history, setHistory] = useState<SavedCompoundItem[]>([]);
    const [bookmarks, setBookmarks] = useState<SavedCompoundItem[]>([]);
    const [isLoadingStorage, setIsLoadingStorage] = useState(true);
    const mutationVersionRef = useRef(0);

    const refresh = useCallback(async () => {
      const currentVersion = ++mutationVersionRef.current;
      try {
        const [savedHistory, savedBookmarks] = await Promise.all([
          getRecentHistory(),
          getBookmarks(),
        ]);
        if (currentVersion === mutationVersionRef.current) {
          setHistory(savedHistory);
          setBookmarks(savedBookmarks);
        }
      } catch (error) {
        console.warn("Error refreshing history and bookmarks:", error);
      } finally {
        if (currentVersion === mutationVersionRef.current) {
          setIsLoadingStorage(false);
        }
      }
    }, []);

    useEffect(() => {
      let isMounted = true;
      const currentVersion = mutationVersionRef.current;
      const load = async () => {
        try {
          const [savedHistory, savedBookmarks] = await Promise.all([
            getRecentHistory(),
            getBookmarks(),
          ]);
          if (isMounted && currentVersion === mutationVersionRef.current) {
            setHistory(savedHistory);
            setBookmarks(savedBookmarks);
            setIsLoadingStorage(false);
          }
        } catch (error) {
          console.warn("Error refreshing history and bookmarks:", error);
          if (isMounted && currentVersion === mutationVersionRef.current) {
            setIsLoadingStorage(false);
          }
        }
      };
      load();
      return () => {
        isMounted = false;
      };
    }, []);

    const handleAddHistory = useCallback(
      async (
        item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
      ) => {
        if (!item.name || !item.name.trim()) return;
        mutationVersionRef.current++;
        try {
          const updated = await addRecentHistory(item);
          setHistory(updated);
        } catch (error) {
          console.warn("Failed to add to history:", error);
        }
      },
      [],
    );

    const handleRemoveHistory = useCallback(async (name: string) => {
      mutationVersionRef.current++;
      try {
        const updated = await removeRecentHistory(name);
        setHistory(updated);
      } catch (error) {
        console.warn("Failed to remove history item:", error);
      }
    }, []);

    const handleClearHistory = useCallback(async () => {
      mutationVersionRef.current++;
      try {
        await clearRecentHistory();
        setHistory([]);
      } catch (error) {
        console.warn("Failed to clear history:", error);
      }
    }, []);

    const handleToggleBookmark = useCallback(
      async (
        item: Omit<SavedCompoundItem, "timestamp"> & { timestamp?: number },
      ): Promise<boolean> => {
        if (!item.name || !item.name.trim()) return false;
        mutationVersionRef.current++;
        try {
          const result = await toggleBookmark(item);
          setBookmarks(result.bookmarks);
          setMoleculePinned(item.name, result.isBookmarked).catch(() => {});
          return result.isBookmarked;
        } catch (error) {
          console.warn("Failed to toggle bookmark:", error);
          return false;
        }
      },
      [],
    );

    const handleRemoveBookmark = useCallback(async (name: string) => {
      mutationVersionRef.current++;
      try {
        const updated = await removeBookmark(name);
        setBookmarks(updated);
        setMoleculePinned(name, false).catch(() => {});
      } catch (error) {
        console.warn("Failed to remove bookmark:", error);
      }
    }, []);

    const handleClearBookmarks = useCallback(async () => {
      mutationVersionRef.current++;
      try {
        await clearBookmarks();
        setBookmarks([]);
      } catch (error) {
        console.warn("Failed to clear bookmarks:", error);
      }
    }, []);

    const bookmarkedNamesSet = useMemo(() => {
      const set = new Set<string>();
      for (const item of bookmarks) {
        set.add(item.name.trim().toLowerCase());
      }
      return set;
    }, [bookmarks]);

    const isBookmarked = useCallback(
      (name?: string | null): boolean => {
        if (!name || !name.trim()) return false;
        return bookmarkedNamesSet.has(name.trim().toLowerCase());
      },
      [bookmarkedNamesSet],
    );

    return {
      history,
      bookmarks,
      isLoadingStorage,
      addHistory: handleAddHistory,
      removeHistory: handleRemoveHistory,
      clearHistory: handleClearHistory,
      toggleBookmark: handleToggleBookmark,
      removeBookmark: handleRemoveBookmark,
      clearBookmarks: handleClearBookmarks,
      isBookmarked,
      refresh,
    };
  };
