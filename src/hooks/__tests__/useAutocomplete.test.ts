import { renderHook, act } from "@testing-library/react-native";
import { useAutocomplete } from "../useAutocomplete";
import { fetchAutocomplete } from "../../services/pubchem/api";

// Mock the API service
jest.mock("../../services/pubchem/api", () => ({
  fetchAutocomplete: jest.fn(),
}));

describe("useAutocomplete", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useAutocomplete());

    expect(result.current.searchText).toBe("");
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
  });

  describe("handleTextChange and fetchSuggestions", () => {
    it("should clear suggestions if text is less than 3 characters", async () => {
      const { result } = renderHook(() => useAutocomplete());

      act(() => {
        result.current.handleTextChange("wa");
      });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(fetchAutocomplete).not.toHaveBeenCalled();
      expect(result.current.suggestions).toEqual([]);
    });

    it("should update search text and fetch suggestions when text is 3+ characters", async () => {
      (fetchAutocomplete as jest.Mock).mockResolvedValueOnce([
        "water",
        "water gas",
        "water vapor",
      ]);

      const { result } = renderHook(() => useAutocomplete());

      act(() => {
        result.current.handleTextChange("wat");
      });

      expect(result.current.searchText).toBe("wat");

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(fetchAutocomplete).toHaveBeenCalledWith("wat");
      expect(result.current.suggestions).toEqual([
        "water",
        "water gas",
        "water vapor",
      ]);
      expect(result.current.showSuggestions).toBe(true);
    });

    it("should log error message when fetchAutocomplete throws an Error instance", async () => {
      const error = new Error("Network error");
      (fetchAutocomplete as jest.Mock).mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      try {
        const { result } = renderHook(() => useAutocomplete());

        act(() => {
          result.current.handleTextChange("err1");
        });

        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(consoleSpy).toHaveBeenCalledWith("Autocomplete error:", "Network error");
        expect(result.current.suggestions).toEqual([]);
      } finally {
        consoleSpy.mockRestore();
      }
    });

    it("should log raw error when fetchAutocomplete throws a non-Error object", async () => {
      const error = "Some string error";
      (fetchAutocomplete as jest.Mock).mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      try {
        const { result } = renderHook(() => useAutocomplete());

        // Set initial suggestions to verify they remain unchanged
        act(() => {
          result.current.setSuggestions(["previous"]);
        });

        act(() => {
          result.current.handleTextChange("err2");
        });

        await act(async () => {
          jest.advanceTimersByTime(300);
        });

        expect(consoleSpy).toHaveBeenCalledWith("Autocomplete error:", "Some string error");
        expect(result.current.suggestions).toEqual(["previous"]);
      } finally {
        consoleSpy.mockRestore();
      }
    });
  });
});
