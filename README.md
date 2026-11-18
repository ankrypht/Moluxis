<div align="center">
  <img src="./assets/splash-icon.png" alt="Moluxis Logo" width="200" height="200" />
  <h1>Moluxis</h1>
  <p>
    <b>A Modern, Fast 3D Molecule & Crystal Explorer for Android</b>
  </p>
  <p>
    Search, inspect, and visualize chemical compounds and mineral crystal lattices in interactive 3D and 2D.
  </p>

  <p>
    <a href="https://github.com/ankrypht/Moluxis/releases/latest"><img src="https://img.shields.io/github/v/release/ankrypht/Moluxis?style=flat&color=10b981&label=Release" alt="Latest Release" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/ankrypht/Moluxis?style=flat&color=6366f1&label=License" alt="License" /></a>
    <a href="https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis"><img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=flat&logo=android&logoColor=white" alt="Platform" /></a>
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK%2058-000020?style=flat&logo=expo&logoColor=white" alt="Expo" /></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=flat&logo=react&logoColor=black" alt="React Native" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://ankrypht.github.io/Moluxis/privacy.html"><img src="https://img.shields.io/badge/Privacy-Policy-blue?style=flat" alt="Privacy Policy" /></a>
  </p>

  <p>
    <a href="https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis">
      <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" height="70" />
    </a>
  </p>

  <a href="https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis">
    <img src="https://playbadges.pavi2410.com/badge/full?id=com.ankushsarkar.moluxis&country=in&theme=dark" alt="Google Play Store Details" />
  </a>
</div>

---

## 📖 Overview

**Moluxis** is an open-source Android application for exploring chemical compounds and crystal structures in interactive 3D and 2D. Powered by the **PubChem** database and the **Crystallography Open Database (COD)**, Moluxis provides instant access to millions of molecular structures, physical and chemical properties, safety hazards, and crystal geometry — all wrapped in a sleek, dark-themed native interface.

---

## 📱 Screenshots

<div align="center">
  <img src="./assets/mockups/1.png" width="45%" />
  <img src="./assets/mockups/2.png" width="45%" />
  <img src="./assets/mockups/3.png" width="45%" />
  <img src="./assets/mockups/4.png" width="45%" />
  <img src="./assets/mockups/5.png" width="45%" />
  <img src="./assets/mockups/6.png" width="45%" />
</div>

---

## ✨ Features

- **🧪 Interactive 3D & 2D Visualization**
  - **Multiple Render Styles:** Switch between Ball & Stick, Sticks, Space-Fill (VDW), and Wireframe.
  - **Viewer Controls:** 360° auto-rotation, element atom labels, and a distraction-free Zen (full-screen) mode.
  - **Dual Representation:** Seamlessly toggle between 3D molecular models and 2D chemical structural diagrams.
  - **Adaptive Layout:** Responsive split-screen view optimized for landscape orientation and tablets.

- **🔬 Interactive Atom Picking & Measurement Calculator**
  - **Direct 3D Picking:** Tap atoms on the 3D WebGL canvas with interactive wireframe highlighting and dashed 3D connection struts.
  - **Bond Length (2 Atoms):** Calculates Euclidean distance in Ångströms (Å).
  - **Bond Angle (3 Atoms):** Computes precise bond angles in degrees (°) at the vertex atom.
  - **Dihedral / Torsion Angle (4 Atoms):** Measures 3D torsion angles between planes in degrees (°).
  - **Measurement Panel:** Collapsible dock with atom slot chips, live geometric readouts, and tactile haptic feedback.

- **💎 Crystal Lattices & Minerals**
  - Visualize 3D unit cells and crystal lattice geometries for inorganic minerals via COD.

- **🌟 Curated Showcase & Category Tabs**
  - Discover iconic molecules across **Biochemicals**, **Medicinal**, and **Crystals & Minerals** with persistent tab filters.
  - Zero-latency startup with pre-bundled datasets loading instantly offline (0ms).

- **🔍 Smart Search & Chemical Typography**
  - Instant search across millions of compounds with real-time suggestions as you type.
  - Rich subscript formula formatting ($C_8H_{10}N_4O_2$, $H_2O$) across search results, cards, and property sheets.

- **📊 Deep Molecular & Safety Intelligence**
  - **Quick Stats:** Instant formula, molecular weight, IUPAC name, and common names.
  - **Expandable Drawers:** Collapsible sections for chemical properties (LogP, TPSA, H-bonds), physical constants (melting/boiling points, density, solubility), and synonyms.
  - **Safety & Hazards:** Standard GHS classifications, signal words, and hazard statements.
  - **Verified Citations:** Direct links to official PubChem and COD source records.

- **📤 High-Res Snapshot Export & Sharing**
  - **3D Canvas Snapshots:** Capture high-resolution PNG images of the 3D model at any angle or zoom level.
  - **Rich Share Sheets:** One-tap sharing of compound summaries, chemical formulas, and direct PubChem links.

- **⏱️ Recent History & Pinned Bookmarks**
  - "Jump Back In" quick-access carousel on launch to instantly revisit recent molecules.
  - One-tap bookmarking to save favorite compounds with protected persistent offline storage.

- **📳 Tactile Sensory & Themed Design**
  - Context-aware haptic feedback across style changes, Zen mode toggles, bookmarking, and search selections.
  - Custom dark-themed glassmorphic alert popups replacing generic system alerts.
  - Edge-to-edge Android layout with transparent system navigation bar integration.

- **🔔 In-App Updates & Periodic Background Check**
  - **Automated Version Oracle:** Checks GitHub Releases for new semver releases and prompts users with direct Google Play Store redirection and a 24-hour snooze option.
  - **Headless Android WorkManager Task:** Periodic 12-hour background worker (`moluxis-background-update-task`) to alert users when a newer release is ready.
  - **Post-Upgrade "What's New":** Automatic changelog modal displaying highlights, improvements, and fixes on the first launch after updating.

- **📢 Offline Discovery Notifications & Spotlights**
  - **Weekly Molecule Spotlight:** Offline scheduled discovery notifications introducing curated chemical compounds every Saturday.
  - **Library Retention Reminders:** Inactivity reminder to revisit saved molecule bookmarks.
  - **Notification Channels:** Dedicated channels for `app_updates` and `discoveries` honoring Android 13+ `POST_NOTIFICATIONS` permissions.

- **🧭 Hardware Back Navigation & Deep Linking**
  - **Prioritized Back Stack:** Comprehensive Android hardware back-button handling: closes open modals ➔ clears measurement selections ➔ exits search suggestions ➔ exits full-screen Zen mode ➔ returns home ➔ double-back to exit prompt.
  - **Unified Deep Linking (`moluxis://`):** Direct routing for molecules (`moluxis://molecule?query=...`), bookmarks (`moluxis://bookmarks`), category tabs (`moluxis://category?name=...`), and update dialogs (`moluxis://update`).

- **ℹ️ About & Attribution Modal**
  - Built-in About modal presenting developer attribution, version diagnostics, official data source citations, GitHub links, feedback mailto, and quick access to the Privacy Policy.

- **⚡ Engineered for Speed & Stability**
  - **React Native New Architecture:** Fully leveraging Bridgeless mode and TurboModules in React Native 0.88 for low latency and high runtime responsiveness.
  - **Smooth 60 FPS WebGL Loop:** Throttled requestAnimationFrame engine with automatic WebGL activity pausing during text input or modal inspection to eliminate ANRs and save battery.
  - **Multi-Tier Caching:** High-speed in-memory LRU cache backed by persistent disk storage.
  - **Smart Rate Limiting:** PubChem request queue with concurrency pacing and an automatic circuit breaker against server throttling.

---

## 🛠️ Tech Stack

| Layer                 | Technologies                                                                                                                                                           |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile Core**       | [React Native](https://reactnative.dev/) (0.88), [Expo](https://expo.dev/) (SDK 58), [React](https://react.dev/) (19.3), [TypeScript](https://www.typescriptlang.org/) |
| **Architecture**      | [React Native New Architecture](https://reactnative.dev/architecture/landing-page) (Bridgeless), Hermes Engine                                                         |
| **3D Engine**         | [3Dmol.js](https://3Dmol.csb.pitt.edu/) via `react-native-webview` (v14)                                                                                               |
| **Data Sources**      | [PubChem PUG REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest), [Crystallography Open Database (COD)](https://www.crystallography.net/)                        |
| **Storage & Caching** | AsyncStorage, FileSystem, Multi-tier LRU Memory & Disk Cache                                                                                                           |
| **Background Tasks**  | [Android WorkManager](https://developer.android.com/topic/libraries/architecture/workmanager) via `expo-background-task`, `expo-task-manager`                          |
| **Notifications**     | [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (Local channels & triggers)                                                             |
| **Deep Linking**      | [Expo Linking](https://docs.expo.dev/versions/latest/sdk/linking/) (`moluxis://`)                                                                                      |
| **Sensory & Haptics** | [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)                                                                                                     |
| **Export & Sharing**  | [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/), [Expo FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/)                           |
| **UI & Systems**      | Expo Navigation Bar, Expo System UI, Custom Glassmorphic Modal Alerts                                                                                                  |
| **Testing & Quality** | Jest, `@testing-library/react-native`, ESLint, Prettier                                                                                                                |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- Android physical device or Android Emulator

### Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ankrypht/Moluxis.git
   cd Moluxis
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm start
   ```

4. **Run on Android:**

   ```bash
   npm run android
   ```

5. **Run tests, linter, & diagnostics:**
   ```bash
   npm test
   npm run lint
   npm run doctor
   ```

---

## 🔒 Privacy & Data Safety

Moluxis is built with privacy by design:

- **Zero Tracking & Telemetry:** No user accounts, personal data harvesting, advertising IDs, or third-party analytics trackers.
- **Strictly Local Notifications:** All scheduled discovery spotlights and update alerts are generated entirely on your device — no remote push servers, push tokens (e.g. FCM), or device identifiers are collected.
- **Local Device Storage:** Pinned bookmarks, search history, and update preferences are stored exclusively on your device via AsyncStorage.
- **Encrypted Requests:** All chemical data and version queries are fetched over HTTPS (PubChem, COD, and GitHub).

For full details, read the [Moluxis Privacy Policy](https://ankrypht.github.io/Moluxis/privacy.html) (or view [`docs/privacy.html`](docs/privacy.html)).

---

## 📄 License

Distributed under the **Apache License 2.0**. See [`LICENSE`](LICENSE) for details.

---

## 🙏 Acknowledgments

- **[PubChem](https://pubchem.ncbi.nlm.nih.gov/)** — Comprehensive open chemical database and API.
- **[3Dmol.js](https://3Dmol.csb.pitt.edu/)** — High-performance WebGL molecular visualization library.
- **[Crystallography Open Database (COD)](https://www.crystallography.net/)** — Open-access collection of crystal structures.
