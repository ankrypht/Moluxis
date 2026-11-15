const pkg = require("../package.json");
const releaseNotes = require("../src/constants/releaseNotes.json");

if (releaseNotes.version !== pkg.version) {
  console.error(
    `\n❌ PRODUCTION BUILD HALTED: Release notes version ("${releaseNotes.version}") does not match package.json version ("${pkg.version}").\n` +
      `Please update src/constants/releaseNotes.json before building for production.\n`,
  );
  process.exit(1);
}

const total =
  (releaseNotes.features?.length || 0) +
  (releaseNotes.improvements?.length || 0) +
  (releaseNotes.fixes?.length || 0);

if (total === 0) {
  console.error(
    `\n❌ PRODUCTION BUILD HALTED: Release notes for v${pkg.version} in src/constants/releaseNotes.json have no highlights.\n` +
      `Please add at least one feature, improvement, or fix.\n`,
  );
  process.exit(1);
}

console.log(`✅ Release notes validated successfully for v${pkg.version}`);
