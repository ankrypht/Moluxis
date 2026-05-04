import {
  fetchAutocomplete,
  fetchCompoundByName,
  fetchMoleculeDetails,
} from "../api";

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

describe("fetchCompoundByName", () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should fetch compound data by name on success", async () => {
    const mockData = {
      PC_Compounds: [{ id: { id: { cid: 123 } } }],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchCompoundByName("aspirin");

    expect(result).toEqual(mockData);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/aspirin/JSON",
    );
  });

  it("should handle fetch rejection (network error)", async () => {
    const error = new Error("Network error");
    mockFetch.mockRejectedValueOnce(error);

    await expect(fetchCompoundByName("aspirin")).rejects.toThrow(
      "Network error",
    );
  });

  it("should return error json if the API returns 404", async () => {
    const mockError = {
      Fault: {
        Code: "PUGREST.NotFound",
        Message: "No record found",
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockError,
    });

    const result = await fetchCompoundByName("nonexistent");
    expect(result).toEqual(mockError);
  });
});

describe("fetchMoleculeDetails", () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it("should fetch all molecule details on success", async () => {
    const cid = 123;
    const mockJson = { some: "data" };
    const mockSdf = "sdf contents";

    // fetchMoleculeDetails makes 7 initial calls
    // propsUrl, ghsUrl, synonymsUrl, descUrl, structure3dUrl, structure2dUrl, structuresViewUrl
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockJson,
      text: async () => mockSdf,
    });

    const result = await fetchMoleculeDetails(cid);

    expect(result.propsJson).toEqual(mockJson);
    expect(result.ghsJson).toEqual(mockJson);
    expect(result.sdfText3d).toBe(mockSdf);
    expect(result.sdfText2d).toBe(mockSdf);
    expect(mockFetch).toHaveBeenCalledTimes(7);
  });

  it("should handle partial fetch failures gracefully", async () => {
    const cid = 123;

    // Fail all except one to test robustness
    mockFetch.mockRejectedValue(new Error("Fail"));

    const result = await fetchMoleculeDetails(cid);

    expect(result.propsJson).toBeNull();
    expect(result.ghsJson).toBeNull();
    expect(result.sdfText3d).toBe("");
    expect(result.sdfText2d).toBe("");
    expect(result.synonymsJson).toEqual({});
  });

  it("should fallback to 2D SDF if 3D SDF is missing", async () => {
    const cid = 123;
    const mock2dSdf = "2d sdf contents";

    // 1. props
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // 2. ghs
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // 3. synonyms
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // 4. desc
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    // 5. structure3d (fails)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "PUGREST.NotFound",
    });
    // 6. structure2d (succeeds)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mock2dSdf,
    });
    // 7. structuresView
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const result = await fetchMoleculeDetails(cid);

    expect(result.sdfText3d).toBe("");
    expect(result.sdfText2d).toBe(mock2dSdf);
  });

  it("should fallback to CIF if 3D SDF is missing and COD ID is found", async () => {
    const cid = 123;
    const codId = "1000001";
    const mockCif = "cif contents";

    const structuresJson = {
      Record: {
        Section: [
          {
            TOCHeading: "Structures",
            Section: [
              {
                Name: "COD Number",
                Value: {
                  StringWithMarkup: [{ String: codId }],
                },
              },
            ],
          },
        ],
      },
    };

    // 1-4. basic info
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    // 5. structure3d (fails)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "PUGREST.NotFound",
    });
    // 6. structure2d (fails)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "PUGREST.NotFound",
    });
    // 7. structuresView (returns COD ID)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => structuresJson,
    });

    // 8. CIF fetch (triggered because codId found)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockCif,
    });

    const result = await fetchMoleculeDetails(cid);

    expect(result.sdfText3d).toBe("");
    expect(result.codId).toBe(codId);
    expect(result.cifText).toBe(mockCif);
    expect(result.useCif).toBe(true);
  });

  it("should NOT use CIF if 3D SDF is already available", async () => {
    const cid = 123;
    const codId = "1000001";
    const mockCif = "cif contents";
    const mockSdf3d = "A".repeat(201); // Valid SDF

    const structuresJson = {
      Record: {
        Section: [
          {
            TOCHeading: "Structures",
            Section: [
              {
                Name: "COD Number",
                Value: {
                  StringWithMarkup: [{ String: codId }],
                },
              },
            ],
          },
        ],
      },
    };

    // 1-4. basic info
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    // 5. structure3d (succeeds)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockSdf3d,
    });
    // 6. structure2d (fails)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => "PUGREST.NotFound",
    });
    // 7. structuresView (returns COD ID)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => structuresJson,
    });

    // 8. CIF fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => mockCif,
    });

    const result = await fetchMoleculeDetails(cid);

    expect(result.sdfText3d).toBe(mockSdf3d);
    expect(result.cifText).toBe(mockCif);
    expect(result.useCif).toBe(false);
  });

  it("should ignore SDF text if it is too short or contains PUGREST.NotFound", async () => {
    const cid = 123;

    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "Short text",
      json: async () => ({}),
    });

    const result = await fetchMoleculeDetails(cid);

    expect(result.sdfText3d).toBe("");
    expect(result.sdfText2d).toBe("");
  });
});
