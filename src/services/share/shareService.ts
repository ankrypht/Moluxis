import { Share } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { MoleculeInfo } from "../../types";
import { isValidId } from "../pubchem/utils";
import { formatSubscriptFormula } from "../../utils/formula";

/**
 * Returns the PubChem compound URL if a valid CID is present.
 */
export function getCompoundPubChemUrl(cid?: string | null): string | null {
  if (cid && isValidId(cid)) {
    return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
  }
  return null;
}

/**
 * Builds a nicely formatted text summary for sharing.
 */
export function buildCompoundShareText(molecule: MoleculeInfo): string {
  const parts: string[] = [];
  const formulaPart = molecule.formula
    ? ` (${formatSubscriptFormula(molecule.formula)})`
    : "";
  parts.push(`🔬 ${molecule.name}${formulaPart}`);

  if (molecule.molecularWeight) {
    parts.push(`Molecular Weight: ${molecule.molecularWeight}`);
  }

  const pubchemUrl = getCompoundPubChemUrl(molecule.cid);
  if (pubchemUrl) {
    parts.push(`PubChem: ${pubchemUrl}`);
  }

  parts.push("\nExplored with Moluxis 3D Molecule Explorer");
  return parts.join("\n");
}

/**
 * Shares full compound details (name, formula, weight, PubChem link) via native share dialog.
 */
export async function shareCompoundDetails(
  molecule: MoleculeInfo,
): Promise<boolean> {
  try {
    const message = buildCompoundShareText(molecule);
    const pubchemUrl = getCompoundPubChemUrl(molecule.cid);

    await Share.share({
      title: `${molecule.name} - Moluxis`,
      message,
      url: pubchemUrl ?? undefined,
    });
    return true;
  } catch (error) {
    console.error("Error sharing compound details:", error);
    return false;
  }
}

/**
 * Shares only the PubChem URL via native share dialog.
 */
export async function sharePubChemLink(
  molecule: MoleculeInfo,
): Promise<boolean> {
  try {
    const url = getCompoundPubChemUrl(molecule.cid);
    if (!url) {
      return false;
    }

    await Share.share({
      title: `${molecule.name} on PubChem`,
      message: `${molecule.name} on PubChem: ${url}`,
      url,
    });
    return true;
  } catch (error) {
    console.error("Error sharing PubChem link:", error);
    return false;
  }
}

/**
 * Shares only compound name and formula.
 */
export async function shareNameAndFormula(
  molecule: MoleculeInfo,
): Promise<boolean> {
  try {
    const formulaPart = molecule.formula
      ? ` (${formatSubscriptFormula(molecule.formula)})`
      : "";
    const text = `🔬 ${molecule.name}${formulaPart}\nExplored with Moluxis`;

    await Share.share({
      title: `${molecule.name} Formula`,
      message: text,
    });
    return true;
  } catch (error) {
    console.error("Error sharing name and formula:", error);
    return false;
  }
}

/**
 * Writes the base64 snapshot to a local temporary file and opens the native share dialog.
 */
export async function shareSnapshotImage(
  dataUri: string,
  moleculeName: string,
): Promise<boolean> {
  try {
    if (!dataUri || !dataUri.includes("base64,")) {
      throw new Error("Invalid image data URI");
    }

    const base64Data = dataUri.split("base64,")[1];
    const safeName = moleculeName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const filename = `moluxis_${safeName || "compound"}_snapshot.png`;
    const baseDir =
      FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
    const fileUri = `${baseDir}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/png",
        dialogTitle: `Share ${moleculeName} 3D Snapshot`,
        UTI: "public.png",
      });
      return true;
    }

    // Fallback to React Native core Share if Sharing is unavailable
    await Share.share({
      title: `${moleculeName} 3D Snapshot`,
      message: `Check out the 3D structure of ${moleculeName} on Moluxis!`,
      url: fileUri,
    });
    return true;
  } catch (error) {
    console.error("Error sharing snapshot image:", error);
    return false;
  }
}
