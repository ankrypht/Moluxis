import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Buffer } from "node:buffer";

const DEFAULT_PACKAGE_NAME = "com.ankushsarkar.moluxis";
const OAUTH_TOKEN_URI = "https://oauth2.googleapis.com/token";
const REPORTING_API_BASE =
  "https://playdeveloperreporting.googleapis.com/v1beta1";
const SCOPE = "https://www.googleapis.com/auth/playdeveloperreporting";

// Thresholds defined by Google Play Android Vitals
const GOOGLE_THRESHOLDS = {
  anrRate: 0.0047, // 0.47% bad behavior threshold
  crashRate: 0.0109, // 1.09% bad behavior threshold
  slowRenderingRate: 0.08, // 8% slow rendering threshold
  slowStartRate: 0.05, // 5% slow startup threshold
};

function findKeyFile() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const candidates = [
    "play-service-account.json",
    "play-reports/play-service-account.json",
    "scripts/play-service-account.json",
    "service-account.json",
    "play-key.json",
  ];

  for (const candidate of candidates) {
    const fullPath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(fullPath)) return fullPath;
  }
  return null;
}

async function getAccessToken(keyPath) {
  const fileContent = fs.readFileSync(keyPath, "utf8");
  const creds = JSON.parse(fileContent);

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
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

  const res = await fetch(creds.token_uri || OAUTH_TOKEN_URI, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`OAuth failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

function getQueryTimeline(daysBack = 28) {
  // Google Play Vitals API has a 2-day freshness delay
  const end = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const start = new Date(Date.now() - (daysBack + 2) * 24 * 60 * 60 * 1000);

  return {
    aggregationPeriod: "DAILY",
    startTime: {
      year: start.getUTCFullYear(),
      month: start.getUTCMonth() + 1,
      day: start.getUTCDate(),
    },
    endTime: {
      year: end.getUTCFullYear(),
      month: end.getUTCMonth() + 1,
      day: end.getUTCDate(),
    },
  };
}

async function queryMetricSet(
  packageName,
  metricSetName,
  metrics,
  accessToken,
) {
  const url = `${REPORTING_API_BASE}/apps/${packageName}/${metricSetName}:query`;
  const timelineSpec = getQueryTimeline(28);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      metrics,
      timelineSpec,
    }),
  });

  if (!res.ok) {
    console.warn(`Query ${metricSetName} returned ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.rows || [];
}

function parseMetricRows(rows) {
  return rows.map((r) => {
    const d = r.startTime;
    const dateStr = `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
    const metricsMap = {};
    for (const m of r.metrics || []) {
      const val = parseFloat(m.decimalValue?.value || "0");
      metricsMap[m.metric] = val;
    }
    return { date: dateStr, ...metricsMap };
  });
}

function formatVitalsReport(packageName, anrRows, crashRows) {
  let md = `# Google Play Android Vitals Overview: ${packageName}\n\n`;
  md += `*Generated on:* ${new Date().toISOString()}  \n`;
  md += `*Monitoring Window:* Last 28 days (daily granularity)\n\n`;

  md += `## Google Play Bad Behavior Thresholds\n\n`;
  md += `Google Play penalizes apps in search ranking and store discovery when metrics exceed bad behavior thresholds:\n\n`;
  md += `| Vital Metric | Google Play Threshold | Threshold Impact |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **ANR Rate** | **0.47%** | App title demoted in Play Store search |\n`;
  md += `| **Crash Rate** | **1.09%** | "Unstable app" warning on store listing |\n\n`;

  md += `## Daily ANR Rates\n\n`;
  if (anrRows.length === 0) {
    md += `*No ANR metric records returned for this period.*\n\n`;
  } else {
    md += `| Date | Overall ANR Rate | User-Perceived ANR Rate | Status |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const row of anrRows) {
      const overallPct = (row.anrRate * 100).toFixed(2) + "%";
      const userPct =
        row.userPerceivedAnrRate !== undefined
          ? (row.userPerceivedAnrRate * 100).toFixed(2) + "%"
          : "N/A";
      const status =
        row.anrRate > GOOGLE_THRESHOLDS.anrRate
          ? "🔴 Above Threshold"
          : "🟢 Healthy";
      md += `| ${row.date} | ${overallPct} | ${userPct} | ${status} |\n`;
    }
    md += `\n`;
  }

  md += `## Daily Crash Rates\n\n`;
  if (crashRows.length === 0) {
    md += `*No Crash metric records returned for this period.*\n\n`;
  } else {
    md += `| Date | Overall Crash Rate | User-Perceived Crash Rate | Status |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    for (const row of crashRows) {
      const overallPct = (row.crashRate * 100).toFixed(2) + "%";
      const userPct =
        row.userPerceivedCrashRate !== undefined
          ? (row.userPerceivedCrashRate * 100).toFixed(2) + "%"
          : "N/A";
      const status =
        row.crashRate > GOOGLE_THRESHOLDS.crashRate
          ? "🔴 Above Threshold"
          : "🟢 Healthy";
      md += `| ${row.date} | ${overallPct} | ${userPct} | ${status} |\n`;
    }
    md += `\n`;
  }

  return md;
}

async function main() {
  const keyPath = findKeyFile();
  if (!keyPath) {
    console.error("\n❌ No service account key found for Google Play API.");
    process.exit(1);
  }

  const packageName = process.env.ANDROID_PACKAGE_NAME || DEFAULT_PACKAGE_NAME;

  try {
    const accessToken = await getAccessToken(keyPath);
    console.log(`✅ Authenticated with Google Play Reporting API!`);

    console.log(`Querying ANR Rate metrics...`);
    const anrRaw = await queryMetricSet(
      packageName,
      "anrRateMetricSet",
      ["anrRate", "userPerceivedAnrRate"],
      accessToken,
    );

    console.log(`Querying Crash Rate metrics...`);
    const crashRaw = await queryMetricSet(
      packageName,
      "crashRateMetricSet",
      ["crashRate", "userPerceivedCrashRate"],
      accessToken,
    );

    const anrRows = parseMetricRows(anrRaw);
    const crashRows = parseMetricRows(crashRaw);

    const reportsDir = path.resolve(process.cwd(), "play-reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const mdReport = formatVitalsReport(packageName, anrRows, crashRows);
    const mdPath = path.join(reportsDir, "vitals-overview.md");
    fs.writeFileSync(mdPath, mdReport, "utf8");

    const jsonPath = path.join(reportsDir, "vitals-overview.json");
    fs.writeFileSync(
      jsonPath,
      JSON.stringify({ anr: anrRows, crash: crashRows }, null, 2),
      "utf8",
    );

    console.log(`\n🎉 Success! Vitals overview saved to:`);
    console.log(`  - ${mdPath}`);
    console.log(`  - ${jsonPath}`);
  } catch (err) {
    console.error(`\n❌ Error:`, err.message);
    process.exit(1);
  }
}

main();
