import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useMoleculeSearch } from "../useMoleculeSearch";

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

describe("useMoleculeSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({}),
      text: async () => "",
    });
  });

  it("should clear suggestions and not fetch when input length is less than 3", async () => {
    const { result } = renderHook(() => useMoleculeSearch());

    await act(async () => {
      result.current.handleTextChange("ab");
    });

    expect(result.current.searchText).toBe("ab");
    expect(result.current.suggestions).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should fetch suggestions when input length is 3 or more", async () => {
    const mockSuggestions = ["aspirin", "aspirin complex"];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        dictionary_terms: {
          compound: mockSuggestions,
        },
      }),
    });

    const { result } = renderHook(() => useMoleculeSearch());

    await act(async () => {
      result.current.handleTextChange("asp");
    });

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("autocomplete/compound/asp"),
    );
  });
});
