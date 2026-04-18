import { fetchMoleculeData } from "../searchHelper";
import { fetchCompoundByName, fetchMoleculeDetails } from "../api";

// Mock the API service
jest.mock("../api", () => ({
  fetchCompoundByName: jest.fn(),
  fetchMoleculeDetails: jest.fn(),
}));

describe("fetchMoleculeData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when compound is not found", async () => {
    (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
      PC_Compounds: [],
    });

    await expect(fetchMoleculeData("UnknownCompound")).rejects.toThrow(
      "Could not find a molecule with that name.",
    );
  });

  it("should throw error when cid is invalid", async () => {
    (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
      PC_Compounds: [{ id: { id: { cid: "invalid" } }, props: [] }],
    });

    await expect(fetchMoleculeData("water")).rejects.toThrow(
      "Received invalid data from the chemical database.",
    );
  });

  it("should throw error when no structure data is available", async () => {
    (fetchCompoundByName as jest.Mock).mockResolvedValueOnce({
      PC_Compounds: [{ id: { id: { cid: 123 } }, props: [] }],
    });

    (fetchMoleculeDetails as jest.Mock).mockResolvedValueOnce({
      sdfText3d: "",
      sdfText2d: "",
      cifText: "",
      useCif: false,
    });

    await expect(fetchMoleculeData("water")).rejects.toThrow(
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
      sdfText3d: mockSdf,
      sdfText2d: "2d sdf data",
      cifText: "",
      codId: null,
      useCif: false,
    });

    const result = await fetchMoleculeData("water");

    expect(result).toMatchObject({
      name: "water",
      cid: "962",
      sdf3d: mockSdf,
      sdf2d: "2d sdf data",
      useCif: false,
      formula: "H2O",
      molecularWeight: "18.015 g/mol",
      description: "Water description",
    });
  });
});
