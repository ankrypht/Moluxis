import pkg from "./package.json";
const IS_DEV = process.env.APP_VARIANT === "development";

const getVersionCode = (version) => {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 1000000 + minor * 1000 + patch;
};

export default {
  name: IS_DEV ? "Moluxis (Dev)" : "Moluxis",
  slug: "Moluxis",
  version: pkg.version,
  orientation: "default",
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
    package: IS_DEV
      ? "com.ankushsarkar.moluxis.dev"
      : "com.ankushsarkar.moluxis",
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
