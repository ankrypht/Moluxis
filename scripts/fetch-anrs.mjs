import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const DEFAULT_PACKAGE_NAME = "com.ankushsarkar.moluxis";
const OAUTH_TOKEN_URI = "https://oauth2.googleapis.com/token";
const REPORTING_API_BASE =
  "https://playdeveloperreporting.googleapis.com/v1beta1";
const SCOPE = "https://www.googleapis.com/auth/playdeveloperreporting";

// Parse CLI options
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    days: 30,
    type: "ANR", // 'ANR' | 'CRASH' | 'ALL'
    versionCode: null,
    keyPath: null,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--days" || arg === "-d") {
      options.days = parseInt(args[++i], 10) || 30;
    } else if (arg.startsWith("--days=")) {
      options.days = parseInt(arg.split("=")[1], 10) || 30;
    } else if (arg === "--version" || arg === "-v") {
      options.versionCode = parseInt(args[++i], 10);
    } else if (arg.startsWith("--version=")) {
      options.versionCode = parseInt(arg.split("=")[1], 10);
    } else if (arg === "--type" || arg === "-t") {
      options.type = (args[++i] || "ANR").toUpperCase();
    } else if (arg.startsWith("--type=")) {
      options.type = arg.split("=")[1].toUpperCase();
    } else if (arg === "--key" || arg === "-k") {
      options.keyPath = args[++i];
    } else if (arg.startsWith("--key=")) {
      options.keyPath = arg.split("=")[1];
    } else if (!arg.startsWith("-") && !options.keyPath) {
      options.keyPath = arg;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Google Play Error & ANR Fetcher
Usage:
  npm run fetch-anrs [options]
  node scripts/fetch-anrs.mjs [options]

Options:
  --days, -d <number>       Days of historical data to fetch (default: 30)
  --type, -t <ANR|CRASH|ALL> Error type to query (default: ANR)
  --version, -v <code >     Filter by specific Android versionCode (e.g. 2000002)
  --key, -k <path>          Path to Service Account JSON key
  --help, -h                Show this help message

Environment Variables:
  GOOGLE_APPLICATION_CREDENTIALS  Path to service account JSON key
  ANDROID_PACKAGE_NAME            Android package name (default: ${DEFAULT_PACKAGE_NAME})
`);
}

function findKeyFile(explicitPath) {
  if (explicitPath && fs.existsSync(explicitPath)) {
    return explicitPath;
  }

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) {
    return envPath;
  }

  const candidates = [
    "play-service-account.json",
    "play-reports/play-service-account.json",
    "scripts/play-service-account.json",
    "service-account.json",
    "play-key.json",
    "google-play-key.json",
  ];

  for (const candidate of candidates) {
    const fullPath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

async function getAccessToken(keyPath) {
  const fileContent = fs.readFileSync(keyPath, "utf8");
  const creds = JSON.parse(fileContent);

  if (!creds.client_email || !creds.private_key) {
    throw new Error(
      "Invalid Service Account JSON key: missing client_email or private_key.",
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const claimSet = {
    iss: creds.client_email,
    scope: SCOPE,
    aud: creds.token_uri || OAUTH_TOKEN_URI,
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsignedToken = `${base64UrlEncode(header)}.${base64UrlEncode(claimSet)}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(creds.private_key, "base64url");

  const jwt = `${unsignedToken}.${signature}`;

  const tokenResponse = await fetch(creds.token_uri || OAUTH_TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text();
    throw new Error(
      `Failed to get Google OAuth token (${tokenResponse.status}): ${errorBody}`,
    );
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function getPastDateParams(daysBack = 30) {
  const end = new Date();
  const start = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  return {
    "interval.startTime.year": String(start.getUTCFullYear()),
    "interval.startTime.month": String(start.getUTCMonth() + 1),
    "interval.startTime.day": String(start.getUTCDate()),
    "interval.startTime.hours": String(start.getUTCHours()),
    "interval.startTime.timeZone.id": "UTC",
    "interval.endTime.year": String(end.getUTCFullYear()),
    "interval.endTime.month": String(end.getUTCMonth() + 1),
    "interval.endTime.day": String(end.getUTCDate()),
    "interval.endTime.hours": String(end.getUTCHours()),
    "interval.endTime.timeZone.id": "UTC",
  };
}

function buildFilter(type, versionCode) {
  const conditions = [];

  if (type === "ALL") {
    conditions.push("(errorIssueType = ANR OR errorIssueType = CRASH)");
  } else if (type === "CRASH") {
    conditions.push("errorIssueType = CRASH");
  } else {
    conditions.push("errorIssueType = ANR");
  }

  if (versionCode) {
    conditions.push(`versionCode = ${versionCode}`);
  }

  return conditions.join(" AND ");
}

async function fetchErrorIssues(
  packageName,
  accessToken,
  { days = 30, type = "ANR", versionCode = null },
) {
  let allIssues = [];
  let pageToken = null;
  const dateParams = getPastDateParams(days);
  const filter = buildFilter(type, versionCode);

  console.log(`Fetching issues (filter: "${filter}", past ${days} days)...`);

  do {
    const url = new URL(
      `${REPORTING_API_BASE}/apps/${packageName}/errorIssues:search`,
    );
    url.searchParams.set("filter", filter);
    url.searchParams.set("sampleErrorReportLimit", "1");
    url.searchParams.set("pageSize", "50");

    for (const [k, v] of Object.entries(dateParams)) {
      url.searchParams.set(k, v);
    }
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `ErrorIssues API failed (${res.status} ${res.statusText}): ${errText}`,
      );
    }

    const data = await res.json();
    if (data.errorIssues && data.errorIssues.length > 0) {
      allIssues = allIssues.concat(data.errorIssues);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken && allIssues.length < 200);

  return allIssues;
}

async function fetchErrorReports(
  packageName,
  accessToken,
  { days = 30, type = "ANR", versionCode = null },
) {
  let allReports = [];
  let pageToken = null;
  const dateParams = getPastDateParams(days);
  const filter = buildFilter(type, versionCode);

  console.log(`Fetching detailed reports (past ${days} days)...`);

  do {
    const url = new URL(
      `${REPORTING_API_BASE}/apps/${packageName}/errorReports:search`,
    );
    url.searchParams.set("filter", filter);
    url.searchParams.set("pageSize", "50");

    for (const [k, v] of Object.entries(dateParams)) {
      url.searchParams.set(k, v);
    }
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Could not fetch error reports (${res.status}): ${errText}`);
      break;
    }

    const data = await res.json();
    if (data.errorReports && data.errorReports.length > 0) {
      allReports = allReports.concat(data.errorReports);
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken && allReports.length < 150);

  return allReports;
}

function extractMainThreadSnippet(reportText, maxLines = 16) {
  if (!reportText) return "No report text available.";

  const lines = reportText.split("\n");
  const mainStart = lines.findIndex(
    (l) => l.includes('"main"') || l.includes("tid=1"),
  );
  if (mainStart === -1) {
    return lines.slice(0, maxLines).join("\n");
  }

  const snippet = [];
  for (let i = mainStart; i < lines.length; i++) {
    const line = lines[i];
    // Stop if next thread begins
    if (i > mainStart && line.startsWith('"') && line.includes("tid=")) {
      break;
    }
    snippet.push(line);
    if (snippet.length >= maxLines) {
      snippet.push("  ... [truncated for readability]");
      break;
    }
  }

  return snippet.join("\n");
}

function analyzeDistribution(reports) {
  const osCount = {};
  const deviceCount = {};
  const versionCount = {};

  for (const r of reports) {
    const api = r.osVersion?.apiLevel
      ? `Android ${r.osVersion.apiLevel}`
      : "Unknown";
    osCount[api] = (osCount[api] || 0) + 1;

    const dev = r.deviceModel?.model || "Unknown";
    deviceCount[dev] = (deviceCount[dev] || 0) + 1;

    const ver = r.appVersion?.versionCode
      ? `v${r.appVersion.versionCode}`
      : "Unknown";
    versionCount[ver] = (versionCount[ver] || 0) + 1;
  }

  const toSortedArray = (obj) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  return {
    os: toSortedArray(osCount),
    devices: toSortedArray(deviceCount).slice(0, 5),
    versions: toSortedArray(versionCount),
  };
}

function formatMarkdownReport(issues, reports, packageName, options) {
  const dist = analyzeDistribution(reports);
  let md = `# Google Play Console ${options.type} Report: ${packageName}\n\n`;
  md += `*Generated on:* ${new Date().toISOString()}  \n`;
  md += `*Time Range:* Past ${options.days} days  \n`;
  md += `*Filter:* ${options.versionCode ? `Version Code ${options.versionCode}` : "All active versions"}\n\n`;

  md += `### Quick Stats\n`;
  md += `- **Total Issue Clusters:** ${issues.length}\n`;
  md += `- **Total Individual Reports Analyzed:** ${reports.length}\n\n`;

  if (reports.length > 0) {
    md += `### Distribution Overview\n\n`;
    md += `| Category | Breakdown (Count) |\n`;
    md += `| :--- | :--- |\n`;
    md += `| **Android Versions** | ${dist.os.map((x) => `\`${x.name}\` (${x.count})`).join(", ") || "N/A"} |\n`;
    md += `| **App Versions** | ${dist.versions.map((x) => `\`${x.name}\` (${x.count})`).join(", ") || "N/A"} |\n`;
    md += `| **Top Devices** | ${dist.devices.map((x) => `\`${x.name}\` (${x.count})`).join(", ") || "N/A"} |\n\n`;
  }

  if (issues.length === 0) {
    md += `> 🎉 **Great news!** No ${options.type} issues were reported for the selected time window and filters.\n`;
    return md;
  }

  md += `## Summary of Issue Clusters\n\n`;
  md += `| # | Type | Cause / Location | Reports | Distinct Users | Last Seen |\n`;
  md += `| :-: | :--- | :--- | :--- | :--- | :--- |\n`;

  issues.forEach((issue, idx) => {
    const type = issue.type || options.type;
    const cause = (issue.cause || "Unknown").replace(/\|/g, "\\|");
    const loc = (issue.location || "").replace(/\|/g, "\\|");
    const label = loc ? `\`${cause}\`<br>↳ \`${loc}\`` : `\`${cause}\``;
    const count = issue.errorReportCount || "N/A";
    const users = issue.distinctUsers || "N/A";
    const lastSeen = issue.lastErrorReportTime
      ? issue.lastErrorReportTime.split("T")[0]
      : "N/A";
    md += `| ${idx + 1} | ${type} | ${label} | ${count} | ${users} | ${lastSeen} |\n`;
  });

  md += `\n---\n\n## Cluster Diagnostics & Main Thread Traces\n\n`;

  issues.forEach((issue, idx) => {
    md += `### #${idx + 1}: ${issue.cause || "Unknown"}\n\n`;
    md += `- **Type:** \`${issue.type || options.type}\`\n`;
    md += `- **Location:** \`${issue.location || "N/A"}\`\n`;
    md += `- **Reports:** ${issue.errorReportCount || "N/A"} | **Affected Users:** ${issue.distinctUsers || "N/A"}\n`;
    if (issue.issueUri) {
      md += `- **Play Console Link:** [Open in Console](${issue.issueUri})\n`;
    }
    md += `\n`;

    const sample =
      (issue.sampleErrorReports && issue.sampleErrorReports[0]) || null;
    if (sample && sample.reportText) {
      md += `#### Quick Diagnosis (Main Thread Stack Trace):\n`;
      md += "```\n";
      md += extractMainThreadSnippet(sample.reportText, 18);
      md += "\n```\n\n";
    }
  });

  return md;
}

async function main() {
  const options = parseArgs();
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const keyPath = findKeyFile(options.keyPath);
  if (!keyPath) {
    console.error(
      "\n❌ No service account JSON key found!\n" +
        "Please place your Google Cloud service account JSON file as:\n" +
        "  play-service-account.json\n\n" +
        "Or pass its path with:\n" +
        "  npm run fetch-anrs -- --key /path/to/key.json\n",
    );
    process.exit(1);
  }

  console.log(`Using Service Account key: ${keyPath}`);
  const packageName = process.env.ANDROID_PACKAGE_NAME || DEFAULT_PACKAGE_NAME;

  try {
    const accessToken = await getAccessToken(keyPath);
    console.log(`✅ Authenticated with Google Play Reporting API!`);

    const issues = await fetchErrorIssues(packageName, accessToken, options);
    const reports = await fetchErrorReports(packageName, accessToken, options);

    const reportsDir = path.resolve(process.cwd(), "play-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const typePrefix = options.type.toLowerCase();
    const outJsonPath = path.join(reportsDir, `${typePrefix}-reports.json`);
    fs.writeFileSync(
      outJsonPath,
      JSON.stringify({ issues, reports }, null, 2),
      "utf8",
    );

    const outMdPath = path.join(reportsDir, `${typePrefix}-reports.md`);
    const markdown = formatMarkdownReport(
      issues,
      reports,
      packageName,
      options,
    );
    fs.writeFileSync(outMdPath, markdown, "utf8");

    console.log(
      `\n🎉 Success! Retrieved ${issues.length} issue clusters and ${reports.length} reports.`,
    );
    console.log(`Saved reports to:`);
    console.log(`  - ${outMdPath}`);
    console.log(`  - ${outJsonPath}`);
  } catch (err) {
    console.error(`\n❌ Error:`, err.message);
    process.exit(1);
  }
}

main();
