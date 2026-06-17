import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const outputPath = resolve(root, "assets", "fallback-snapshot.json");

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        if (index === -1) return [line, ""];
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

async function readJson(baseUrl, path, fallback) {
  try {
    const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch {
    return fallback;
  }
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const apiBaseUrl = (env.TRACES_API_BASE_URL || "https://mind.brownyx.com").replace(/\/$/, "");
const generatedAt = new Date().toISOString();

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");

const [state, identity, latest, feed, sleep, artifacts, suppressed, echoes, self, questions, innerWorld, dreams, health, calendar] = await Promise.all([
  readJson(apiBaseUrl, "/api/public-art/state", {}),
  readJson(apiBaseUrl, "/api/public-art/identity", {}),
  readJson(apiBaseUrl, "/api/public-art/latest", null),
  readJson(apiBaseUrl, "/api/public-art/feed?limit=40", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/sleep", {}),
  readJson(apiBaseUrl, "/api/public-art/artifacts", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/suppressed?limit=30", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/memory-echoes?limit=30", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/self", null),
  readJson(apiBaseUrl, "/api/public-art/questions?limit=30", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/inner-world", null),
  readJson(apiBaseUrl, "/api/public-art/dreams?limit=30", { items: [] }),
  readJson(apiBaseUrl, "/api/public-art/health", null),
  readJson(apiBaseUrl, `/api/public-art/traces/calendar?year=${year}&month=${month}`, null),
]);

const snapshot = {
  schema_version: 3,
  source: "static_fallback",
  generated_at: generatedAt,
  state,
  identity,
  latest,
  feed,
  sleep,
  artifacts,
  suppressed,
  echoes,
  self,
  questions,
  innerWorld,
  dreams,
  health,
  calendar,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(`Updated ${outputPath}`);
