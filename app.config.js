import pkg from "./package.json";

const getVersionCode = (version) => {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 1000000 + minor * 1000 + patch;
};

export default {
  name: "Moluxis",
  slug: "moluxis",
  version: pkg.version,
  orientation: "portrait",
  platforms: ["android"],
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    imageWidth: 200,
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  android: {
    package: "com.ankushsarkar.moluxis",
    versionCode: getVersionCode(pkg.version),
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
      monochromeImage: "./assets/adaptive-icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  owner: "ankushsarkar",
  plugins: ["expo-font"],
  extra: {
    eas: {
      projectId: "81f557ce-7d0e-4091-bdcf-185d86410a5f",
    },
  },
};
