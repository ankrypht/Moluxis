import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getRecentHistory,
  addRecentHistory,
  removeRecentHistory,
  clearRecentHistory,
  flushRecentHistory,
  _resetCompoundStorageForTests,
  getBookmarks,
  removeBookmark,
  toggleBookmark,
  clearBookmarks,
  HISTORY_STORAGE_KEY,
  BOOKMARKS_STORAGE_KEY,
  MAX_HISTORY_ITEMS,
} from "../compoundStorage";

const mockStorageMap = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key: string) => mockStorageMap.get(key) ?? null),
  setItem: jest.fn(async (key: string, value: string) => {
    mockStorageMap.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockStorageMap.delete(key);
  }),
  clear: jest.fn(async () => {
    mockStorageMap.clear();
  }),
}));

describe("compoundStorage", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    mockStorageMap.clear();
    _resetCompoundStorageForTests();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(async () => {
    await flushRecentHistory();
    _resetCompoundStorageForTests();
  });

  describe("Recent History", () => {
    it("returns empty array when history is empty or invalid", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const items = await getRecentHistory();
      expect(items).toEqual([]);

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("invalid-json");
      const invalidItems = await getRecentHistory();
      expect(invalidItems).toEqual([]);
    });

    it("adds an item to history, places it at the front, and debounces disk write", async () => {
      const updated = await addRecentHistory({
        name: "Caffeine",
        formula: "C8H10N4O2",
        cid: "2519",
      });

      expect(updated).toHaveLength(1);
      expect(updated[0].name).toBe("Caffeine");
      expect(updated[0].formula).toBe("C8H10N4O2");
      expect(typeof updated[0].timestamp).toBe("number");

      // Disk write is debounced; not immediately written
      expect(AsyncStorage.setItem).not.toHaveBeenCalledWith(
        HISTORY_STORAGE_KEY,
        expect.any(String),
      );

      // Explicit flush commits it to disk
      await flushRecentHistory();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        HISTORY_STORAGE_KEY,
        expect.any(String),
      );
    });

    it("bypasses AsyncStorage.getItem when inMemoryHistory is provided to addRecentHistory", async () => {
      const existingHistory = [
        { name: "Existing1", timestamp: Date.now() },
        { name: "Existing2", timestamp: Date.now() },
      ];

      (AsyncStorage.getItem as jest.Mock).mockClear();

      const updated = await addRecentHistory(
        { name: "NewItem" },
        existingHistory,
      );

      expect(updated).toHaveLength(3);
      expect(updated[0].name).toBe("NewItem");
      expect(updated[1].name).toBe("Existing1");
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it("deduplicates case-insensitively and moves recent item to front", async () => {
      await addRecentHistory({ name: "Caffeine", formula: "C8H10N4O2" });
      await addRecentHistory({ name: "Aspirin", formula: "C9H8O4" });
      const updated = await addRecentHistory({ name: "caffeine" });

      expect(updated).toHaveLength(2);
      expect(updated[0].name).toBe("caffeine");
      expect(updated[0].formula).toBe("C8H10N4O2"); // preserves existing formula
      expect(updated[1].name).toBe("Aspirin");
    });

    it("ignores empty or whitespace-only names", async () => {
      const res1 = await addRecentHistory({ name: "" });
      const res2 = await addRecentHistory({ name: "   " });
      expect(res1).toEqual([]);
      expect(res2).toEqual([]);
    });

    it("caps history at MAX_HISTORY_ITEMS", async () => {
      for (let i = 0; i < MAX_HISTORY_ITEMS + 5; i++) {
        await addRecentHistory({ name: `Compound ${i}` });
      }

      const history = await getRecentHistory();
      expect(history.length).toBe(MAX_HISTORY_ITEMS);
      expect(history[0].name).toBe(`Compound ${MAX_HISTORY_ITEMS + 4}`);
    });

    it("removes a specific item from history", async () => {
      await addRecentHistory({ name: "Water" });
      await addRecentHistory({ name: "Ethanol" });

      const updated = await removeRecentHistory("water");
      expect(updated).toHaveLength(1);
      expect(updated[0].name).toBe("Ethanol");
    });

    it("clears all history", async () => {
      await addRecentHistory({ name: "Benzene" });
      await clearRecentHistory();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(HISTORY_STORAGE_KEY);
      const history = await getRecentHistory();
      expect(history).toEqual([]);
    });

    it("filters out malformed or corrupted items in storage array", async () => {
      mockStorageMap.set(
        HISTORY_STORAGE_KEY,
        JSON.stringify([
          null,
          123,
          "invalid",
          { bad: "data" },
          { name: "" },
          { name: "   " },
          { name: "Methanol", formula: "CH4O" },
        ]),
      );
      const items = await getRecentHistory();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("Methanol");
    });

    it("deduplicates case-insensitively when reading from storage", async () => {
      mockStorageMap.set(
        HISTORY_STORAGE_KEY,
        JSON.stringify([
          { name: "Ibuprofen", cid: "5761" },
          { name: "ibuprofen", cid: "5761" },
          { name: "Aspirin", cid: "2244" },
        ]),
      );
      const items = await getRecentHistory();
      expect(items).toHaveLength(2);
      expect(items[0].name).toBe("Ibuprofen");
      expect(items[1].name).toBe("Aspirin");
    });

    it("preserves existing items when AsyncStorage.setItem fails during remove", async () => {
      await addRecentHistory({ name: "Caffeine" });
      await flushRecentHistory();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error("Disk full"),
      );
      const res = await removeRecentHistory("Caffeine");
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe("Caffeine");
    });

    it("safely handles empty or whitespace names in remove", async () => {
      await addRecentHistory({ name: "Ethanol" });
      await flushRecentHistory();
      const res = await removeRecentHistory("   ");
      expect(res).toHaveLength(1);
      expect(res[0].name).toBe("Ethanol");
    });
  });

  describe("Bookmarks", () => {
    it("returns empty array when bookmarks are empty or invalid", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const items = await getBookmarks();
      expect(items).toEqual([]);
    });

    it("removes a bookmark", async () => {
      await toggleBookmark({ name: "Dopamine" });
      await toggleBookmark({ name: "Serotonin" });

      const remaining = await removeBookmark("dopamine");
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe("Serotonin");
    });

    it("safely handles empty or whitespace names in removeBookmark", async () => {
      await toggleBookmark({ name: "Dopamine" });
      const remaining = await removeBookmark("   ");
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe("Dopamine");
    });

    it("toggles bookmark state (adds then removes)", async () => {
      const toggle1 = await toggleBookmark({ name: "Adrenaline" });
      expect(toggle1.isBookmarked).toBe(true);
      expect(toggle1.bookmarks).toHaveLength(1);

      const toggle2 = await toggleBookmark({ name: "adrenaline" });
      expect(toggle2.isBookmarked).toBe(false);
      expect(toggle2.bookmarks).toHaveLength(0);
    });

    it("clears all bookmarks", async () => {
      await toggleBookmark({ name: "Methane" });
      await clearBookmarks();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        BOOKMARKS_STORAGE_KEY,
      );
      const bookmarks = await getBookmarks();
      expect(bookmarks).toEqual([]);
    });

    it("filters out malformed items and preserves state on write failure", async () => {
      mockStorageMap.set(
        BOOKMARKS_STORAGE_KEY,
        JSON.stringify([null, { name: "Aspirin" }, { other: 123 }]),
      );
      const bookmarks = await getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].name).toBe("Aspirin");

      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error("Write error"),
      );
      const res = await toggleBookmark({ name: "Caffeine" });
      expect(res.bookmarks).toHaveLength(1);
      expect(res.bookmarks[0].name).toBe("Aspirin");
      expect(res.isBookmarked).toBe(false);
    });
  });
});
