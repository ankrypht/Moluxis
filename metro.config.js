const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      // experimentalImportSupport: enables ESM-aware bundling and is required
      // for proper tree-shaking. Default-on in SDK 54+, explicit here for clarity.
      experimentalImportSupport: true,
      // inlineRequires: defer module evaluation until first use (faster cold-start).
      inlineRequires: true,
    },
  }),
};

module.exports = config;
