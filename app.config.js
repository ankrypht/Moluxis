import pkg from "./package.json";
import releaseNotes from "./src/constants/releaseNotes.json";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PROD_BUILD =
  process.env.EAS_BUILD_PROFILE === "production" ||
  process.env.APP_VARIANT === "production";

if (IS_PROD_BUILD) {
  if (releaseNotes.version !== pkg.version) {
    throw new Error(
      `\n❌ PRODUCTION BUILD HALTED: Release notes version ("${releaseNotes.version}") does not match package.json version ("${pkg.version}").\n` +
        `Please update src/constants/releaseNotes.json with your What's New notes before building for production.\n`,
    );
  }

  const totalItems =
    (releaseNotes.features?.length || 0) +
    (releaseNotes.improvements?.length || 0) +
    (releaseNotes.fixes?.length || 0);

  if (totalItems === 0) {
    throw new Error(
      `\n❌ PRODUCTION BUILD HALTED: Release notes for v${pkg.version} in src/constants/releaseNotes.json have no highlights.\n` +
        `Please add at least one feature, improvement, or fix.\n`,
    );
  }
}

const getVersionCode = (version) => {
  const [major, minor, patch] = version.split(".").map(Number);
  return major * 1000000 + minor * 1000 + patch;
};

export default {
  name: IS_DEV ? "Moluxis (Dev)" : "Moluxis",
  slug: "Moluxis",
  version: pkg.version,
  scheme: "moluxis",
  orientation: "default",
  platforms: ["android"],
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
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
    predictiveBackGestureEnabled: false,
    permissions: ["android.permission.POST_NOTIFICATIONS"],
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.ankushsarkar.moluxis",
  },
  owner: "ankushsarkar",
  plugins: [
    "expo-font",
    "expo-sharing",
    "expo-status-bar",
    "expo-background-task",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#10B981",
        defaultChannel: "app_updates",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#000000",
        image: "./assets/splash-icon.png",
        dark: {
          image: "./assets/splash-icon.png",
          backgroundColor: "#000000",
        },
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          // Required by expo-build-properties when enableShrinkResourcesInReleaseBuilds is true
          enableMinifyInReleaseBuilds: true,
          // Remove unused Android resources (drawables, layouts, strings, etc.)
          enableShrinkResourcesInReleaseBuilds: true,
          extraProguardRules: [
            "-keepattributes *Annotation*",
            "-keepclassmembers class * {",
            "    @android.webkit.JavascriptInterface <methods>;",
            "}",
            "-keep class com.reactnativecommunity.webview.** { *; }",
            "-dontwarn com.reactnativecommunity.webview.**",
            "-keep class expo.modules.notifications.** { *; }",
            "-keep class expo.modules.taskmanager.** { *; }",
            "-keep class expo.modules.backgroundtask.** { *; }",
            "-keep class * extends androidx.work.ListenableWorker {",
            "    public <init>(android.content.Context, androidx.work.WorkerParameters);",
            "}",
          ].join("\n"),
        },
      },
    ],
  ],
  extra: {
    isDevVariant: IS_DEV,
    disableUpdateCheck: process.env.APP_DISABLE_UPDATE_CHECK === "true",
    eas: {
      projectId: "81f557ce-7d0e-4091-bdcf-185d86410a5f",
    },
  },
};
