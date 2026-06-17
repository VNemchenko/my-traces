import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");
const configPath = resolve(root, "config.js");

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

const env = parseEnv(readFileSync(envPath, "utf8"));
const language = ["en", "ru", "zh"].includes(env.SLEDSLED_DEFAULT_LANGUAGE)
  ? env.SLEDSLED_DEFAULT_LANGUAGE
  : "ru";

const apiBaseUrl = env.SLEDSLED_API_BASE_URL || "https://mind.brownyx.com";
const pollIntervalMs = Number(env.SLEDSLED_POLL_INTERVAL_MS || 30000);
const fallbackSnapshotUrl = env.SLEDSLED_FALLBACK_SNAPSHOT_URL || "/assets/fallback-snapshot.json";

writeFileSync(
  configPath,
  `window.SLEDSLED_CONFIG = {\n  API_BASE_URL: ${JSON.stringify(apiBaseUrl)},\n  POLL_INTERVAL_MS: ${Number.isFinite(pollIntervalMs) ? pollIntervalMs : 30000},\n  FALLBACK_SNAPSHOT_URL: ${JSON.stringify(fallbackSnapshotUrl)},\n  DEFAULT_LANGUAGE: ${JSON.stringify(language)},\n};\n`,
  "utf8"
);
