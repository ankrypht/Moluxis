const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ["**/__tests__/**/*.{js,ts,tsx}", "jest.setup.js"],
    languageOptions: {
      globals: {
        ...require("globals").jest,
        ...require("globals").node,
      },
    },
  },
  {
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
  {
    ignores: ["dist/*", "src/constants/threeDmolScript.ts"],
  },
]);
