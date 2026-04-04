import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useMoleculeSearch } from "../useMoleculeSearch";
import {
  fetchMoleculeDetails,
  fetchCompoundByName,
  fetchAutocomplete,
} from "../../services/pubchem/api";

// Mock React Native APIs
jest.mock("react-native", () => ({
  Alert: {
    alert: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
}));

// Mock the API service
jest.mock("../../services/pubchem/api", () => ({
  fetchAutocomplete: jest.fn(),
  fetchCompoundByName: jest.fn(),
  fetchMoleculeDetails: jest.fn(),
}));

describe("useMoleculeSearch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
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

      expect(fetchAutocomplete).toHaveBeenCalledWith("wat");
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
    });

    it("should alert when no structure data is available", async () => {
      (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
        PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
      });

      (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
        sdfText: "",
        cifText: "",
        structureFormat: "2d_sdf",
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "No Structure Data",
        "No structure available for this compound.",
      );
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
        sdfText: mockSdf,
        cifText: "",
        codId: null,
        structureFormat: "3d_sdf",
      });

      const { result } = renderHook(() => useMoleculeSearch());

      await act(async () => {
        await result.current.searchMolecule("water");
      });

      expect(result.current.moleculeData).toMatchObject({
        name: "water",
        cid: "962",
        sdf: mockSdf,
        structureFormat: "3d_sdf",
        formula: "H2O",
      });
    });
  });
});
