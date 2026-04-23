import { fetchAutocomplete } from "../api";

describe("fetchAutocomplete", () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should return a unique list of compound names on success", async () => {
    const mockData = {
      dictionary_terms: {
        compound: ["water", "water gas", "water", "water vapor"],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchAutocomplete("water");

    expect(result).toEqual(["water", "water gas", "water vapor"]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/water/json?limit=6",
    );
  });

  it("should return an empty array if dictionary_terms are missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const result = await fetchAutocomplete("test");

    expect(result).toEqual([]);
  });

  it("should return an empty array and log error on failure", async () => {
    const error = new Error("Network error");
    mockFetch.mockRejectedValueOnce(error);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      const result = await fetchAutocomplete("test");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Autocomplete fetch failed:",
        "Network error",
      );
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
