import { renderHook, act } from "@testing-library/react-native";
import { Alert, Keyboard } from "react-native";
import { useMoleculeSearch } from "../useMoleculeSearch";

// Mock React Native APIs
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe("useMoleculeSearch", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockFetch.mockReset();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    consoleSpy.mockRestore();
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useMoleculeSearch());

    expect(result.current.searchText).toBe("");
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.moleculeData).toBeNull();
  });

  describe("handleTextChange and fetchSuggestions", () => {
    it("should clear suggestions if text is less than 3 characters", async () => {
      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.handleTextChange("wa");
      });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.suggestions).toEqual([]);
    });

    it("should update search text and fetch suggestions when text is 3+ characters", async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          dictionary_terms: {
            compound: ["water", "water gas", "water vapor", "water"],
          },
        }),
      });

      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.handleTextChange("wat");
      });

      expect(result.current.searchText).toBe("wat");

      // Fast-forward timers for debounce
      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      // Allow async effects to settle
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/wat/json?limit=6"
      );
      // Verify duplicates are removed
      expect(result.current.suggestions).toEqual(["water", "water gas", "water vapor"]);
      expect(result.current.showSuggestions).toBe(true);
    });

    it("should handle autocomplete fetch error silently", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.handleTextChange("err");
      });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe("searchMolecule", () => {
    it("should handle empty search term", async () => {
      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("");
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should show alert when compound is not found", async () => {
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          // Empty or missing PC_Compounds
        }),
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("UnknownCompound");
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Not Found",
        "Could not find a molecule with that name."
      );
      expect(result.current.isLoading).toBe(false);
    });

    it("should show alert on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(Alert.alert).toHaveBeenCalledWith("Error", "Network error. Please try again.");
      expect(result.current.isLoading).toBe(false);
    });

    it("should alert when no 3D SDF data is available", async () => {
      // Mock search endpoint returning a valid CID
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
        }),
      });

      // Mock subsequent calls
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // props
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // ghs
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // synonyms
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // desc
      mockFetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue("short text") }); // sdf

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(Alert.alert).toHaveBeenCalledWith("No 3D Data", "No 3D structure available for this compound.");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.moleculeData).toBeNull();
    });

    it("should successfully fetch and parse full molecule data", async () => {
      // 1. Search response
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          PC_Compounds: [
            {
              id: { id: { cid: 962 } },
              props: [
                { urn: { label: "Molecular Formula" }, value: { sval: "H2O" } },
                { urn: { label: "Molecular Weight" }, value: { sval: "18.015" } },
                { urn: { name: "Hydrogen Bond Acceptor" }, value: { ival: 1 } },
                { urn: { name: "Hydrogen Bond Donor" }, value: { ival: 2 } },
                { urn: { name: "Rotatable Bond" }, value: { ival: 0 } },
                { urn: { label: "IUPAC Name", name: "Preferred" }, value: { sval: "oxidane" } },
                { urn: { label: "IUPAC Name", name: "Traditional" }, value: { sval: "water" } },
                { urn: { label: "Log P" }, value: { fval: -1.38 } },
                { urn: { name: "Polar Surface Area" }, value: { fval: 25.2 } },
              ],
            },
          ],
        }),
      });

      // 2. Props response (Physical Properties)
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          Record: {
            Section: [{
              Section: [{
                TOCHeading: "Experimental Properties",
                Section: [
                  { TOCHeading: "Boiling Point", Information: [{ Value: { StringWithMarkup: [{ String: "100 °C" }] } }] },
                  { TOCHeading: "Melting Point", Information: [{ Value: { StringWithMarkup: [{ String: "0 °C" }] } }] }
                ]
              }]
            }]
          }
        })
      });

      // 3. GHS response
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          Record: {
            Section: [{
              Section: [{
                Section: [{
                  Information: [
                    { Name: "Signal", Value: { StringWithMarkup: [{ String: "Warning" }] } },
                    { Name: "GHS Hazard Statements", Value: { StringWithMarkup: [{ String: "H302" }, { String: "H315" }] } }
                  ]
                }]
              }]
            }]
          }
        })
      });

      // 4. Synonyms response
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          InformationList: { Information: [{ Synonym: ["H2O", "oxidane", "water"] }] }
        })
      });

      // 5. Description response
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          InformationList: { Information: [{ Description: "A clear, colorless, odorless, and tasteless liquid." }] }
        })
      });

      // 6. SDF Structure response
      const mockSdf = "header\n".repeat(20) + "valid sdf string data > 50 chars to bypass validation";
      mockFetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue(mockSdf)
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(Keyboard.dismiss).toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.moleculeData).toEqual({
        name: "water",
        cid: "962",
        sdf: mockSdf,
        formula: "H2O",
        molecularWeight: "18.015 g/mol",
        synonyms: ["H2O", "oxidane", "water"],
        description: "A clear, colorless, odorless, and tasteless liquid.",
        properties: {
          hBondAcceptors: "1",
          hBondDonors: "2",
          rotatableBonds: "0",
          iupacName: "oxidane",
          commonName: "water",
          logP: "-1.38",
          tpsa: "25.2 Å²",
          boilingPoint: "100 °C",
          meltingPoint: "0 °C",
        },
        safety: {
          signal: ["Warning"],
          hazardStatements: ["H302", "H315"],
        },
      });
    });

    it("should handle partial failures in Promise.all gracefully", async () => {
       // Search response
       mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
        }),
      });

      // 2. Props response (Fails)
      mockFetch.mockRejectedValueOnce(new Error("Props error"));
      // 3. GHS response (Fails)
      mockFetch.mockRejectedValueOnce(new Error("GHS error"));
      // 4. Synonyms response (Fails)
      mockFetch.mockRejectedValueOnce(new Error("Synonyms error"));
      // 5. Description response (Fails)
      mockFetch.mockRejectedValueOnce(new Error("Desc error"));

      // 6. SDF Structure response (Succeeds)
      const mockSdf = "header\n".repeat(20) + "valid sdf string data > 50 chars to bypass validation";
      mockFetch.mockResolvedValueOnce({
        text: jest.fn().mockResolvedValue(mockSdf)
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("test");
      });

      // Should still succeed with missing optional data
      expect(result.current.moleculeData?.name).toBe("test");
      expect(result.current.moleculeData?.description).toBe("No description available.");
      expect(result.current.moleculeData?.synonyms).toEqual([]);
      expect(result.current.moleculeData?.properties).toEqual({});
      expect(result.current.moleculeData?.safety).toEqual({});
    });
  });

  describe("selectSuggestion", () => {
    it("should update text, hide suggestions, and trigger search", async () => {
      // Mock successful search
      mockFetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({
          PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
        }),
      });
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // props
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // ghs
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // synonyms
      mockFetch.mockResolvedValueOnce({ json: jest.fn().mockResolvedValue({}) }); // desc
      const mockSdf = "header\n".repeat(20) + "valid sdf string data > 50 chars to bypass validation";
      mockFetch.mockResolvedValueOnce({ text: jest.fn().mockResolvedValue(mockSdf) }); // sdf

      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.setShowSuggestions(true);
      });

      await act(async () => {
        await result.current.selectSuggestion("water");
      });

      expect(result.current.searchText).toBe("water");
      expect(result.current.showSuggestions).toBe(false);
      expect(result.current.moleculeData?.name).toBe("water");
    });
  });
});
