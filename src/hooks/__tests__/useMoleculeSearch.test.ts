import { renderHook, act } from "@testing-library/react-native";
import { Alert, Keyboard } from "react-native";
import { useMoleculeSearch, clearMoleculeCache } from "../useMoleculeSearch";
import {
  fetchMoleculeDetails,
  fetchCompoundByName,
  fetchAutocomplete,
} from "../../services/pubchem/api";

// Mock React Native APIs using spyOn
jest.spyOn(Alert, "alert").mockImplementation(() => {});
jest.spyOn(Keyboard, "dismiss").mockImplementation(() => {});

// Mock the API service
jest.mock("../../services/pubchem/api", () => ({
  fetchAutocomplete: jest.fn(),
  fetchCompoundByName: jest.fn(),
  fetchMoleculeDetails: jest.fn(),
}));

// Mock useStoreReview
const mockIncrementSearchCountAndReview = jest.fn();
jest.mock("../useStoreReview", () => ({
  useStoreReview: () => ({
    incrementSearchCountAndReview: mockIncrementSearchCountAndReview,
  }),
}));

describe("useMoleculeSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    clearMoleculeCache();
  });

  afterEach(() => {
    jest.useRealTimers();
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

      expect(fetchAutocomplete).not.toHaveBeenCalled();
      expect(result.current.suggestions).toEqual([]);
    });

    it("should update search text and fetch suggestions when text is 3+ characters", async () => {
      (fetchAutocomplete as jest.Mock).mockResolvedValueOnce([
        "water",
        "water gas",
        "water vapor",
      ]);

      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.handleTextChange("wat");
      });

      expect(result.current.searchText).toBe("wat");

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      expect(fetchAutocomplete).toHaveBeenCalledWith(
        "wat",
        expect.any(AbortSignal),
      );
      expect(result.current.suggestions).toEqual([
        "water",
        "water gas",
        "water vapor",
      ]);
      expect(result.current.showSuggestions).toBe(true);
    });
  });

  describe("searchMolecule", () => {
    it("should show alert when compound is not found", async () => {
      // Suppress console.error in this test as we expect an error to be caught and logged
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [],
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("UnknownCompound");
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Not Found",
        "Could not find a molecule with that name.",
      );

      consoleSpy.mockRestore();
    });

    it("should alert when no structure data is available", async () => {
      // Suppress console.error in this test as we expect an error to be caught and logged
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
      });

      (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
        sdfText3d: "",
        sdfText2d: "",
        cifText: "",
        useCif: false,
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "No Structure Data",
        "No structure available for this compound.",
      );

      consoleSpy.mockRestore();
    });

    it("should successfully fetch and parse full molecule data", async () => {
      const mockSdf = "header\n".repeat(20) + "valid sdf data";

      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [
          {
            id: { id: { cid: 962 } },
            props: [
              { urn: { label: "Molecular Formula" }, value: { sval: "H2O" } },
              { urn: { label: "Molecular Weight" }, value: { sval: "18.015" } },
            ],
          },
        ],
      });

      (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
        propsJson: null,
        ghsJson: null,
        synonymsJson: {
          InformationList: { Information: [{ Synonym: ["H2O"] }] },
        },
        descJson: {
          InformationList: {
            Information: [{ Description: "Water description" }],
          },
        },
        sdfText3d: mockSdf,
        sdfText2d: "2d sdf data",
        cifText: "",
        codId: null,
        useCif: false,
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(result.current.moleculeData).toMatchObject({
        name: "water",
        cid: "962",
        sdf3d: mockSdf,
        sdf2d: "2d sdf data",
        useCif: false,
        formula: "H2O",
      });

      expect(mockIncrementSearchCountAndReview).toHaveBeenCalled();
    });

    it("should serve repeat searches from moleculeCache without re-fetching from API", async () => {
      const mockSdf = "header\n".repeat(20) + "valid sdf data";

      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [
          {
            id: { id: { cid: 962 } },
            props: [
              { urn: { label: "Molecular Formula" }, value: { sval: "H2O" } },
              { urn: { label: "Molecular Weight" }, value: { sval: "18.015" } },
            ],
          },
        ],
      });

      (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
        propsJson: null,
        ghsJson: null,
        synonymsJson: null,
        descJson: null,
        sdfText3d: mockSdf,
        sdfText2d: "2d sdf",
        cifText: "",
        codId: null,
        useCif: false,
      });

      const { result } = renderHook(() => useMoleculeSearch());

      // First search fetches from API
      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(fetchCompoundByName).toHaveBeenCalledTimes(1);
      expect(result.current.moleculeData?.name).toBe("water");
      expect(result.current.isLoading).toBe(false);

      // Reset mock increment counter to verify second call triggers it
      mockIncrementSearchCountAndReview.mockClear();

      // Second search for same molecule (case-insensitive) should hit cache
      await act(async () => {
        await result.current.searchMolecule("WATER");
      });

      // API was NOT called again
      expect(fetchCompoundByName).toHaveBeenCalledTimes(1);
      expect(result.current.moleculeData?.name).toBe("water");
      expect(result.current.isLoading).toBe(false);
      // Review interaction counter is still counted on cache hits
      expect(mockIncrementSearchCountAndReview).toHaveBeenCalledTimes(1);
    });

    it("should prevent race conditions by discarding out-of-order stale network responses", async () => {
      let resolveFirst: (val: any) => void = () => {};
      const slowPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      // Search 1: slow search
      (fetchCompoundByName as jest.Mock).mockReturnValueOnce(slowPromise);

      // Search 2: fast search
      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [
          {
            id: { id: { cid: 2244 } },
            props: [
              {
                urn: { label: "Molecular Formula" },
                value: { sval: "C9H8O4" },
              },
            ],
          },
        ],
      });
      (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
        propsJson: null,
        ghsJson: null,
        synonymsJson: null,
        descJson: null,
        sdfText3d: "aspirin 3d sdf",
        sdfText2d: "aspirin 2d sdf",
        cifText: "",
        codId: null,
        useCif: false,
      });

      const { result } = renderHook(() => useMoleculeSearch());

      // Initiate slow search 1
      act(() => {
        result.current.searchMolecule("slow_compound");
      });

      expect(result.current.isLoading).toBe(true);

      // Initiate fast search 2 while search 1 is still in flight
      await act(async () => {
        await result.current.searchMolecule("aspirin");
      });

      // Search 2 should be displayed
      expect(result.current.moleculeData?.name).toBe("aspirin");

      // Now slow search 1 resolves late
      await act(async () => {
        resolveFirst({
          PC_Compounds: [
            {
              id: { id: { cid: 9999 } },
              props: [],
            },
          ],
        });
      });

      // Result should STILL be aspirin, NOT overwritten by slow_compound
      expect(result.current.moleculeData?.name).toBe("aspirin");
    });

    it("should clear search text, suggestions, and molecule data when clearMolecule is called", async () => {
      const { result } = renderHook(() => useMoleculeSearch());

      act(() => {
        result.current.handleTextChange("caffeine");
      });

      act(() => {
        result.current.clearMolecule();
      });

      expect(Keyboard.dismiss).toHaveBeenCalled();
      expect(result.current.searchText).toBe("");
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.moleculeData).toBeNull();
    });
  });
});
