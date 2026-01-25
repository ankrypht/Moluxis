<div align="center">
  <img src="./assets/adaptive-icon.png" alt="Moluxis Logo" width="200" height="200" />
  <h1>Moluxis</h1>
  <p>
    <b>A Modern 3D Molecule Explorer for Android</b>
  </p>
  <p>
    Search, visualize, and explore chemical compounds in interactive 3D.
  </p>
</div>

---

## 📖 Overview

**Moluxis** is a powerful Android application built with Expo that allows students, chemists, and enthusiasts to explore the molecular world. Powered by the **PubChem** database, Moluxis provides real-time access to millions of chemical compounds, offering detailed chemical properties, safety data, and fully interactive 3D structures directly on your mobile device.

The app features a sleek, dark-themed UI designed for focus and clarity.

## ✨ Features

### 🔍 **Smart Search**
- **Instant Search:** Find compounds by common names (e.g., "Caffeine", "Aspirin") or IUPAC names.
- **Autocomplete:** Intelligent suggestions help you find the exact compound you're looking for as you type.

### 🧪 **Interactive 3D Visualization**
- **High-Performance Rendering:** Powered by `3Dmol.js` within a customized WebView.
- **Multiple Visualization Modes:**
  - 🎾 **Ball & Stick:** Standard chemistry visualization.
  - 🥢 **Sticks:** Clean view emphasizing bond connectivity.
  - 🔴 **Space-Fill:** Realistic volume representation.
  - 🕸️ **Wireframe:** Minimalist view for complex structures.
- **Controls:** Toggle atom labels and switch modes instantly.

### 📊 **Comprehensive Chemical Data**
- **Physical Properties:** Molecular Weight, Formula, Density, Boiling/Melting Points, Solubility.
- **Chemical Attributes:** H-Bond Donors/Acceptors, Rotatable Bonds, TPSA, LogP.
- **Identifiers:** IUPAC Names (Preferred & Traditional), Common Synonyms.
- **External Links:** Direct access to full PubChem records.

### ⚠️ **Safety & Hazards**
- **GHS Classification:** Displays standard GHS Signal Words (e.g., "Danger", "Warning").
- **Hazard Statements:** clear list of specific hazard warnings and safety precautions.

## 🛠️ Tech Stack

- **Framework:** [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
- **Language:** TypeScript
- **3D Engine:** [3Dmol.js](https://3Dmol.csb.pitt.edu/) (embedded via `react-native-webview`)
- **Data Source:** [PubChem PUG REST API](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest)
- **UI Components:** Custom components.

## 🤝 Contributing

### Prerequisites
- Node.js (LTS recommended)
- npm or yarn
- Expo Go app on your physical device (Android) OR an Android Emulator.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ankrypht/moluxis.git
   cd moluxis
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on Device/Emulator:**
   - **Physical Device:** Scan the QR code displayed in the terminal using the Expo Go app.
   - **Android Emulator:** Press `a` in the terminal.

## 📄 License

Copyright © 2026 Ankush Sarkar

Licensed under the Apache License, Version 2.0.

## 🙏 Acknowledgments

- **PubChem:** For providing the extensive chemical database and API.
- **3Dmol.js:** For the excellent JavaScript-based molecular visualization library.
