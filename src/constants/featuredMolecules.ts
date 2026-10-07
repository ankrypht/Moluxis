import { Ionicons } from "@expo/vector-icons";
import { formatSubscriptFormula } from "../utils/formula";

export { formatSubscriptFormula };

export type FeaturedCategoryKey = "biochemicals" | "medicinal" | "crystals";

export interface FeaturedMolecule {
  id: string;
  name: string;
  query: string;
  category: FeaturedCategoryKey;
  formula: string;
  formattedFormula: string;
  tag: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
  accentBg: string;
}

export interface FeaturedCategory {
  key: FeaturedCategoryKey;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    key: "biochemicals",
    title: "Biochemicals",
    icon: "leaf-outline",
    color: "#10B981",
  },
  {
    key: "medicinal",
    title: "Medicinal",
    icon: "medkit-outline",
    color: "#F43F5E",
  },
  {
    key: "crystals",
    title: "Crystals / Minerals",
    icon: "diamond-outline",
    color: "#38BDF8",
  },
];

export const FEATURED_MOLECULES: FeaturedMolecule[] = [
  // Biochemicals
  {
    id: "caffeine",
    name: "Caffeine",
    query: "Caffeine",
    category: "biochemicals",
    formula: "C8H10N4O2",
    formattedFormula: formatSubscriptFormula("C8H10N4O2"),
    tag: "Stimulant",
    iconName: "cafe-outline",
    color: "#10B981",
    accentBg: "rgba(16, 185, 129, 0.15)",
  },
  {
    id: "dopamine",
    name: "Dopamine",
    query: "Dopamine",
    category: "biochemicals",
    formula: "C8H11NO2",
    formattedFormula: formatSubscriptFormula("C8H11NO2"),
    tag: "Neurotransmitter",
    iconName: "sparkles-outline",
    color: "#06B6D4",
    accentBg: "rgba(6, 182, 212, 0.15)",
  },
  {
    id: "serotonin",
    name: "Serotonin",
    query: "Serotonin",
    category: "biochemicals",
    formula: "C10H12N2O",
    formattedFormula: formatSubscriptFormula("C10H12N2O"),
    tag: "Mood Regulator",
    iconName: "happy-outline",
    color: "#3B82F6",
    accentBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "adenine",
    name: "Adenine",
    query: "Adenine",
    category: "biochemicals",
    formula: "C5H5N5",
    formattedFormula: formatSubscriptFormula("C5H5N5"),
    tag: "DNA Base",
    iconName: "git-network-outline",
    color: "#8B5CF6",
    accentBg: "rgba(139, 92, 246, 0.15)",
  },

  // Medicinal
  {
    id: "aspirin",
    name: "Aspirin",
    query: "Aspirin",
    category: "medicinal",
    formula: "C9H8O4",
    formattedFormula: formatSubscriptFormula("C9H8O4"),
    tag: "Analgesic",
    iconName: "medkit-outline",
    color: "#EC4899",
    accentBg: "rgba(236, 72, 153, 0.15)",
  },
  {
    id: "penicillin",
    name: "Penicillin",
    query: "Penicillin",
    category: "medicinal",
    formula: "C16H18N2O4S",
    formattedFormula: formatSubscriptFormula("C16H18N2O4S"),
    tag: "Antibiotic",
    iconName: "shield-checkmark-outline",
    color: "#F43F5E",
    accentBg: "rgba(244, 63, 94, 0.15)",
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen",
    query: "Ibuprofen",
    category: "medicinal",
    formula: "C13H18O2",
    formattedFormula: formatSubscriptFormula("C13H18O2"),
    tag: "Anti-inflammatory",
    iconName: "bandage-outline",
    color: "#F97316",
    accentBg: "rgba(249, 115, 22, 0.15)",
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    query: "Paracetamol",
    category: "medicinal",
    formula: "C8H9NO2",
    formattedFormula: formatSubscriptFormula("C8H9NO2"),
    tag: "Pain & Fever Relief",
    iconName: "fitness-outline",
    color: "#E11D48",
    accentBg: "rgba(225, 29, 72, 0.15)",
  },

  // Crystals / Minerals
  {
    id: "diamond",
    name: "Diamond",
    query: "Diamond",
    category: "crystals",
    formula: "C",
    formattedFormula: "C",
    tag: "Carbon Lattice",
    iconName: "diamond-outline",
    color: "#38BDF8",
    accentBg: "rgba(56, 189, 248, 0.15)",
  },
  {
    id: "sodium-chloride",
    name: "Sodium Chloride",
    query: "Sodium Chloride",
    category: "crystals",
    formula: "NaCl",
    formattedFormula: "NaCl",
    tag: "Halite / Table Salt",
    iconName: "cube-outline",
    color: "#A855F7",
    accentBg: "rgba(168, 85, 247, 0.15)",
  },
  {
    id: "quartz",
    name: "Quartz",
    query: "Quartz",
    category: "crystals",
    formula: "SiO2",
    formattedFormula: formatSubscriptFormula("SiO2"),
    tag: "Silicon Dioxide",
    iconName: "prism-outline",
    color: "#EAB308",
    accentBg: "rgba(234, 179, 8, 0.15)",
  },
  {
    id: "calcite",
    name: "Calcite",
    query: "Calcite",
    category: "crystals",
    formula: "CaCO3",
    formattedFormula: formatSubscriptFormula("CaCO3"),
    tag: "Calcium Carbonate",
    iconName: "layers-outline",
    color: "#06B6D4",
    accentBg: "rgba(6, 182, 212, 0.15)",
  },
];
