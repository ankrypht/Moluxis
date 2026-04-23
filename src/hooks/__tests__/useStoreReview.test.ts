import { renderHook, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as StoreReview from "expo-store-review";
import { useStoreReview } from "../useStoreReview";

// Mock dependencies
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock("expo-store-review", () => ({
  isAvailableAsync: jest.fn(),
  hasAction: jest.fn(),
  requestReview: jest.fn(),
}));

describe("useStoreReview", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (StoreReview.hasAction as jest.Mock).mockResolvedValue(true);
  });

  it("should increment count but NOT request review when below threshold", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("0");

    const { result } = renderHook(() => useStoreReview());

    await act(async () => {
      await result.current.incrementSearchCountAndReview();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@moluxis_search_count",
      "1",
    );
    expect(StoreReview.requestReview).not.toHaveBeenCalled();
  });

  it("should increment count and request review when reaching first threshold (3)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("2");

    const { result } = renderHook(() => useStoreReview());

    await act(async () => {
      await result.current.incrementSearchCountAndReview();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@moluxis_search_count",
      "3",
    );
    expect(StoreReview.requestReview).toHaveBeenCalled();
  });

  it("should NOT request review if StoreReview is not available", async () => {
    (StoreReview.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("2");

    const { result } = renderHook(() => useStoreReview());

    await act(async () => {
      await result.current.incrementSearchCountAndReview();
    });

    expect(StoreReview.requestReview).not.toHaveBeenCalled();
  });

  it("should increment count and request review when reaching second threshold (10)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("9");

    const { result } = renderHook(() => useStoreReview());

    await act(async () => {
      await result.current.incrementSearchCountAndReview();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@moluxis_search_count",
      "10",
    );
    expect(StoreReview.requestReview).toHaveBeenCalled();
  });

  it("should handle error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error("Storage Error"),
    );

    const { result } = renderHook(() => useStoreReview());

    await act(async () => {
      await result.current.incrementSearchCountAndReview();
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
