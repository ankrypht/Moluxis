# 🧪 Moluxis Android Innovations & Roadmap Guide

This document captures Android-focused architectural patterns and feature blueprints for **Moluxis**, covering:

1. **Expo Widgets (`expo-widgets`)** & **Jetpack Compose** for interactive home screen widgets.
2. **Expo Notifications (`expo-notifications`)** for release alerts, molecule spotlights, and background task signals.
3. **In-App Update & Changelog System** for surfacing release highlights directly inside the app.
4. **Advanced 3D Scientific Tools**: Bond measurements, 3D printing STL export, and electrostatic surfaces.
5. **Android-Native Integrations**: Launcher App Shortcuts, AR Scene Viewer, and Voice Search.
6. **Chemistry Education & Discovery**: Interactive Periodic Table explorer and curated offline subject packs.

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
- **Deep Link Navigation**: Tapping the card body opens Moluxis directly into the 3D viewer for that CID/query (`moluxis://compound/caffeine`).

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
   - Jetpack Compose re-renders to display:
     `"Answer: Aspirin (Acetylsalicylic Acid)"` with IUPAC name and a `"Next Card"` button.
3. No app launch required for playing through cards.

---

### 4. 🔔 "Active Molecule Inspector" (Android Notification Shade Card)

- **API**: `createCustomNotification` from `expo-widgets`
- **Category**: Multi-tasking Companion
- **Target Audience**: Users referencing chemical properties while reading research papers or writing notes.

#### Concept & Layout

When enabled, putting Moluxis in the background while viewing a compound posts an ongoing, custom-styled notification card to the Android notification shade:

- **Collapsed State (64 dp)**:
  `[🧪 Moluxis] Caffeine (C₈H₁₀N₄O₂) • 194.19 g/mol`
- **Expanded State (up to 256 dp)**:
  Full chemical properties overview (LogP, TPSA, H-Bonds, Boiling/Melting points, GHS safety alerts) with a button to **"Resume 3D Inspection"**.

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
import { useEffect } from "react";
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

// 2. Deep link handler (opens 3D viewer for widget taps)
Linking.addEventListener("url", ({ url }) => {
  const parsed = Linking.parse(url);
  if (parsed.hostname === "molecule" && parsed.queryParams?.query) {
    handleSelectMolecule(String(parsed.queryParams.query));
  }
});
```

### 🌐 Unified Deep Linking Routing Schema (`moluxis://`)

To maintain clean and unambiguous navigation across Widgets, Notifications, Quick Actions, and Web shares, Moluxis standardizes on the following URI scheme:

| URI Route             | Query / Path Params                   | Destination & Action                                              |
| :-------------------- | :------------------------------------ | :---------------------------------------------------------------- |
| `moluxis://molecule`  | `?query={name_or_cid}`                | Searches and loads the molecule or crystal in the 3D WebGL viewer |
| `moluxis://search`    | `?q={optional_query}`                 | Opens the search drawer with the search bar focused               |
| `moluxis://category`  | `?name={crystals\|biochemicals\|...}` | Switches the Featured list filter tab directly                    |
| `moluxis://bookmarks` | None                                  | Opens the Bookmarks & Recent History modal                        |
| `moluxis://update`    | `?version={version}`                  | Opens the `UpdateAvailableModal` dialog                           |

---

# 🔔 PART 2: Android Notifications & In-App Update Engine (`expo-notifications`)

This section covers using **`expo-notifications`** to notify users of new releases, highlight changelogs, deliver chemical spotlights, and present in-app modals.

---

## 🎯 Concept 1: Dual-Channel Update Checker & "What's New" Engine (Play Store vs. GitHub APK)

Moluxis is distributed through two parallel channels:

1. **Google Play Store**: Standard auto-updates or manual update via Play Store.
2. **GitHub Releases (Direct APK)**: Sideloaded APK for users on deGoogled devices, open-source enthusiasts, or restricted regions.

### The Dual Distribution Challenge

- Sideloaded APK users **cannot or do not want to update through Google Play Store** (they may lack Google Play Services, have signing key differences, or encounter "Item not available" errors).
- Google Play Store users **should update through Google Play** for safety and automated background downloads.
- When an update is detected, the app must route users to the **correct place**:
  - Play Store users ➔ `market://details?id=com.ankushsarkar.moluxis` (fallback: `https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis`).
  - GitHub APK users ➔ Direct link to latest release APK or `https://github.com/ankrypht/Moluxis/releases/latest`.

### 3-Tier Installer Source Detection Strategy

```
┌────────────────────────────────────────────────────────┐
│ 1. Build Flag (`APP_DISTRIBUTION`)                     │
│    Set in EAS profile (playstore vs github)            │
└──────────────────────────┬─────────────────────────────┘
                           │ Fallback if universal APK
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Runtime Detection (`getInstallReferrerAsync`)       │
│    Succeeds with Play parameters ➔ Play Store          │
│    Fails/empty ➔ Sideloaded GitHub APK                 │
└──────────────────────────┬─────────────────────────────┘
                           │ User Override
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Adaptive Dual-Action UI                             │
│    Primary button matches detected source;             │
│    Secondary button allows 1-tap manual switch         │
└────────────────────────────────────────────────────────┘
```

1. **Tier 1 — Build-Time Flavor (100% Reliable)**:
   In `app.config.js`:
   ```javascript
   const DISTRIBUTION = process.env.APP_DISTRIBUTION || "playstore"; // "playstore" | "github"
   // In extra: { distributionChannel: DISTRIBUTION }
   ```
   - Play Store builds (`npm run build-prod-eas`): set `APP_DISTRIBUTION=playstore`.
   - GitHub APK builds (`npm run build-eas` / GitHub Actions release): set `APP_DISTRIBUTION=github`.
2. **Tier 2 — Runtime Auto-Detection**:
   If building a single universal APK, detect the installer using `expo-application`:
   - `Application.getInstallReferrerAsync()`: If installed from Google Play, resolves with `utm_source=google-play`.
   - If installed manually via APK package installer, it throws or returns no referrer.
3. **Tier 3 — Adaptive UI with Manual Override**:
   The "Update Available" modal displays the primary action based on the detected channel, plus a secondary fallback link:
   - Primary: `[ ⬇️ Download GitHub APK (v2.2.0) ]`
   - Secondary link: _"Installed from Google Play instead? Tap here"_ (or vice-versa).

---

### The Complete Update Lifecycle (Pre-Update & Post-Update)

```
[ App Launch / Periodic Background Check ]
                       │
                       ▼
    Fetch https://api.github.com/repos/ankrypht/Moluxis/releases/latest
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
   No Update                    New Version Found (v2.2.0 > v2.1.1)
   (Continue)                          │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
           🔔 Notification Sent             📱 In-App Dialog Shown
           "Moluxis v2.2.0 Available!"      "New Update Available"
           [ Update ]  [ Changelog ]        • Shows Release Notes
                                            • Primary: [ Update (Play/APK) ]
                                            • Secondary: [ Switch Source ]
                                            • [ Remind Me Later (24h) ]
                                                       │
                                                       ▼
                                            User updates & relaunches
                                                       │
                                                       ▼
                                            📱 "What's New in v2.2.0" Modal
                                            (Full categorized changelog)
```

1. **Single Source of Truth (GitHub Releases API)**:
   - Endpoint: `https://api.github.com/repos/ankrypht/Moluxis/releases/latest`
   - Zero backend servers required. It returns:
     - `tag_name`: Current latest release tag (e.g. `v2.2.0`).
     - `name`: Release title (e.g. `Moluxis 2.2.0: Crystal Lattices & 4K Export`).
     - `body`: Markdown changelog directly written in GitHub Releases.
     - `assets`: Array of download assets containing `moluxis-v2.2.0.apk`.
     - `html_url`: Web link to release page.
2. **Pre-Update Alert**:
   - Compares latest tag against `Application.nativeApplicationVersion` (e.g., `2.2.0` vs `2.1.1`).
   - If an update is available and not snoozed within the last 24 hours:
     - Triggers Android notification (`app_updates` channel).
     - Renders `UpdateAvailableModal.tsx` with release highlights and the correct update buttons.
3. **Post-Update Confirmation**:
   - Once the user updates and opens the new version, `lastSeenVersion !== currentVersion`.
   - Pops up `WhatsNewModal.tsx` celebrating the update with categorized highlights.

---

## 🧪 Additional Chemistry Notification Concepts

### 🌟 Concept 2: Weekly "Molecule Spotlight" (Local Scheduled)

- **Trigger**: Scheduled weekly via `SchedulableTriggerInputTypes.CALENDAR` (e.g. Saturdays at 10:00 AM).
- **Payload**:
  - _Title_: `🔬 Molecule Spotlight: Serotonin (C₁₀H₁₂N₂O)`
  - _Body_: `The key chemical for mood regulation and memory. Tap to inspect its 3D neurotransmitter structure!`
- **Action**: Deep-links directly to `moluxis://molecule?query=Serotonin`.
- **Advantage**: 100% offline, zero server requirement, cycles through `FEATURED_MOLECULES` to keep users engaged.

### 📸 Concept 3: "3D Snapshot Export Complete"

- **Trigger**: Fires when exporting 4K snapshots or generating shareable graphics if the app is placed in the background.
- **Payload**:
  - _Title_: `Snapshot Saved! 📸`
  - _Body_: `High-resolution 3D model of Caffeine saved to your gallery.`
  - Quick action: `[ Share Image ]`.

### 🔖 Concept 4: "Revisit Your Pinned Compounds" (Smart Retention)

- **Trigger**: Fires if the user hasn't opened the app in 14 days and has bookmarked molecules in `useCompoundHistoryAndBookmarks`.
- **Payload**:
  - _Title_: `Your Molecular Library Awaits 🧪`
  - _Body_: `You have saved molecules including Aspirin and Glucose. Tap to continue exploring!`

---

## ⚙️ Android 13+ Notification Setup & Channels

Android 13+ (API 33+) requires runtime permission (`POST_NOTIFICATIONS`) and explicit **Notification Channels**.

### 1. Configuration in `app.config.js`

```javascript
export default {
  // ...
  scheme: "moluxis",
  android: {
    // ...
    permissions: [
      "android.permission.POST_NOTIFICATIONS", // Required on Android 13+ (API 33+)
    ],
  },
  plugins: [
    // ...
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png", // 96x96 all-white PNG with transparency
        color: "#10B981", // Emerald accent matching Moluxis brand
        defaultChannel: "app_updates",
      },
    ],
  ],
};
```

### 2. Notification Service (`src/services/notificationService.ts`)

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { FEATURED_MOLECULES } from "../constants/featuredMolecules";

// Foreground presentation handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Configure Android notification channels
 */
export async function setupNotificationChannels() {
  if (Platform.OS !== "android") return;

  // Channel 1: App Updates & Releases (High Importance, heads-up banner)
  await Notifications.setNotificationChannelAsync("app_updates", {
    name: "App Updates & Releases",
    description: "Notifications for new features, OTA updates, and changelogs",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#10B981",
  });

  // Channel 2: Discoveries (Default Importance, periodic learning)
  await Notifications.setNotificationChannelAsync("discoveries", {
    name: "Molecule Discoveries",
    description: "Weekly featured molecule spotlights and chemistry trivia",
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  // Channel 3: Exports & Tasks (Low Importance, silent completion alerts)
  await Notifications.setNotificationChannelAsync("exports", {
    name: "Exports & Snapshots",
    description: "Completion alerts for high-res 3D model snapshots",
    importance: Notifications.AndroidImportance.LOW,
  });
}

/**
 * Request notification permissions (required on Android 13+)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Schedule weekly Molecule Spotlight
 */
export async function scheduleWeeklyMoleculeSpotlight() {
  // Cancel previous spotlight schedules to avoid duplicates
  await Notifications.cancelScheduledNotificationAsync(
    "weekly_spotlight",
  ).catch(() => {});

  const randomIndex = Math.floor(Math.random() * FEATURED_MOLECULES.length);
  const molecule = FEATURED_MOLECULES[randomIndex];
  if (!molecule) return;

  await Notifications.scheduleNotificationAsync({
    identifier: "weekly_spotlight",
    content: {
      title: `🔬 Molecule Spotlight: ${molecule.name} (${molecule.formula})`,
      body: `Explore the 3D structure and chemical properties of this ${molecule.tag.toLowerCase()}!`,
      data: {
        url: `moluxis://molecule?query=${encodeURIComponent(molecule.query)}`,
      },
      channelId: "discoveries",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 7, // Every Saturday
      hour: 10,
      minute: 0,
      repeats: true,
    },
  });
}
```

---

## 📦 In-App Update Engine & Modal Blueprints

### A. Dual-Channel Update Checker Service (`src/services/appUpdateChecker.ts`)

Handles version checking against GitHub Releases, auto-detects Play Store vs GitHub APK installation, and handles snoozing and update navigation.

```typescript
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import pkg from "../../package.json";

const GITHUB_REPO = "ankrypht/Moluxis";
const SNOOZE_UPDATE_KEY = "@moluxis_update_snooze_until";

export type DistributionSource = "playstore" | "github";

export interface GitHubReleaseInfo {
  version: string;
  releaseTitle: string;
  changelog: string;
  releaseUrl: string;
  apkDownloadUrl?: string;
  isNewer: boolean;
  source: DistributionSource;
}

/**
 * Compare semantic versions (e.g. "2.2.0" vs "2.1.1", "2.2.0-rc.1" vs "2.1.1")
 * Strips 'v' prefix, build metadata, and pre-release identifiers.
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal
 */
export function compareSemver(v1: string, v2: string): number {
  const sanitize = (v: string) =>
    v.replace(/^v/, "").split("-")[0].split("+")[0].trim();
  const parts1 = sanitize(v1)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  const parts2 = sanitize(v2)
    .split(".")
    .map((n) => parseInt(n, 10) || 0);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Detect whether the app was installed from Google Play Store or sideloaded from GitHub
 */
export async function detectDistributionSource(): Promise<DistributionSource> {
  // 1. Check build-time config if configured (e.g. via EAS profile)
  const buildChannel = Constants.expoConfig?.extra?.distributionChannel;
  if (buildChannel === "github" || buildChannel === "playstore") {
    return buildChannel;
  }

  // 2. Runtime detection via Android Install Referrer
  try {
    if (Platform.OS === "android") {
      const referrer = await Application.getInstallReferrerAsync();
      if (referrer && referrer.includes("google-play")) {
        return "playstore";
      }
    }
  } catch {
    // Sideloaded APKs throw ERR_APPLICATION_INSTALL_REFERRER_UNAVAILABLE
    return "github";
  }

  return "github";
}

/**
 * Fetch latest release from GitHub API and check if a new version is available
 */
export async function checkForAppUpdate(): Promise<GitHubReleaseInfo | null> {
  try {
    // Respect 24-hour snooze if user clicked "Remind me later"
    const snoozedUntil = await AsyncStorage.getItem(SNOOZE_UPDATE_KEY);
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
      return null;
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    const latestVersion = (data.tag_name || "").replace(/^v/, "");
    const currentVersion = Application.nativeApplicationVersion || pkg.version;

    const isNewer = compareSemver(latestVersion, currentVersion) > 0;
    if (!isNewer) return null;

    // Find direct .apk asset if available in the release
    const apkAsset = data.assets?.find(
      (asset: { name: string; browser_download_url: string }) =>
        asset.name.endsWith(".apk"),
    );

    const source = await detectDistributionSource();

    return {
      version: latestVersion,
      releaseTitle: data.name || `Moluxis v${latestVersion}`,
      changelog:
        data.body || "New features and performance improvements are available.",
      releaseUrl:
        data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
      apkDownloadUrl: apkAsset?.browser_download_url,
      isNewer: true,
      source,
    };
  } catch (error) {
    console.warn("Update check failed:", error);
    return null;
  }
}

/**
 * Post an Android system notification announcing the update
 */
export async function notifyUpdateAvailable(info: GitHubReleaseInfo) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Moluxis Update Available (v${info.version}) 🚀`,
      body: `Tap to update via ${info.source === "playstore" ? "Google Play" : "GitHub APK"}.`,
      data: { url: "moluxis://update", version: info.version },
      channelId: "app_updates",
    },
    trigger: null, // Send immediately
  });
}

/**
 * Snooze update prompts for 24 hours
 */
export async function snoozeUpdatePrompt(hours = 24) {
  const until = Date.now() + hours * 60 * 60 * 1000;
  await AsyncStorage.setItem(SNOOZE_UPDATE_KEY, until.toString());
}

/**
 * Trigger update action based on distribution target.
 * Note: Avoids Linking.canOpenURL("market://...") because on Android 11+ (API 30+),
 * package visibility filtering causes canOpenURL to fail unless declared in <queries>.
 * Wrapping openURL in a try/catch guarantees seamless fallback to the Play Store web link.
 */
export async function openUpdateDestination(
  target: DistributionSource,
  info: GitHubReleaseInfo,
) {
  if (target === "playstore") {
    const playStoreUrl = "market://details?id=com.ankushsarkar.moluxis";
    const webFallbackUrl =
      "https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis";
    try {
      await Linking.openURL(playStoreUrl);
    } catch {
      await Linking.openURL(webFallbackUrl);
    }
  } else {
    // Sideloaded / GitHub APK: download direct APK or open release page
    const url = info.apkDownloadUrl || info.releaseUrl;
    await Linking.openURL(url);
  }
}
```

---

### B. "Update Available" Pre-Update Modal (`src/components/UpdateAvailableModal.tsx`)

Presents the update dialog with adaptive primary/secondary buttons based on the user's installation channel.

```tsx
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  GitHubReleaseInfo,
  DistributionSource,
  openUpdateDestination,
  snoozeUpdatePrompt,
} from "../services/appUpdateChecker";

interface UpdateAvailableModalProps {
  visible: boolean;
  releaseInfo: GitHubReleaseInfo;
  onDismiss: () => void;
}

export const UpdateAvailableModal: React.FC<UpdateAvailableModalProps> = ({
  visible,
  releaseInfo,
  onDismiss,
}) => {
  // Allow user to toggle between Play Store and GitHub APK if auto-detection missed
  const [activeSource, setActiveSource] = useState<DistributionSource>(
    releaseInfo.source,
  );

  const handleUpdate = async () => {
    await openUpdateDestination(activeSource, releaseInfo);
    onDismiss();
  };

  const handleRemindLater = async () => {
    await snoozeUpdatePrompt(24);
    onDismiss();
  };

  const isPlayStore = activeSource === "playstore";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>
                  v{releaseInfo.version} Available
                </Text>
              </View>
              <View style={styles.sourceBadge}>
                <Ionicons
                  name={isPlayStore ? "logo-google-playstore" : "logo-github"}
                  size={12}
                  color="#9CA3AF"
                />
                <Text style={styles.sourceBadgeText}>
                  {isPlayStore ? "Play Store" : "GitHub APK"}
                </Text>
              </View>
            </View>

            <Text style={styles.title}>{releaseInfo.releaseTitle}</Text>
          </View>

          {/* Release Notes */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionHeader}>What's in this update:</Text>
            <Text style={styles.changelogText}>{releaseInfo.changelog}</Text>
          </ScrollView>

          {/* Primary Action Button */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleUpdate}>
            <Ionicons
              name={
                isPlayStore ? "arrow-up-circle-outline" : "download-outline"
              }
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryBtnText}>
              {isPlayStore
                ? "Update on Google Play"
                : "Download APK from GitHub"}
            </Text>
          </TouchableOpacity>

          {/* Secondary Switch Source Link */}
          <TouchableOpacity
            style={styles.switchSourceBtn}
            onPress={() =>
              setActiveSource(isPlayStore ? "github" : "playstore")
            }
          >
            <Text style={styles.switchSourceText}>
              {isPlayStore
                ? "Installed via GitHub APK? Tap to download APK instead"
                : "Prefer Google Play? Tap to open in Play Store"}
            </Text>
          </TouchableOpacity>

          {/* Remind Me Later Button */}
          <TouchableOpacity
            style={styles.snoozeBtn}
            onPress={handleRemindLater}
          >
            <Text style={styles.snoozeBtnText}>Remind Me Later (24h)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#121212",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
  },
  header: {
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  versionBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  versionText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 12,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  sourceBadgeText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "500",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 4,
  },
  scrollArea: {
    maxHeight: 180,
    marginVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 12,
  },
  sectionHeader: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  changelogText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 14,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  switchSourceBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  switchSourceText: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  snoozeBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  snoozeBtnText: {
    color: "#6B7280",
    fontSize: 12,
  },
});
```

---

### C. Post-Update "What's New" Service (`src/services/updateNoticeService.ts`)

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import pkg from "../../package.json";

const LAST_SEEN_VERSION_KEY = "@moluxis_last_seen_version";

export interface ReleaseHighlight {
  version: string;
  releaseDate: string;
  features: string[];
  improvements: string[];
  fixes: string[];
}

export const CURRENT_RELEASE_NOTES: ReleaseHighlight = {
  version: pkg.version,
  releaseDate: "October 2026",
  features: [
    "Curated Featured Molecules showcase on launch",
    "Category pill tabs with persistent tab filters",
    "High-resolution 3D canvas snapshot export & sharing",
  ],
  improvements: [
    "Rich subscript formula typography (C₈H₁₀N₄O₂, H₂O)",
    "60 FPS throttled WebGL loop eliminating ANRs",
    "Multi-tier LRU caching backed by disk storage",
  ],
  fixes: [
    "Prevented redundant WebView re-initialization",
    "Fixed bookmark merging and search race conditions",
  ],
};

export async function checkVersionAndTriggerNotice(): Promise<{
  shouldShowModal: boolean;
}> {
  try {
    const lastSeenVersion = await AsyncStorage.getItem(LAST_SEEN_VERSION_KEY);
    const currentVersion = pkg.version;

    if (!lastSeenVersion) {
      // First install: store current version silently
      await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, currentVersion);
      return { shouldShowModal: false };
    }

    if (lastSeenVersion !== currentVersion) {
      // Post an Android notification announcing the update
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Moluxis Updated to v${currentVersion}! 🧪`,
          body: `Discover new 3D features, crystal lattices, and performance enhancements.`,
          data: { type: "OPEN_CHANGELOG", version: currentVersion },
          channelId: "app_updates",
        },
        trigger: null, // Send immediately
      });

      return { shouldShowModal: true };
    }
  } catch (error) {
    console.warn("Error checking version notice:", error);
  }

  return { shouldShowModal: false };
}

export async function markCurrentVersionSeen() {
  await AsyncStorage.setItem(LAST_SEEN_VERSION_KEY, pkg.version);
}
```

### D. "What's New" Modal Component (`src/components/WhatsNewModal.tsx`)

```tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  CURRENT_RELEASE_NOTES,
  markCurrentVersionSeen,
} from "../services/updateNoticeService";

interface WhatsNewModalProps {
  visible: boolean;
  onClose: () => void;
  onExploreFeatures?: () => void;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  visible,
  onClose,
  onExploreFeatures,
}) => {
  const handleDismiss = async () => {
    await markCurrentVersionSeen();
    onClose();
  };

  const handleExplore = async () => {
    await markCurrentVersionSeen();
    onClose();
    onExploreFeatures?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Version Header Pill */}
          <View style={styles.header}>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>
                v{CURRENT_RELEASE_NOTES.version}
              </Text>
            </View>
            <Text style={styles.title}>What's New in Moluxis</Text>
            <Text style={styles.releaseDate}>
              {CURRENT_RELEASE_NOTES.releaseDate}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Features Section */}
            <Text style={styles.sectionTitle}>✨ New Features</Text>
            {CURRENT_RELEASE_NOTES.features.map((item, idx) => (
              <View key={`feat-${idx}`} style={styles.itemRow}>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color="#10B981"
                  style={styles.itemIcon}
                />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}

            {/* Performance Section */}
            <Text style={styles.sectionTitle}>⚡ Performance & UI</Text>
            {CURRENT_RELEASE_NOTES.improvements.map((item, idx) => (
              <View key={`imp-${idx}`} style={styles.itemRow}>
                <Ionicons
                  name="flash"
                  size={16}
                  color="#38BDF8"
                  style={styles.itemIcon}
                />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}

            {/* Fixes Section */}
            <Text style={styles.sectionTitle}>🛠️ Bug Fixes</Text>
            {CURRENT_RELEASE_NOTES.fixes.map((item, idx) => (
              <View key={`fix-${idx}`} style={styles.itemRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#A78BFA"
                  style={styles.itemIcon}
                />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss}>
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exploreBtn} onPress={handleExplore}>
              <Text style={styles.exploreBtnText}>Explore Features</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#121212",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  versionPill: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  versionText: {
    color: "#10B981",
    fontWeight: "700",
    fontSize: 13,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  releaseDate: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    marginVertical: 8,
  },
  sectionTitle: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  itemText: {
    color: "#D1D5DB",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    alignItems: "center",
  },
  dismissBtnText: {
    color: "#9CA3AF",
    fontWeight: "600",
  },
  exploreBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#10B981",
    alignItems: "center",
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
```

---

# 🔬 PART 3: Advanced 3D Scientific & Analysis Tools

These features transform Moluxis from a 3D visualization viewer into an active scientific workbench for chemistry students, researchers, and hobbyists.

---

### 1. 📏 Interactive Atom Picking: Bond Length & Bond Angle Calculator

- **Concept**: In 3Dmol.js, users can tap directly on atoms in the canvas to measure geometric properties:
  - **Bond Length (2 atoms selected)**: Calculates Euclidean distance in Ångströms (e.g., $d(C-O) = 1.43\text{ Å}$). Renders a dashed measurement line and a floating label between the two atoms.
  - **Bond Angle (3 atoms selected)**: Calculates the bond angle in degrees (e.g., $\angle(H-O-H) = 104.5^\circ$ for Water). Renders an arc overlay.
  - **Dihedral / Torsion Angle (4 atoms selected)**: Calculates the dihedral torsion angle (critical for conformational analysis of proteins and organic molecules).
- **Technical Implementation & WebView RPC Protocol**:
  - In `viewerHtml.ts`, register a click listener on the active model when measurement mode is enabled:
    ```javascript
    viewer.setClickable({}, true, function (atom, viewer, event, container) {
      if (!isMeasurementMode) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "ATOM_PICKED",
          atom: {
            serial: atom.serial,
            elem: atom.elem,
            x: atom.x,
            y: atom.y,
            z: atom.z,
          },
        }),
      );
    });
    ```
  - **React Native to WebView Messages**:
    - `{ type: 'SET_MEASUREMENT_MODE', mode: 'distance' | 'angle' | 'dihedral' | 'none' }`
    - `{ type: 'DRAW_MEASUREMENT_LINE', p1: {x, y, z}, p2: {x, y, z}, label: '1.43 Å' }`:
      Invokes `viewer.addLine({ dashed: true, start: p1, end: p2, color: 'white' })` and `viewer.addLabel(label, { position: midpoint, fontSize: 12, backgroundColor: '#10B981' })`.
    - `{ type: 'CLEAR_MEASUREMENTS' }`: Clears custom measurement shapes and labels from the scene.
  - **State & Feedback**:
    - Display the calculated measurement in a sleek floating bottom chip overlay in `MoleculeViewer.tsx` with haptic feedback (`Haptics.impactAsync(ImpactFeedbackStyle.Medium)`) on each atom selection, plus a "Clear" button.

---

### 2. 🖨️ 3D Printing STL / GLTF Model Export

- **Concept**: Allow users to export any compound or crystal unit cell directly as a `.stl` (Stereolithography) or `.gltf` 3D model file ready for 3D printers or external CAD software.
- **Why it's huge**: Chemistry teachers and students love physical ball-and-stick models. Exporting directly to a 3D printable mesh makes Moluxis an indispensable classroom companion.
- **Technical Implementation**:
  - **Two-Tier Export Strategy**:
    1. **Native 3Dmol VRML Export**: 3Dmol.js includes `viewer.exportVRML()` out-of-the-box for standard 3D chemistry interchange.
    2. **Binary STL Generator in WebView**:
       - Iterate over the current model's atoms (`model.selectedAtoms({})`) and bonds (`atom.bonds`).
       - Generate triangulated sphere meshes at atomic positions and cylindrical struts along bonds.
       - Encode the triangle normals and vertices into a standard binary STL ArrayBuffer.
       - Base64-encode and stream to React Native via `window.ReactNativeWebView.postMessage({ type: 'STL_EXPORT_RESULT', base64Data: '...' })`.
  - In React Native:
    - Save to cache via `FileSystem.writeAsStringAsync(path, base64Data, { encoding: FileSystem.EncodingType.Base64 })`.
    - Present the system file share sheet via `Sharing.shareAsync(path, { mimeType: 'model/stl', dialogTitle: 'Share 3D Printable STL' })`.

---

### 3. 🌐 Electrostatic Potential (ESP) & Molecular Surfaces

- **Concept**: Beyond traditional Ball & Stick or Space-Fill, render actual electron density and solvent accessible surfaces.
- **Surfaces Supported**:
  - **Van der Waals (VDW) Surface**: Outlines the volume occupied by atoms (`$3Dmol.SurfaceType.VDW`).
  - **Solvent Accessible Surface (SAS)**: Shows where water/solvent molecules can access the compound (`$3Dmol.SurfaceType.SAS`).
  - **Electrostatic Potential Coloring (ESP)**: Colors the surface from red (electronegative/partial negative charge) to blue (electropositive/partial positive charge).
- **Technical Implementation**:
  - 3Dmol.js has built-in surface calculation:
    ```javascript
    viewer.addSurface($3Dmol.SurfaceType.VDW, {
      opacity: 0.85,
      colorscheme: "electrostatic", // uses Gasteiger or MMFF94 partial charges
    });
    ```
  - **Performance Optimization**:
    - Surface tessellation is computationally expensive on mobile GPUs.
    - Surface rendering is computed asynchronously with a loading spinner overlay (`isGeneratingSurface`).
    - Surfaces are cleared on unmount or molecule switch using `viewer.removeAllSurfaces()`.
  - Add a "Surface" toggle in the existing visual styles menu next to Ball & Stick, Stick, Wireframe, and Sphere.

---

### 4. ⚖️ Dual-Molecule Split Comparison Mode

- **Concept**: An adaptive side-by-side split screen allowing users to inspect two molecules simultaneously.
- **Use Cases**:
  - **Enantiomers & Stereoisomers**: Compare D-Glucose vs L-Glucose or Thalidomide (R) vs (S).
  - **Allotropes / Polymorphs**: Compare Diamond vs Graphite vs Buckminsterfullerene.
  - **Drug Discovery**: Compare a drug candidate against its biological target ligand (e.g. Morphine vs Endorphin active site).
- **Controls**:
  - Synchronized rotation toggle (rotating one rotates the other in lockstep) or independent rotation.

---

# 🤖 PART 4: Android-Native Integrations

Features taking full advantage of the Android operating system to make Moluxis feel like a first-party Google / Android experience.

---

### 1. ⚡ Android App Launcher Quick Actions (`expo-quick-actions`)

- **Concept**: Long-pressing the Moluxis icon on the Android launcher displays instant shortcuts:
  - 🔍 **Search Compound**: Immediately launches app with keyboard up and search drawer focused.
  - 💎 **Explore Crystals**: Jumps directly to COD Mineral Crystal Lattices.
  - ⭐ **Bookmarks**: Opens the saved bookmarks shelf.
  - 🎲 **Surprise Me**: Picks a random molecule from 100M+ PubChem library.
- **Implementation**:
  ```typescript
  // 1. Register Launcher Shortcuts (e.g. in index.ts or App.tsx)
  import * as QuickActions from "expo-quick-actions";

  QuickActions.setItems([
    {
      id: "search",
      title: "Search Compound",
      subtitle: "Look up formula or name",
      icon: "search",
      params: { action: "FOCUS_SEARCH" },
    },
    {
      id: "crystals",
      title: "Explore Crystals",
      subtitle: "Browse 3D mineral lattices",
      icon: "diamond",
      params: { category: "crystals" },
    },
    {
      id: "random",
      title: "Surprise Me",
      subtitle: "Discover an unexpected compound",
      icon: "shuffle",
      params: { action: "RANDOM_MOLECULE" },
    },
  ]);

  // 2. Handle Quick Action launches in App.tsx
  QuickActions.useQuickActionCallback((action) => {
    if (action?.params?.action === "FOCUS_SEARCH") {
      setIsSearchDrawerOpen(true);
    } else if (action?.params?.category) {
      setSelectedCategory(String(action.params.category));
    } else if (action?.params?.action === "RANDOM_MOLECULE") {
      handleSelectRandomMolecule();
    }
  });
  ```

---

### 2. 👓 Augmented Reality (AR) Tabletop Mode (Android Scene Viewer)

- **Concept**: Place a life-size or table-top 3D molecule / mineral lattice right on your desk or living room floor using Android's native **Scene Viewer** / ARCore.
- **User Flow**:
  - On the 3D canvas, tap the **"View in AR"** pill.
  - Moluxis exports the current molecule to a temporary `.glb` file.
  - Launches Android Scene Viewer via intent:
    `intent://arvr.google.com/scene-viewer/1.0?file=file://...#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;`
  - The user can walk around a 6-foot DNA helix or examine a giant NaCl crystal lattice in their room!

---

### 3. 🎙️ Voice Chemical Search

- **Concept**: Hands-free search for students in chemistry labs or users on the move.
- **Feature**: A microphone button in the floating header that listens for chemical names ("Sodium Chloride", "Acetylsalicylic Acid", "Caffeine") and triggers search with speech-to-text.

---

### 4. 🔄 Android 14+ Predictive Back Navigation

- **Concept**: Upgrade the navigation feel with Android's predictive back gesture animation.
- **Feature**: Swiping from the left or right edge smoothly scales and dismisses modals (e.g. Info Sheet, History, Share Export) with a predictive preview animation instead of an abrupt dismissal.
- **Config Note**: In `app.config.js`, `android.predictiveBackGestureEnabled` is currently `false`. Switch to `true` when adopting Android 14+ (API 34) native navigation animations.

---

# 📚 PART 5: Chemistry Education & Discovery

Transforming Moluxis into the ultimate educational and discovery platform for chemistry education.

---

### 1. 🧪 Interactive Periodic Table of Elements

- **Concept**: A dedicated, dark-themed interactive periodic table sheet.
- **Features**:
  - Color-coded by element family (Alkali metals, Halogens, Noble gases, Transition metals, Actinides, Lanthanides).
  - Tapping an element (e.g. **Titanium (Ti)**) displays:
    - Atomic number, mass, electron configuration, electronegativity, oxidation states.
    - **"Iconic Compounds Containing Ti"**: 1-tap shortcuts to inspect Titanium Dioxide ($TiO_2$), Rutile crystal lattice, Titanocene, etc.

---

### 2. 📦 Offline Curated Molecule Packs

- **Concept**: Allow users to download curated bundles for 100% offline access when working in subterranean laboratories or offline study areas:
  - **Pack 1: The Essential 20 Amino Acids** (Alanine to Valine with stereochemistry).
  - **Pack 2: Neurotransmitters & Hormones** (Dopamine, Serotonin, Epinephrine, Oxytocin).
  - **Pack 3: Top 100 Prescription Pharmaceuticals** (Penicillin, Metformin, Atorvastatin, Paracetamol).
  - **Pack 4: Iconic Gemstones & Minerals** (Diamond, Ruby, Emerald, Quartz, Pyrite unit cells).
- **Storage**: Cached locally in SQLite or FileSystem as JSON bundles for 0ms instant loading.

---

# 📋 Comprehensive Phased Implementation Checklist

### Phase 1: Home Screen Widgets (`expo-widgets`)

- [ ] Install `expo-widgets` and `@expo/ui`.
- [ ] Configure `app.config.js` with `enableAndroid: true` and 4×2 grid size.
- [ ] Implement `src/widgets/MoleculeOfTheDayWidget.tsx` with `@expo/ui/jetpack-compose`.
- [ ] Set up deep linking scheme (`moluxis://`) in `app.config.js` and link listeners in `App.tsx`.
- [ ] Wire up `updateSnapshot` in `useMoleculeSearch` to sync active molecules to the widget.

### Phase 2: Notifications & Update Alerts (`expo-notifications`)

- [ ] Install `expo-notifications` and `expo-application`.
- [ ] Configure notification icons and color in `app.config.js`.
- [ ] Implement `setupNotificationChannels` in `src/services/notificationService.ts`.
- [ ] Implement `appUpdateChecker.ts` to check GitHub Releases API and detect Play Store vs. GitHub APK.
- [ ] Implement `checkVersionAndTriggerNotice` in `src/services/updateNoticeService.ts`.
- [ ] Schedule offline weekly Molecule Spotlight.

### Phase 3: In-App Update & "What's New" Modals

- [ ] Create `src/components/UpdateAvailableModal.tsx` (Pre-update dialog with smart Play Store / GitHub APK buttons & 24h snooze).
- [ ] Create `src/components/WhatsNewModal.tsx` (Post-update changelog dialog with categorized release highlights).
- [ ] Hook `checkForAppUpdate` and `checkVersionAndTriggerNotice` on app startup in `App.tsx`.
- [ ] Connect "Explore Features" button to navigate to featured showcase or newly added crystal dataset.

### Phase 4: Native Android Quick Actions & App Shortcuts

- [ ] Install `expo-quick-actions`.
- [ ] Register shortcuts: Search, Crystals, Bookmarks, Random Compound.
- [ ] Handle quick action intents in `App.tsx`.

### Phase 5: Scientific Tools (Measurements & Surfaces)

- [ ] Enable atom picking in `viewerHtml.ts` for bond length (Å) and bond angle (°) calculation.
- [ ] Add visual measurement banner with "Clear Selection" chip in `MoleculeViewer.tsx`.
- [ ] Add Electrostatic Potential (ESP) and Van der Waals surface options in style selector.
- [ ] Implement STL 3D-printing mesh export in `ShareExportModal.tsx`.

### Phase 6: Educational Expansions

- [ ] Implement Interactive Periodic Table modal/drawer.
- [ ] Link periodic elements to PubChem queries and crystal structures.
- [ ] Add downloadable offline subject packs (Amino acids, Gemstones, Pharmaceuticals).
