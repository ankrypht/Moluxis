import { renderHook, act } from "@testing-library/react-native";
import { useCompoundHistoryAndBookmarks } from "../useCompoundHistoryAndBookmarks";
import * as compoundStorage from "../../services/storage/compoundStorage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe("useCompoundHistoryAndBookmarks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads history and bookmarks on mount", async () => {
    const mockHistory = [
      { name: "Caffeine", formula: "C8H10N4O2", timestamp: 1000 },
    ];
    const mockBookmarks = [
      { name: "Aspirin", formula: "C9H8O4", timestamp: 2000 },
    ];

    jest
      .spyOn(compoundStorage, "getRecentHistory")
      .mockResolvedValueOnce(mockHistory);
    jest
      .spyOn(compoundStorage, "getBookmarks")
      .mockResolvedValueOnce(mockBookmarks);

    const { result } = renderHook(() => useCompoundHistoryAndBookmarks());

    await act(async () => {
      // wait for effect
    });

    expect(result.current.history).toEqual(mockHistory);
    expect(result.current.bookmarks).toEqual(mockBookmarks);
    expect(result.current.isLoadingStorage).toBe(false);
    expect(result.current.isBookmarked("Aspirin")).toBe(true);
    expect(result.current.isBookmarked("aspirin")).toBe(true);
    expect(result.current.isBookmarked("Caffeine")).toBe(false);
  });

  it("adds history and updates state", async () => {
    jest.spyOn(compoundStorage, "getRecentHistory").mockResolvedValueOnce([]);
    jest.spyOn(compoundStorage, "getBookmarks").mockResolvedValueOnce([]);
    const updatedHistory = [{ name: "Water", formula: "H2O", timestamp: 3000 }];
    jest
      .spyOn(compoundStorage, "addRecentHistory")
      .mockResolvedValueOnce(updatedHistory);

    const { result } = renderHook(() => useCompoundHistoryAndBookmarks());

    await act(async () => {
      await result.current.addHistory({ name: "Water", formula: "H2O" });
    });

    expect(result.current.history).toEqual(updatedHistory);
  });

  it("toggles bookmark and updates state", async () => {
    jest.spyOn(compoundStorage, "getRecentHistory").mockResolvedValueOnce([]);
    jest.spyOn(compoundStorage, "getBookmarks").mockResolvedValueOnce([]);
    const bookmarkItem = { name: "Benzene", formula: "C6H6", timestamp: 4000 };
    jest.spyOn(compoundStorage, "toggleBookmark").mockResolvedValueOnce({
      bookmarks: [bookmarkItem],
      isBookmarked: true,
    });

    const { result } = renderHook(() => useCompoundHistoryAndBookmarks());

    let isSaved: boolean = false;
    await act(async () => {
      isSaved = await result.current.toggleBookmark({
        name: "Benzene",
        formula: "C6H6",
      });
    });

    expect(isSaved).toBe(true);
    expect(result.current.bookmarks).toEqual([bookmarkItem]);
    expect(result.current.isBookmarked("Benzene")).toBe(true);
  });

  it("clears history and bookmarks cleanly", async () => {
    jest
      .spyOn(compoundStorage, "getRecentHistory")
      .mockResolvedValueOnce([{ name: "Caffeine", timestamp: 100 }]);
    jest
      .spyOn(compoundStorage, "getBookmarks")
      .mockResolvedValueOnce([{ name: "Aspirin", timestamp: 200 }]);
    jest.spyOn(compoundStorage, "clearRecentHistory").mockResolvedValueOnce();
    jest.spyOn(compoundStorage, "clearBookmarks").mockResolvedValueOnce();

    const { result } = renderHook(() => useCompoundHistoryAndBookmarks());

    await act(async () => {
      await result.current.clearHistory();
    });
    expect(result.current.history).toEqual([]);

    await act(async () => {
      await result.current.clearBookmarks();
    });
    expect(result.current.bookmarks).toEqual([]);
  });
});
