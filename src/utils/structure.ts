import { MoleculeInfo } from "../types";

export const has3dStructure = (
  data: MoleculeInfo | null | undefined,
): boolean => Boolean(data?.sdf3d || data?.useCif);

export const getDefaultStructureFormat = (
  data: MoleculeInfo | null | undefined,
): "3d" | "2d" => {
  if (data && !has3dStructure(data) && data.sdf2d) {
    return "2d";
  }
  return "3d";
};
