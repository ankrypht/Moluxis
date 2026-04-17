export type VisualizationType = "ballStick" | "stick" | "wireframe" | "sphere";

export interface ChemicalProperties {
  hBondAcceptors?: string;
  hBondDonors?: string;
  rotatableBonds?: string;
  iupacName?: string;
  commonName?: string;
  logP?: string;
  tpsa?: string;
  boilingPoint?: string;
  meltingPoint?: string;
  solubility?: string;
  density?: string;
  pH?: string;
}

export interface SafetyInfo {
  signal?: string[];
  hazardStatements?: string[];
}

export interface MoleculeInfo {
  name: string;
  sdf3d: string;
  sdf2d: string;
  cif?: string;
  codId?: string | null;
  useCif: boolean;
  formula: string;
  molecularWeight: string;
  synonyms: string[];
  description: string;
  cid: string;
  properties: ChemicalProperties;
  safety: SafetyInfo;
}
