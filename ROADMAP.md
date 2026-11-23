# 🧪 Moluxis Android Innovations & Roadmap Guide

This document captures Android-focused architectural patterns, future blueprints, and verified implementations for **Moluxis**.

---

### 🧭 Navigation & Table of Contents

- [📱 Part 1: Android Home Screen Widgets (`expo-widgets`)](#-part-1-android-home-screen-widgets-expo-widgets)
  - [⚙️ Critical Runtime Rules (Expo Widgets Engine)](#️-critical-runtime-rules-expo-widgets-engine)
  - [💡 Home Screen Widget Concepts](#-home-screen-widget-concepts)
  - [🛠️ Widget Implementation Blueprint](#️-widget-implementation-blueprint)
  - [🌐 Unified Deep Linking Routing Schema (`moluxis://`)](#-unified-deep-linking-routing-schema-moluxis)
- [🔬 Part 2: Advanced 3D Scientific & Analysis Tools (Planned)](#-part-2-advanced-3d-scientific--analysis-tools-planned)
  - [🖨️ 3D Printing STL / GLTF Model Export](#️-3d-printing-stl--gltf-model-export)
  - [🌐 Electrostatic Potential (ESP) & Molecular Surfaces](#-electrostatic-potential-esp--molecular-surfaces)
  - [⚖️ Dual-Molecule Split Comparison Mode](#️-dual-molecule-split-comparison-mode)
  - [💎 Elemental Crystal Lattices & Solid-State Supercells (Diamond, Graphite, Silicon & Metals)](#-elemental-crystal-lattices--solid-state-supercells-diamond-graphite-silicon--metals)
- [🤖 Part 3: Android-Native Integrations (Planned)](#-part-3-android-native-integrations-planned)
  - [⚡ Android App Launcher Quick Actions (`expo-quick-actions`)](#-android-app-launcher-quick-actions-expo-quick-actions)
  - [👓 Augmented Reality (AR) Tabletop Mode (Android Scene Viewer)](#-augmented-reality-ar-tabletop-mode-android-scene-viewer)
  - [🎙️ Voice Chemical Search](#️-voice-chemical-search)
  - [🔄 Android 14+ Predictive Back Navigation](#-android-14-predictive-back-navigation)
- [📚 Part 4: Chemistry Education & Discovery (Planned)](#-part-4-chemistry-education--discovery-planned)
  - [🧪 Interactive Periodic Table of Elements](#-interactive-periodic-table-of-elements)
  - [📦 Offline Curated Molecule Packs](#-offline-curated-molecule-packs)
- [📋 Implementation Checklist](#-implementation-checklist)
- [✅ Implemented Features & Architecture](#-implemented-features--architecture)
  - [1. In-App Updates, Background Tasks & Notification Engine](#1-in-app-updates-background-tasks--notification-engine)
  - [2. Interactive Atom Picking & Geometric Measurement Calculator](#2-interactive-atom-picking--geometric-measurement-calculator)

---

# 📱 PART 1: Android Home Screen Widgets (`expo-widgets`)

`expo-widgets` compiles TypeScript widget components into native Android AppWidgets powered by **Jetpack Compose**. Because Moluxis is an **Android-only** application, the widgets take full advantage of Android-specific capabilities and avoid iOS-only paradigms.

## ⚙️ Critical Runtime Rules (Expo Widgets Engine)

1. **The `'widget'` Directive**: Every widget component file must start with the `'widget';` directive at the top of the function.
2. **Native Jetpack Compose Components Only**:
   - Supported components from `@expo/ui/jetpack-compose`: `Box`, `Column`, `Row`, `Text`, `Button`, `ElevatedButton`, `FilledTonalButton`, `OutlinedButton`, `TextButton`, `Image`, `Spacer`, `LazyColumn`, `LinearProgressIndicator`, `CircularProgressIndicator`, `LoadingIndicator`, `Switch`, `Checkbox`, `RadioButton`.
   - Modifiers from `@expo/ui/jetpack-compose/modifiers`: `background`, `cornerRadius`, `fillMaxSize`, `fillMaxWidth`, `fillMaxHeight`, `padding`, `paddingAll`, `size`, `width`, `height`, `wrapContentWidth`, `wrapContentHeight`.
   - _Standard React Native components (`View`, `Text` from `react-native`) cannot be used inside the widget function._
3. **Isolated Pure Function Runtime**:
   - No React hooks (`useState`, `useEffect`, etc.).
   - No in-memory app state or asynchronous calls (`fetch`, `AsyncStorage`).
   - Module-level constants declared outside the function cannot be referenced. All constants, lookup tables, and helpers must live **inside** the widget component or be passed in through `props`.
4. **Android Updates vs iOS**:
   - `updateTimeline` / `getTimeline` and `ios.configuration` are iOS-only.
   - On Android, widget displays are updated immediately via **`Widget.updateSnapshot(newProps)`**.
   - `environment` provides `colorScheme` (`'light' | 'dark'`).
5. **Image Sharing via `widgetsDirectory`**:
   - 2D structure SVG/PNGs or 3D snapshots must be written to `widgetsDirectory` (a shared filesystem directory) and referenced via file paths.
6. **In-Widget Interactivity**:
   - Buttons can return new props on press (`onPress={() => ({ ...newProps })}`) to update the widget immediately without opening the main app.
   - For app sync, buttons specify a `target` identifier caught by `addUserInteractionListener`.

---

## 💡 Home Screen Widget Concepts

### 1. 🌟 "Molecule of the Day" (Daily Featured Compound)

> **Recommended First Widget Implementation**

- **Grid Dimensions**: `4x2` cells (resizable to `2x2` or `4x3`)
- **Category**: Discovery & Daily Knowledge
- **Target Audience**: Students, researchers, and chemistry hobbyists

#### Concept & Layout

Displays a curated compound from `FEATURED_MOLECULES` (or a random selection from pre-bundled datasets) that rotates daily or whenever the user presses an in-widget shuffle button.

```
┌─────────────────────────────────────────────────────────────┐
│ [ BIOCHEMICAL ]                             Moluxis 🧪      │
│                                                             │
│  Caffeine                                                   │
│  C₈H₁₀N₄O₂  •  194.19 g/mol                                │
│                                                             │
│  Primary central nervous system stimulant in coffee & tea   │
│                                                             │
│  [ 🔀 Next Molecule ]                     [ ↗ Open in 3D ]  │
└─────────────────────────────────────────────────────────────┘
```

#### Feature Details

- **Dynamic Category Accent**: Color-coded badges matching Moluxis themes:
  - Biochemicals: Emerald (`#10B981`)
  - Medicinal: Rose (`#F43F5E`)
  - Crystals / Minerals: Sky Blue (`#38BDF8`)
- **Chemical Typography**: Formatted formulas with subscript numerals ($C_8H_{10}N_4O_2$, $H_2O$).
- **Interactive "Next" Button**: Tapping a button triggers `onPress` returning the next compound props from the featured list directly from the home screen without opening the app.
- **Deep Link Navigation**: Tapping the card body opens Moluxis directly into the 3D viewer for that CID/query (`moluxis://molecule?query=caffeine`).

---

### 2. 🔍 "Quick Search & Jump Back In" (Recent Shelf)

- **Grid Dimensions**: `4x2` cells
- **Category**: Productivity & Fast Navigation
- **Target Audience**: Daily active users and power searchers

#### Concept & Layout

Keeps recent searches and pinned bookmarks right on the Android home screen for instant 1-tap re-inspection.

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Tap to search 100M+ molecules...                         │
├─────────────────────────────────────────────────────────────┤
│ Recent Explorations                                         │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐       │
│ │ Aspirin       │ │ Glucose       │ │ Diamond (COD) │       │
│ │ C₉H₈O₄        │ │ C₆H₁₂O₆       │ │ C (Lattice)   │       │
│ └───────────────┘ └───────────────┘ └───────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

#### Feature Details

- **Search Shortcut Pill**: Tapping the top search bar launches Moluxis with the keyboard auto-focused and the search drawer ready.
- **Recent Chips**: Renders the 3 most recently inspected compounds saved in `useCompoundHistoryAndBookmarks`.
- **Sync Trigger**: Every time a user opens or inspects a molecule in the app, `MoleculeHistoryWidget.updateSnapshot(...)` updates the shelf.

---

### 3. 🧠 "Chemical Flashcard / Guess the Compound" (Interactive Quiz)

- **Grid Dimensions**: `3x2` or `4x2` cells
- **Category**: Education & Gamification
- **Target Audience**: Chemistry students and trivia lovers

#### Concept & Layout

An interactive widget that challenges the user to identify a compound from its formula, molecular weight, and properties.

```
┌─────────────────────────────────────────────────────────────┐
│ 🧪 Chemical Flashcard                        Score: 12      │
│                                                             │
│  Formula: C₉H₈O₄                                            │
│  Weight:  180.16 g/mol                                      │
│  Hint:    Common analgesic & anti-inflammatory drug         │
│                                                             │
│  [ 👁️ Reveal Answer ]                     [ ⏭️ Skip ]       │
└─────────────────────────────────────────────────────────────┘
```

#### State Machine (Interactive In-Widget Buttons)

1. **Hidden State**: Shows formula, molecular weight, and hint.
2. **User taps "Reveal Answer"**:
   - Button `onPress` returns `{ ...props, isRevealed: true }`.
   - Jetpack Compose re-renders to display: `"Answer: Aspirin (Acetylsalicylic Acid)"` with IUPAC name and a `"Next Card"` button.
3. No app launch required for playing through cards.

---

### 4. 🔔 "Active Molecule Inspector" (Android Notification Shade Card)

- **API**: `createCustomNotification` from `expo-widgets`
- **Category**: Multi-tasking Companion
- **Target Audience**: Users referencing chemical properties while reading research papers or writing notes.

#### Concept & Layout

When enabled, putting Moluxis in the background while viewing a compound posts an ongoing, custom-styled notification card to the Android notification shade:

- **Collapsed State (64 dp)**: `[🧪 Moluxis] Caffeine (C₈H₁₀N₄O₂) • 194.19 g/mol`
- **Expanded State (up to 256 dp)**: Full chemical properties overview (LogP, TPSA, H-Bonds, Boiling/Melting points, GHS safety alerts) with a button to **"Resume 3D Inspection"**.

---

## 🛠️ Widget Implementation Blueprint

### Step 1: Install Dependencies

```bash
npx expo install expo-widgets @expo/ui
```

### Step 2: Configure in `app.config.js`

```javascript
export default {
  // ...
  scheme: "moluxis",
  plugins: [
    // ...
    [
      "expo-widgets",
      {
        enableAndroid: true,
        widgets: [
          {
            name: "MoleculeOfTheDayWidget",
            displayName: "Molecule of the Day",
            description:
              "Explore a featured chemical compound or crystal every day",
            android: {
              targetCellWidth: 4,
              targetCellHeight: 2,
              minWidth: 180,
              minHeight: 110,
              resizeMode: "both",
            },
          },
        ],
      },
    ],
  ],
};
```

### Step 3: Widget Component Code (`src/widgets/MoleculeOfTheDayWidget.tsx`)

```tsx
import {
  Column,
  Row,
  Text,
  Button,
  Spacer,
  Box,
} from "@expo/ui/jetpack-compose";
import {
  background,
  cornerRadius,
  fillMaxSize,
  fillMaxWidth,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export interface MoleculeOfTheDayProps {
  name: string;
  formula: string;
  molecularWeight: string;
  category: string;
  categoryColor: string;
  tag: string;
  description: string;
  cid?: string;
}

const MoleculeOfTheDayWidget = (
  props: MoleculeOfTheDayProps,
  environment: WidgetEnvironment,
) => {
  "widget";

  const isDark = environment.colorScheme !== "light";
  const cardBg = isDark ? "#121212" : "#FFFFFF";

  return (
    <Box
      modifiers={[
        fillMaxSize(),
        background(cardBg),
        cornerRadius(20),
        padding({ all: 16 }),
      ]}
    >
      <Column modifiers={[fillMaxSize()]}>
        {/* Header */}
        <Row modifiers={[fillMaxWidth()]}>
          <Box
            modifiers={[
              background(props.categoryColor || "#10B981"),
              cornerRadius(6),
              padding({ horizontal: 8, vertical: 3 }),
            ]}
          >
            <Text modifiers={[]}>{props.tag || "Compound"}</Text>
          </Box>
          <Spacer />
          <Text modifiers={[]}>🧪 Moluxis</Text>
        </Row>

        <Spacer />

        {/* Compound Info */}
        <Text modifiers={[]}>{props.name}</Text>
        <Row modifiers={[fillMaxWidth()]}>
          <Text modifiers={[]}>{props.formula}</Text>
          <Spacer />
          <Text modifiers={[]}>{props.molecularWeight} g/mol</Text>
        </Row>

        <Spacer />
        <Text modifiers={[]}>{props.description}</Text>

        <Spacer />

        {/* Action Buttons */}
        <Row modifiers={[fillMaxWidth()]}>
          <Button
            modifiers={[]}
            onClick={() => {
              // Interactivity handled via widget action / event listener
            }}
          >
            <Text modifiers={[]}>🔀 Next Molecule</Text>
          </Button>
          <Spacer />
          <Button
            modifiers={[]}
            onClick={() => {
              // Triggers deep link into Moluxis 3D Viewer
            }}
          >
            <Text modifiers={[]}>↗ Open in 3D</Text>
          </Button>
        </Row>
      </Column>
    </Box>
  );
};

export default createWidget("MoleculeOfTheDayWidget", MoleculeOfTheDayWidget, {
  name: "Caffeine",
  formula: "C8H10N4O2",
  molecularWeight: "194.19",
  category: "Biochemicals",
  categoryColor: "#10B981",
  tag: "Stimulant",
  description: "Primary central nervous system stimulant in coffee & tea",
  cid: "2519",
});
```

### Step 4: Listening for Widget Interactions & Deep Links in `App.tsx`

```typescript
import * as Linking from "expo-linking";
import { addUserInteractionListener } from "expo-widgets";
import { FEATURED_MOLECULES } from "./src/constants/featuredMolecules";
import MoleculeOfTheDayWidget from "./src/widgets/MoleculeOfTheDayWidget";

// 1. In-widget button interaction listener (e.g. Next Molecule button)
addUserInteractionListener((event) => {
  if (event.target === "next_molecule") {
    const randomMolecule =
      FEATURED_MOLECULES[Math.floor(Math.random() * FEATURED_MOLECULES.length)];
    if (randomMolecule) {
      MoleculeOfTheDayWidget.updateSnapshot({
        name: randomMolecule.name,
        formula: randomMolecule.formula,
        molecularWeight: randomMolecule.molecularWeight,
        category: randomMolecule.category,
        categoryColor: "#10B981",
        tag: randomMolecule.tag,
        description: randomMolecule.description,
        cid: randomMolecule.cid,
      });
    }
  }
});
```

---

## 🌐 Unified Deep Linking Routing Schema (`moluxis://`)

To maintain clean and unambiguous navigation across Widgets, Notifications, Quick Actions, and Web shares, Moluxis standardizes on the following URI scheme:

| URI Route             | Query / Path Params                         | Destination & Action                                              |
| :-------------------- | :------------------------------------------ | :---------------------------------------------------------------- |
| `moluxis://molecule`  | `?query={name_or_cid}`                      | Searches and loads the molecule or crystal in the 3D WebGL viewer |
| `moluxis://search`    | `?q={optional_query}`                       | Opens the search drawer with the search bar focused               |
| `moluxis://category`  | `?name={crystals\|biochemicals\|medicinal}` | Switches the Featured list filter tab directly                    |
| `moluxis://bookmarks` | None                                        | Opens the Bookmarks & Recent History modal                        |
| `moluxis://update`    | `?version={version}`                        | Opens the `UpdateAvailableModal` dialog                           |

---

# 🔬 PART 2: Advanced 3D Scientific & Analysis Tools (Planned)

These features extend Moluxis beyond 3D visualization into an active scientific workbench for chemistry students, researchers, and hobbyists.

---

### 🖨️ 3D Printing STL / GLTF Model Export

- **Concept**: Allow users to export any compound or crystal unit cell directly as a `.stl` (Stereolithography) or `.gltf` 3D model file ready for 3D printers or external CAD software.
- **Why it matters**: Chemistry teachers and students benefit greatly from physical ball-and-stick models. Exporting directly to a 3D printable mesh makes Moluxis an indispensable classroom companion.
- **Technical Architecture**:
  - **Native 3Dmol VRML Export**: 3Dmol.js includes `viewer.exportVRML()` out-of-the-box for standard 3D chemistry interchange.
  - **Binary STL Generator in WebView**:
    - Iterate over the current model's atoms (`model.selectedAtoms({})`) and bonds (`atom.bonds`).
    - Generate triangulated sphere meshes at atomic positions and cylindrical struts along bonds.
    - Encode triangle normals and vertices into a standard binary STL ArrayBuffer.
    - Stream to React Native via `window.ReactNativeWebView.postMessage({ type: 'STL_EXPORT_RESULT', base64Data: '...' })`.
  - **Native Sharing**:
    - Cache via `FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 })`.
    - Present the system file share sheet via `Sharing.shareAsync(path, { mimeType: 'model/stl', dialogTitle: 'Share 3D Printable STL' })`.

---

### 🌐 Electrostatic Potential (ESP) & Molecular Surfaces

- **Concept**: Beyond traditional Ball & Stick, Stick, Wireframe, or Sphere modes, render electron density and solvent accessible surfaces.
- **Surfaces Supported**:
  - **Van der Waals (VDW) Surface**: Outlines the volume occupied by atoms (`$3Dmol.SurfaceType.VDW`).
  - **Solvent Accessible Surface (SAS)**: Shows where water/solvent molecules can access the compound (`$3Dmol.SurfaceType.SAS`).
  - **Electrostatic Potential Coloring (ESP)**: Colors the surface from red (electronegative/partial negative charge) to blue (electropositive/partial positive charge).
- **Technical Architecture**:
  - 3Dmol.js built-in surface calculation:
    ```javascript
    viewer.addSurface($3Dmol.SurfaceType.VDW, {
      opacity: 0.85,
      colorscheme: "electrostatic", // uses Gasteiger or MMFF94 partial charges
    });
    ```
  - **Performance Optimization**:
    - Surface tessellation is GPU-heavy; execute asynchronously with an `isGeneratingSurface` loading indicator.
    - Clear surfaces on unmount or compound switch via `viewer.removeAllSurfaces()`.
  - Add a "Surface" toggle in the existing visual styles menu.

---

### ⚖️ Dual-Molecule Split Comparison Mode

- **Concept**: Adaptive side-by-side split screen allowing users to inspect two molecules simultaneously.
- **Use Cases**:
  - **Enantiomers & Stereoisomers**: Compare D-Glucose vs L-Glucose or Thalidomide (R) vs (S).
  - **Allotropes / Polymorphs**: Compare Diamond vs Graphite vs Buckminsterfullerene.
  - **Drug Discovery**: Compare a drug candidate against its biological target ligand.
- **Controls**:
  - Synchronized rotation toggle (rotating one rotates the other in lockstep) or independent rotation.

---

### 💎 Elemental Crystal Lattices & Solid-State Supercells (Diamond, Graphite, Silicon & Metals)

- **Concept**: Expand Moluxis beyond discrete, finite molecules into solid-state crystallography and extended covalent network solids. Enable interactive exploration of elemental crystal lattices (such as the diamond cubic lattice of Carbon, planar graphite sheets, semiconductor silicon, and close-packed metallic lattices) with real-time unit cell boundary rendering and supercell lattice expansion.

#### The Problem: Discrete Molecules vs. Infinite Network Solids

1. **PubChem Compound Limitations**:
   - PubChem PUG REST is engineered around discrete organic molecules. Searching for `"Diamond"` (CID 5462310 or CID 24261) returns either an empty 3D conformer, a single isolated carbon atom ($C$), or arbitrary non-periodic fragments.
   - PubChem cannot natively convey the 3D connectivity of infinite covalent network solids or Bravais lattices.
2. **The Single Unit Cell Dilemma**:
   - A single primitive unit cell ($1 \times 1 \times 1$) of diamond ($Fd\bar{3}m$, space group No. 227) contains 8 carbon atoms located at face-centered cubic positions and tetrahedral interstitial sites.
   - Because covalent bonds truncate abruptly at the unit cell boundary, viewing only $1 \times 1 \times 1$ leaves students and researchers with disjointed, hanging bonds where the iconic interlocking tetrahedral cage network is invisible.
   - To truly understand diamond, users need an interactive **Supercell Replication Engine** ($2 \times 2 \times 2$ yielding 64 atoms, or $3 \times 3 \times 3$ yielding 216 atoms) that reconstructs the continuous crystalline architecture with complete rings and coordination polyhedra.

#### Crystallographic Data Architecture & Sourcing

- **Primary Data Format**: Crystallographic Information File (**CIF**), supported natively by 3Dmol.js.
- **Pre-Bundled Elemental Allotrope & Mineral Registry**:
  Add verified, zero-latency CIF records to `src/constants/bundledMoleculeData.ts`:
  - **Diamond** (Carbon allotrope): Space group $Fd\bar{3}m$ (No. 227), $a = b = c = 3.567\text{ \AA}$, $\alpha = \beta = \gamma = 90^\circ$, tetrahedral $sp^3$ covalent network (COD ID: `9008564` / `1011033`).
  - **Graphite** (Carbon allotrope): Hexagonal system, space group $P6_3/mmc$ (No. 194), $a = b = 2.464\text{ \AA}, c = 6.711\text{ \AA}$, $\alpha = \beta = 90^\circ, \gamma = 120^\circ$, planar $sp^2$ aromatic sheets with weak interlayer van der Waals spacing ($3.35\text{ \AA}$) (COD ID: `1200018`).
  - **Lonsdaleite** (Hexagonal diamond): Space group $P6_3/mmc$ (No. 194), high-pressure meteorite impact polymorph of carbon (COD ID: `9008566`).
  - **Silicon (Si)**: Diamond cubic semiconductor lattice, space group $Fd\bar{3}m$ (No. 227), $a = 5.431\text{ \AA}$ (COD ID: `9008565`).
  - **Germanium (Ge)**: Diamond cubic semiconductor lattice, space group $Fd\bar{3}m$ (No. 227), $a = 5.658\text{ \AA}$ (COD ID: `9008567`).
  - **Native Gold (Au)**: Face-Centered Cubic (FCC) close-packed metal, space group $Fm\bar{3}m$ (No. 225), $a = 4.078\text{ \AA}$, coordination number $CN = 12$ (COD ID: `9008463`).
  - **$\alpha$-Iron (Ferrite)**: Body-Centered Cubic (BCC) metal, space group $Im\bar{3}m$ (No. 229), $a = 2.866\text{ \AA}$, coordination number $CN = 8$ (COD ID: `9008536`).
  - **Copper (Cu)**: Face-Centered Cubic (FCC) metal, space group $Fm\bar{3}m$ (No. 225), $a = 3.615\text{ \AA}$ (COD ID: `9008460`).
- **Intelligent Query Interceptor & COD Gateway (`searchHelper.ts` / `api.ts`)**:
  - Detect searches matching elemental allotropes, Bravais lattices, and native minerals (`"diamond"`, `"graphite"`, `"silicon lattice"`, `"fcc gold"`, `"bcc iron"`).
  - Automatically query the Crystallography Open Database (COD) REST endpoint (`https://www.crystallography.net/cod/{codId}.cif`) or fall back to pre-bundled records whenever PubChem returns no 3D SDF conformers or a single-atom non-crystallographic record.

#### 3Dmol.js Supercell & Crystallography Engine Blueprint

1. **Unit Cell Assembly**:
   ```javascript
   // Load CIF structure with symmetry equivalent positions
   currentModel = viewer.addModel(cifData, "cif", { duplicateAssembly: true });
   ```
2. **Dynamic Supercell Replication**:
   - Utilize 3Dmol.js's native `replicateUnitCell(nx, ny, nz, model, assignBonds)` method:
     ```javascript
     // Replicate unit cell along a, b, c axes and recalculate covalent bonds across cell boundaries
     viewer.replicateUnitCell(supercellX, supercellY, supercellZ, currentModel, true);
     ```
   - **$1 \times 1 \times 1$**: Shows the primitive unit cell with fractional coordinate boundary atoms.
   - **$2 \times 2 \times 2$**: Generates 64 atoms for diamond, completing closed interlocking tetrahedral cages and puckered chair-conformation 6-carbon rings.
   - **$3 \times 3 \times 3$**: Generates 216 atoms for macroscopic crystal lattice inspection.
3. **Unit Cell Wireframe & Crystallographic Basis Vectors (`addUnitCell`)**:
   - Render the bounding parallelepiped box with color-coded crystallographic axes:
     ```javascript
     viewer.addUnitCell(currentModel, {
       box: { color: 0x06B6D4 },      // Cyan bounding box
       astyle: { color: 0xEF4444 },    // Red a-axis vector
       bstyle: { color: 0x10B981 },    // Emerald b-axis vector
       cstyle: { color: 0x3B82F6 },    // Blue c-axis vector
       alabel: "a",
       blabel: "b",
       clabel: "c"
     });
     ```
   - The unit cell wireframe remains visible inside the expanded $2 \times 2 \times 2$ or $3 \times 3 \times 3$ supercell, allowing users to visually distinguish between the single repeating unit cell and the macro-lattice.
4. **Miller Indices & Crystallographic Cleavage Planes $(hkl)$**:
   - Provide visual plane slices intersecting the supercell:
     - **Diamond $\{111\}$**: The easiest octahedral cleavage plane (lowest bond density per unit area), fundamental to gemstone cutting.
     - **Diamond $\{100\}$**: Cubic faces.
     - **Graphite $(001)$**: Basal slip planes explaining dry lubricity and exfoliation into graphene.
     - **Silicon $\{100\}$ vs $\{111\}$**: Essential for understanding semiconductor wafer fabrication and anisotropic etching.

#### Interactive UI & Controls (Lattice Controls Drawer)

- **Dedicated Lattice Toggle**: When `moleculeData.useCif === true`, `FloatingDock.tsx` highlights a dedicated **Lattice** button (cube/gem icon).
- **`LatticeControls.tsx` Drawer**:
  - **Supercell Multiplier**: Stepper/segmented control for $1 \times 1 \times 1$ (Unit Cell), $2 \times 2 \times 2$ (Standard Cage), $3 \times 3 \times 3$ (Expanded Lattice).
  - **Wireframe Boundary Toggle**: Toggle unit cell bounding box on/off.
  - **Basis Vectors Toggle**: Toggle crystallographic axes ($\vec{a}, \vec{b}, \vec{c}$) with live length readouts.
  - **Miller Cleavage Plane Selector**: Toggle overlays for $(100)$, $(110)$, or $(111)$ planes.
  - **Allotrope Polymorph Switcher**: When viewing Carbon, 1-tap tabs to switch between **Diamond** $\leftrightarrow$ **Graphite** $\leftrightarrow$ **Lonsdaleite** $\leftrightarrow$ **Fullerene ($C_{60}$)**.
- **Crystallographic Properties Card (`MoleculeInfoSheet.tsx`)**:
  - **Space Group**: Hermann-Mauguin symbol, Hall notation, and space group number (e.g. $Fd\bar{3}m$, No. 227 for Diamond; $P6_3/mmc$, No. 194 for Graphite).
  - **Crystal System & Bravais Lattice**: Cubic (FCC), Hexagonal (HCP), Tetragonal, Orthorhombic, Monoclinic, Triclinic, Trigonal.
  - **Lattice Parameters**: Edge lengths ($a, b, c$ in Å), inter-axial angles ($\alpha, \beta, \gamma$ in degrees), and unit cell volume ($\text{\AA}^3$).
  - **Coordination & Packing**: Atomic Packing Factor (APF) and Coordination Number ($CN = 4$, $34.01\%$ APF for Diamond; $CN = 12$, $74.05\%$ APF for FCC Gold; $CN = 8$, $68.02\%$ APF for BCC Iron).

#### WebView Bridge Protocol & Measurement Integration

- **Bridge Commands (React Native ➔ WebView)**:
  - `SET_SUPERCELL`: `{ type: 'SET_SUPERCELL', nx: 2, ny: 2, nz: 2, showBox: true, showAxes: true }`
  - `SET_MILLER_PLANE`: `{ type: 'SET_MILLER_PLANE', hkl: [1, 1, 1], visible: true }`
- **Atom Picking Across Supercells**:
  - Atoms in replicated unit cells receive deterministic indices (`supercellAtomIndex = cellOffset + atomIndex`).
  - Users can use the existing geometric measurement calculator to verify:
    - $C-C$ covalent bond length in diamond: **$1.54\text{ \AA}$** ($sp^3$ single bond).
    - $C-C-C$ bond angle in diamond: **$109.47^\circ$** (ideal tetrahedral angle).
    - $C-C$ in-plane bond length in graphite: **$1.42\text{ \AA}$** ($sp^2$ resonance).
    - Interlayer distance in graphite: **$3.35\text{ \AA}$** (van der Waals spacing).

#### Cross-Feature Synergies

- **🖨️ 3D Printing STL Export**: Export full $2 \times 2 \times 2$ diamond crystal lattices as printable physical classroom models.
- **🧪 Interactive Periodic Table**: 1-tap button on solid elements (Carbon, Silicon, Gold, Iron, Copper, Titanium) to launch directly into their room-temperature crystal lattice.
- **⚖️ Dual-Molecule Comparison**: Compare Carbon allotropes side-by-side (e.g. Diamond vs. Graphite or Diamond vs. Silicon).

---

# 🤖 PART 3: Android-Native Integrations (Planned)

Features taking full advantage of the Android operating system to make Moluxis feel like a first-party Android experience.

---

### ⚡ Android App Launcher Quick Actions (`expo-quick-actions`)

- **Concept**: Long-pressing the Moluxis icon on the Android launcher displays instant shortcuts:
  - 🔍 **Search Compound**: Immediately launches app with keyboard up and search drawer focused.
  - 💎 **Explore Crystals**: Jumps directly to COD Mineral Crystal Lattices.
  - ⭐ **Bookmarks**: Opens the saved bookmarks shelf.
  - 🎲 **Surprise Me**: Picks a random molecule from 100M+ PubChem library.
- **Implementation Strategy**:
  - Register shortcuts during app bootstrap via `QuickActions.setItems([...])`.
  - Listen for launches via `QuickActions.useQuickActionCallback(...)` and dispatch to search, categories, or bookmarks.

---

### 👓 Augmented Reality (AR) Tabletop Mode (Android Scene Viewer)

- **Concept**: Place a life-size or tabletop 3D molecule / mineral lattice on a desk or floor using Android's native **Scene Viewer** / ARCore.
- **User Flow**:
  - On the 3D canvas, tap the **"View in AR"** pill.
  - Moluxis exports the current molecule to a temporary `.glb` file.
  - Launches Android Scene Viewer via intent:
    `intent://arvr.google.com/scene-viewer/1.0?file=file://...#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`
  - Walk around a 6-foot DNA helix or examine a giant NaCl crystal lattice in physical space.

---

### 🎙️ Voice Chemical Search

- **Concept**: Hands-free search for students in chemistry labs or users on the move.
- **Feature**: A microphone button in the floating header that listens for chemical names ("Sodium Chloride", "Acetylsalicylic Acid", "Caffeine") and triggers search via speech-to-text.

---

### 🔄 Android 14+ Predictive Back Navigation

- **Concept**: Modern navigation with Android's predictive back gesture animation.
- **Feature**: Swiping from the left or right edge smoothly scales and dismisses modals (Info Sheet, History, Share Export, Measurements) with a predictive preview animation instead of an abrupt dismissal.
- **Config Note**: In `app.config.js`, `android.predictiveBackGestureEnabled` is currently `false`. Switch to `true` when adopting Android 14+ (API 34) native navigation animations.

---

# 📚 PART 4: Chemistry Education & Discovery (Planned)

Transforming Moluxis into the ultimate educational and discovery platform for chemistry education.

---

### 🧪 Interactive Periodic Table of Elements

- **Concept**: A dedicated, dark-themed interactive periodic table sheet.
- **Features**:
  - Color-coded by element family (Alkali metals, Halogens, Noble gases, Transition metals, Actinides, Lanthanides).
  - Tapping an element (e.g. **Titanium (Ti)**) displays:
    - Atomic number, mass, electron configuration, electronegativity, oxidation states.
    - **"Room-Temperature Crystal Structure"**: 1-tap shortcut to launch solid elements directly into the 3D Lattice Viewer (e.g., Carbon $\to$ Diamond or Graphite, Silicon $\to$ Diamond cubic, Iron $\to$ BCC $\alpha$-ferrite, Gold $\to$ FCC).
    - **"Iconic Compounds Containing Ti"**: 1-tap shortcuts to inspect Titanium Dioxide ($TiO_2$), Rutile crystal lattice, Titanocene, etc.

---

### 📦 Offline Curated Molecule Packs

- **Concept**: Download curated bundles for 100% offline access in subterranean laboratories or offline study areas:
  - **Pack 1: The Essential 20 Amino Acids** (Alanine to Valine with stereochemistry).
  - **Pack 2: Neurotransmitters & Hormones** (Dopamine, Serotonin, Epinephrine, Oxytocin).
  - **Pack 3: Top 100 Prescription Pharmaceuticals** (Penicillin, Metformin, Atorvastatin, Paracetamol).
  - **Pack 4: Iconic Gemstones & Minerals** (Diamond, Ruby, Emerald, Quartz, Pyrite unit cells and supercells).
- **Storage**: Cached locally as pre-bundled JSON structures for instant zero-latency loading.

---

# 📋 Implementation Checklist

> Features can be implemented in any order. Completed items are documented in detail below.

### Home Screen Widgets (`expo-widgets`)

- [ ] Install `expo-widgets` and `@expo/ui`.
- [ ] Configure `app.config.js` with `enableAndroid: true` and 4×2 grid size.
- [ ] Implement `src/widgets/MoleculeOfTheDayWidget.tsx` with `@expo/ui/jetpack-compose`.
- [ ] Wire up `updateSnapshot` in `useMoleculeSearch` to sync active molecules to the widget.

### Scientific Tools (Measurements & Surfaces)

- [x] Enable interactive atom picking in 3Dmol.js canvas and geometric calculations (Bond length, Bond angle, Dihedral/torsion).
- [x] Add interactive measurement UI (`MeasurementPanel.tsx`, `FloatingDock.tsx` Measure toggle, 3D wireframe atom highlights, dashed struts, 3D labels, and haptics).
- [ ] Add Electrostatic Potential (ESP) and Van der Waals surface options in style selector.
- [ ] Implement STL 3D-printing mesh export in `ShareExportModal.tsx`.
- [ ] Dual-molecule split comparison mode.

### Crystal Lattices & Solid-State Supercells (Diamond, Graphite, Minerals & Metals)

- [ ] Curate and pre-bundle high-precision CIF records for Diamond ($Fd\bar{3}m$), Graphite ($P6_3/mmc$), Silicon, Gold, $\alpha$-Iron, and Quartz in `src/constants/bundledMoleculeData.ts`.
- [ ] Enhance search resolver (`searchHelper.ts` / `api.ts`) to intercept elemental/mineral queries (Diamond, Carbon allotropes, Silicon) and fallback to COD CIF records instead of single-atom PubChem SDFs.
- [ ] Implement `replicateUnitCell(nx, ny, nz, model, true)` and `addUnitCell(model, options)` in `src/constants/viewerHtml.ts` with supercell replication and bond re-assignment.
- [ ] Create `LatticeControls.tsx` drawer with supercell dimension slider ($1\times1\times1$ to $3\times3\times3$), unit cell boundary wireframe toggle, and crystallographic axis vectors ($\vec{a}, \vec{b}, \vec{c}$).
- [ ] Parse and display crystallographic parameters (Space group, Hermann-Mauguin symbol, Bravais lattice, cell constants, packing efficiency) in `MoleculeInfoSheet.tsx`.
- [ ] Implement Miller indices $(hkl)$ cleavage plane visualizer (e.g. Diamond $\{111\}$ and $\{100\}$ planes) in 3D WebGL canvas.
- [ ] Integrate crystal lattice launcher into the Interactive Periodic Table of Elements (1-tap room-temperature crystal structure for solid elements).

### Notifications & Update Alerts (`expo-notifications`)

- [x] Install `expo-notifications`, `expo-application`, `expo-constants`, `expo-linking`, `expo-background-task`, and `expo-task-manager`.
- [x] Configure notification icon (`assets/notification-icon.png`), `moluxis://` scheme, `POST_NOTIFICATIONS` permission, and emerald theme in `app.config.js`.
- [x] Implement notification channels (`app_updates`, `discoveries`) and schedulers in `src/services/notifications/notificationService.ts`.
- [x] Implement Google Play update checker and distribution routing (`src/services/updates/appUpdateChecker.ts` + `src/constants/distributions.ts`).
- [x] Implement version checking and What's New notice trigger (`src/services/updates/updateNoticeService.ts`).
- [x] Schedule offline weekly Molecule Spotlight (`WEEKLY` trigger) and 14-day bookmark retention reminder.
- [x] Register Android WorkManager headless background task (`moluxis-background-update-task`) in `index.ts`.
- [x] Create `UpdateAvailableModal.tsx` (Pre-update dialog linking to Google Play Store with 24h snooze).
- [x] Create `WhatsNewModal.tsx` (Post-update changelog dialog with categorized release highlights).
- [x] Add dev-only `DevTestModal.tsx` lab for inspecting live diagnostics, scheduling, and triggering modals.
- [x] Enforce production build release-notes gate (`app.config.js` and `scripts/validate-release-notes.js`).

### Native Android Integrations & Quick Actions

- [ ] Install `expo-quick-actions` and register launcher shortcuts (Search, Crystals, Bookmarks, Random).
- [ ] AR Scene Viewer export and Android intent launcher.
- [ ] Voice chemical search via speech-to-text.
- [ ] Android 14+ predictive back gesture navigation.

### Educational Expansions

- [ ] Interactive Periodic Table of Elements modal/drawer.
- [ ] Curated offline molecule packs.

---

# ✅ IMPLEMENTED FEATURES & ARCHITECTURE

The following features have been fully implemented and verified in the codebase.

---

## 1. In-App Updates, Background Tasks & Notification Engine

### What Has Been Done

Moluxis now features an automated, serverless update and notification system built on top of `expo-notifications`, `expo-background-task`, `expo-task-manager`, and `expo-linking`.

#### Architecture & Deflections from Original Plan

1. **Streamlined Google Play Store Distribution (Deflection from Dual APK Plan):**
   - _Original Plan_: Envisioned a complex runtime detection layer (`Application.getInstallReferrerAsync()`) with toggling between GitHub APK downloads and Google Play Store.
   - _Implemented Approach_: Standardized on the official Google Play Store channel (`market://details?id=com.ankushsarkar.moluxis`), with an immediate HTTPS web fallback (`https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis`). This avoids fragile package visibility permissions on Android 11+ (API 30+) and provides a single, safe, auto-updating source for end users.
2. **Serverless Version Oracle (GitHub Releases API):**
   - `checkForAppUpdate()` queries `https://api.github.com/repos/ankrypht/Moluxis/releases/latest` with an 8-second `AbortController` timeout.
   - Compares release tags against the installed version using a custom `compareSemver()` helper that normalizes leading `'v'`, pre-release tags, and build metadata.
   - Fails safely with zero crash risk on network drops, timeouts, or GitHub API rate limits (HTTP 403).
3. **Android Jetpack WorkManager Periodic Task:**
   - Headless background worker (`moluxis-background-update-task`) defined via `TaskManager.defineTask` at root bundle load (`index.ts`).
   - Registered with a 12-hour minimum interval (`BACKGROUND_UPDATE_INTERVAL_MINUTES = 720`).
   - Android WorkManager wakes up the headless JS task (typically during Wi-Fi + charging windows) to check GitHub releases and post an update notification when a new version is detected.
4. **Android 13+ Notification Channels & Scheduled Spotlights:**
   - Pre-configures channels: `app_updates` (High Importance, emerald accent, vibration) and `discoveries` (Default Importance).
   - Requests `POST_NOTIFICATIONS` permission cleanly, remembering prior user decisions in `AsyncStorage` to avoid repeated prompts.
   - Schedules an offline **Weekly Molecule Spotlight** using `SchedulableTriggerInputTypes.WEEKLY` (Saturdays at 10:00 AM) that cycles through curated compounds.
   - Schedules a **14-day Bookmark Retention Reminder** using `SchedulableTriggerInputTypes.TIME_INTERVAL`, resetting automatically whenever bookmarks change or the app returns to foreground.
5. **In-App Modals & Build-Time Release Notes Gate:**
   - `UpdateAvailableModal`: Displays available version, Google Play update action, and a 24-hour snooze option.
   - `WhatsNewModal`: Automatically pops up post-upgrade when `lastSeenVersion !== currentVersion`, presenting highlights parsed from `src/constants/releaseNotes.json`.
   - **Production Build Gate**: `app.config.js` and `scripts/validate-release-notes.js` enforce that release notes match `package.json` version and contain at least one highlight before any production EAS build can run.
6. **Unified Deep Linking (`moluxis://`):**
   - Listens for cold-start and background links via `expo-linking`:
     - `moluxis://molecule?query=...` ➔ loads compound in 3D viewer.
     - `moluxis://bookmarks` ➔ opens Bookmarks & Recent History modal.
     - `moluxis://category?name=...` ➔ switches featured category tab.
     - `moluxis://update` ➔ displays update modal.
7. **Developer Diagnostics Lab (`DevTestModal`):**
   - Accessible by long-pressing the Moluxis header logo in development builds (`IS_DEV_TEST_ENABLED`).
   - Displays live permissions, WorkManager registration, snooze timestamps, and scheduled notification counts.
   - Offers 1-tap testing for immediate notifications, delayed spotlights (5s), simulated upgrades, and storage resets.

---

## 2. Interactive Atom Picking & Geometric Measurement Calculator

### What Has Been Done

Users can tap atoms directly on the 3D WebGL canvas to compute precise molecular geometry in real time.

#### Architecture & How It Works

1. **WebView Atom Picking Protocol:**
   - `setupAtomPicking()` in `src/constants/viewerHtml.ts` registers a click handler on 3Dmol.js:
     ```javascript
     viewer.setClickable({}, isMeasurementMode, function(atom) { ... });
     ```
   - When an atom is tapped, the WebView posts an `ATOM_PICKED` message to React Native containing the atom's serial, index, element symbol, and 3D spatial coordinates (`x, y, z`).
2. **Three Measurement Modes:**
   - **Bond Length (2 atoms)**: Calculates Euclidean distance in Ångströms ($d = \sqrt{\Delta x^2 + \Delta y^2 + \Delta z^2}$).
   - **Bond Angle (3 atoms)**: Calculates the bond angle in degrees at the vertex atom using vector dot products.
   - **Dihedral / Torsion Angle (4 atoms)**: Computes the dihedral angle $\tau \in [-180^\circ, 180^\circ]$ between planes formed by atoms $(A, B, C)$ and $(B, C, D)$ using vector cross and dot products.
3. **Synchronized 3D Canvas Visuals:**
   - Tapped atoms are highlighted with color-coded wireframe spheres (`ATOM_MESH_COLORS`).
   - Dashed 3D cylinders/struts connect the selected atoms.
   - Floating 3D text labels display the computed distance or angle directly in the 3D scene.
4. **Interactive UI & Gesture Safety:**
   - Dedicated `MeasurementPanel.tsx` presents mode selection tabs, atom selection chips with element badges, and live measurement readout cards.
   - Toggled via the **Measure** button in `FloatingDock.tsx`.
   - Automatically switches 2D structures into 3D representation if available.
   - Integrates `triggerMeasurementHaptic()` (`ImpactFeedbackStyle.Medium`) on atom selection.
   - Handles Android hardware back button to clear active selections or exit measurement mode gracefully.
