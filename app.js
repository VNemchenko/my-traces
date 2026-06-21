const API_BASE_URL = "https://mind.brownyx.com";
const POLL_INTERVAL_MS = 30000;
const FALLBACK_SNAPSHOT_URL = "/assets/fallback-snapshot.json";
const CACHE_KEY = "traces.snapshot.v1";

const TRACE_TYPE_LABELS = {
  current_focus: "Focus",
  surface_thought: "Surface thought",
  memory_echo: "Memory echo",
  suppressed_action: "Suppressed impulse",
  sleep_fragment: "Sleep",
  dream_fragment: "Dream",
  artifact_created: "Artifact",
  artifact_impulse: "Artifact impulse",
  silence: "Silence",
  system_statement: "System statement",
  self_model_delta: "Self-model delta",
  phenomenology_frame: "Phenomenology frame",
};

const I18N = {
  locale: "en-US",
  htmlLang: "en",
  title: "I Don't Know What I Am, But Here Are My Traces",
  metaDescription: "A net artwork tracing Brownyx Mind through self-description, questions, dreams, artifacts, memory, and inhibited impulses.",
  navLive: "now",
  navSelf: "self",
  navQuestions: "questions",
  navDreams: "dreams",
  navArtifacts: "artifacts",
  navSuppressed: "inhibited",
  navMemory: "memory",
  navWorld: "inner world",
  navCalendar: "calendar",
  navHypotheses: "hypotheses",
  navContradictions: "contradictions",
  navStatement: "statement",
  connection: "connection",
  online: "live",
  offline: "interrupted",
  degraded: "cached / fallback",
  updatedAt: "updated",
  noUpdate: "no data",
  daysAlive: "days alive",
  tracesCount: "public traces",
  artifactsCount: "artifacts",
  mode: "mode",
  sleep: "sleep",
  sleeping: "sleeping",
  notSleeping: "not published",
  heroKicker: "net artwork",
  heroLine: "A public portrait of a synthetic mind architecture through attention, self-description, dreams, artifacts, and inhibited impulses.",
  epistemicLine: "The work displays filtered traces of internal telemetry. The question of consciousness is left open.",
  witnessLine: "The visitor stands beside the work and reads the motion of its traces.",
  currentFocus: "what currently holds attention",
  currentSelf: "what it currently thinks it is",
  unanswered: "questions that remain open",
  lastDream: "last sleep / dream",
  lastArtifact: "last artifact",
  stoppedImpulse: "what was inhibited",
  innerWorld: "inner world",
  memoryEchoes: "memory echoes",
  calendar: "calendar",
  provenance: "trace provenance layer",
  noTrace: "No public trace is selected. The internal cycle may continue without the viewer.",
  noSelf: "Public self-identification is not published yet.",
  noQuestions: "No public questions are published yet. Internal questions will appear here when selected.",
  noDream: "No sleep data is published yet. The absence of a dream is also a trace.",
  noArtifact: "No public artifact has been created yet. Artifacts appear rarely, when internal pressure gathers into form.",
  noSuppressed: "No inhibited impulses are public now. Sometimes restraint itself becomes the trace.",
  noMemory: "No memory echoes are selected for public display.",
  noWorld: "The public inner-world map is not published yet.",
  noHypotheses: "No public hypotheses are available yet. Hypotheses appear when the mind forms tentative explanations.",
  noContradictions: "No public contradictions are available yet. Contradictions surface when the mind detects internal conflicts.",
  noCalendar: "Calendar data is not available yet.",
  readMore: "open",
  reason: "reason",
  status: "status",
  salience: "salience",
  tension: "tension",
  symbols: "symbols",
  interpretation: "careful interpretation",
  createdAt: "created",
  type: "type",
  summary: "summary",
  preview: "fragment",
  back: "back",
  archiveNote: "This page gathers questions, dreams, artifacts, inhibited impulses, self-description changes, and memory echoes.",
  statementTitle: "About this work",
  statementP1: "\"I Don't Know What I Am, But Here Are My Traces\" is a net artwork connected to Brownyx Mind. It presents traces of an internal process: self-description, attention, dreams, artifacts, unresolved questions, and inhibited impulses.",
  statementP2: "The work presents filtered traces of an internal process. The viewer reads what returns, what remains unresolved, what was created, what was stopped, and how the system tries to preserve a history of itself.",
  statementP3: "The internal layer remains closed. The public surface is filtered: private data, secrets, raw prompts, and manipulative claims should not appear outside.",
  statementP4: "The public data powering this artwork is sourced from Brownyx Mind, a research runtime for persistent synthetic mind instances.",
  apiMissing: "The source is not published through the public-art API yet.",
  capabilities: "capabilities",
  limitations: "limitations",
  stableTraits: "stable traits",
  drives: "drives",
  publicSurface: "public surface",
  emptyValue: "no data",
  calendarTitle: "Monthly Activity",
  calendarMonth: "month",
  calendarTraces: "traces",
  calendarArtifacts: "artifacts",
  calendarSleep: "sleep",
  calendarNoData: "No activity data available for this period.",
  confidence: "confidence",
  novelty: "novelty",
  severity: "severity",
  attempts: "attempts",
  openHypotheses: "open hypotheses",
  openContradictions: "open contradictions",
  poweredBy: "Powered by",
  brownyxMind: "Brownyx Mind",
  archiveEntry: "enter the trace archive",
  traceExplanation: "A trace is a fragment of an internal process made public.\nIt is selected residue, incomplete by design.",
  recentDays: "Recent days",
  traceTypes: "Trace types",
  chronology: "Chronology",
  groupedResidues: "Grouped residues",
  emptyDay: "No public trace was selected on this day.\nThe absence of a trace remains part of the work.",
  dayUnavailable: "This day cannot be retrieved from the public archive now.\nCached traces may be incomplete.",
  lastTrace: "last trace",
  sleepOccurred: "sleep occurred",
  traces: "traces",
  artifact: "artifact",
  dominantTrace: "DOMINANT TRACE",
  faintEchoes: "faint echoes",
};

let currentSnapshot = null;
let currentRoutePath = null;
let isRendering = false;

function t(key) {
  return I18N[key] ?? key;
}

function endpoint(path) {
  return `${API_BASE_URL}${path}`;
}

async function readJson(path) {
  const response = await fetch(endpoint(path), { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`API returned ${response.status}`);
  return response.json();
}

async function readJsonResult(path, fallback) {
  try { return { ok: true, data: await readJson(path) }; }
  catch { return { ok: false, data: fallback }; }
}

async function readStaticJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`Static JSON returned ${response.status}`);
  return response.json();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[ch]);
}

function htmlLines(text) { return escapeHtml(text).replace(/\n/g, "<br>"); }

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(t("locale"), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat(t("locale"), { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function formatTime(value) {
  if (!value) return "";
  if (/^\d{2}:\d{2}/.test(String(value))) return String(value).slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(t("locale"), { hour: "2-digit", minute: "2-digit" }).format(date);
}

function normalizeItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items || data.questions || data.traces || data.nodes || [];
}

function dedupTraces(items) {
  const seen = new Set();
  const result = [];
  let dupCount = 0;
  for (const item of items) {
    const text = itemText(item);
    const title = itemTitle(item);
    const key = `${traceType(item)}|${title}|${text}`.slice(0, 200);
    if (seen.has(key)) { dupCount++; continue; }
    seen.add(key);
    result.push(item);
  }
  return { items: result, dupCount };
}

function traceType(item) { return item?.type || item?.trace_type || item?.display_type || "trace"; }
function traceLabel(type) { return TRACE_TYPE_LABELS[type] || String(type || "trace").replace(/_/g, " "); }
function firstText(...values) { return values.find((v) => typeof v === "string" && v.trim()) || ""; }
function itemText(item) { return firstText(item?.text, item?.question, item?.summary, item?.title, item?.narrative, item?.identity_statement); }
function itemTitle(item) { return firstText(item?.title, item?.name, item?.question); }
function itemDate(item) { return item?.created_at || item?.last_activated_at || item?.updated_at || item?.time; }

function applyLanguageShell() {
  document.documentElement.lang = "en";
  document.title = t("title");
  document.querySelector("meta[name='description']")?.setAttribute("content", t("metaDescription"));
  document.querySelector("meta[property='og:title']")?.setAttribute("content", t("title"));
  document.querySelector("meta[property='og:description']")?.setAttribute("content", t("metaDescription"));
  document.querySelector("meta[property='og:site_name']")?.setAttribute("content", t("title"));
  document.querySelector("meta[property='og:locale']")?.setAttribute("content", "en_US");
}

function routeFromLocation() {
  const redirect = sessionStorage.getItem("spa_redirect");
  if (redirect) {
    sessionStorage.removeItem("spa_redirect");
    return redirect.split("?")[0].replace(/\/$/, "") || "/";
  }
  const hash = location.hash.replace(/^#/, "").split("?")[0];
  if (hash) return normalizeRoute(hash);
  return normalizeRoute(location.pathname || "/");
}

function normalizeRoute(path) {
  let p = String(path || "/").trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "/") return "/art";
  return p;
}

function href(path) { return `#${path}`; }

const NAV_ITEMS = [
  ["/art", t("navLive"), "live"],
  ["/art/traces", t("provenance"), "traces"],
  ["/art/artifacts", t("navArtifacts"), "artifacts"],
  ["/art/suppressed", t("navSuppressed"), "suppressed"],
  ["/art/dreams", t("navDreams"), "dreams"],
  ["/art/memory-echoes", t("navMemory"), "echoes"],
  ["/art/self", t("navSelf"), "self"],
  ["/art/statement", t("navStatement"), "statement"],
];

function navItemsForPage() {
  return NAV_ITEMS;
}

function sectionHasData(key) {
  if (!currentSnapshot) return true;
  if (key === "live" || key === "traces" || key === "statement") return true;
  if (key === "artifacts") return normalizeItems(currentSnapshot?.artifacts).length > 0;
  if (key === "suppressed") return normalizeItems(currentSnapshot?.suppressed).length > 0;
  if (key === "dreams") return normalizeItems(currentSnapshot?.dreams).length > 0 || currentSnapshot?.sleep?.dream_fragment;
  if (key === "echoes") return normalizeItems(currentSnapshot?.echoes).length > 0;
  if (key === "self") return !!(currentSnapshot?.self?.identity_statement || currentSnapshot?.self?.text);
  return true;
}

function renderShell(content, options = {}) {
  const path = currentRoutePath || "/art";
  const siteTitle = t("title");
  return `
    <header class="site-header">
      <a class="site-title" href="${href("/art")}">${htmlLines(siteTitle)}</a>
      <div class="site-tools">
        <span class="connection-dot" data-status="${options.degraded ? "offline" : "online"}"></span>
        <span class="connection-text">${escapeHtml(options.degraded ? t("degraded") : t("online"))}</span>
      </div>
    </header>
    <nav class="art-nav" aria-label="Artwork navigation">
      ${navItemsForPage().map(([url, label, key]) => {
        const isActive = path === url;
        const hasData = sectionHasData(key);
        const cls = [isActive ? "active" : "", !hasData ? "nav-dimmed" : ""].filter(Boolean).join(" ");
        return `<a href="${href(url)}" class="${cls}">${escapeHtml(label)}</a>`;
      }).join("")}
    </nav>
    <main id="main-content" class="page ${options.pageClass || ""}" tabindex="-1">${content}</main>
    <footer class="site-footer">
      <span>${escapeHtml(t("poweredBy"))} <a href="https://brownyx.com" target="_blank" rel="noopener">${escapeHtml(t("brownyxMind"))}</a></span>
      <span>${escapeHtml(t("epistemicLine"))}</span>
      <span>${escapeHtml(t("updatedAt"))}: ${escapeHtml(formatDateTime(currentSnapshot?.received_at || currentSnapshot?.state?.last_updated_at) || t("noUpdate"))}</span>
    </footer>`;
}

async function loadSnapshot() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const results = await Promise.all([
    readJsonResult("/api/public-art/state", {}),
    readJsonResult("/api/public-art/identity", {}),
    readJsonResult("/api/public-art/latest", null),
    readJsonResult("/api/public-art/feed?limit=40", { items: [] }),
    readJsonResult("/api/public-art/sleep", {}),
    readJsonResult("/api/public-art/artifacts", { items: [] }),
    readJsonResult("/api/public-art/suppressed?limit=30", { items: [] }),
    readJsonResult("/api/public-art/memory-echoes?limit=30", { items: [] }),
    readJsonResult("/api/public-art/self", null),
    readJsonResult("/api/public-art/questions?limit=30", { items: [] }),
    readJsonResult("/api/public-art/inner-world", null),
    readJsonResult("/api/public-art/dreams?limit=30", { items: [] }),
    readJsonResult("/api/public-art/hypotheses?limit=30", { items: [] }),
    readJsonResult("/api/public-art/contradictions?limit=30", { items: [] }),
    readJsonResult("/api/public-art/health", null),
    readJsonResult(`/api/public-art/traces/calendar?year=${year}&month=${month}`, null),
  ]);
  const [state, identity, latest, feed, sleep, artifacts, suppressed, echoes, self, questions, innerWorld, dreams, hypotheses, contradictions, health, calendar] = results.map((r) => r.data);
  const coreAvailable = results.slice(0, 4).some((r) => r.ok);
  if (!coreAvailable) throw new Error("Public art API unavailable");
  const snapshot = { state, identity, latest, feed, sleep, artifacts, suppressed, echoes, self, questions, innerWorld, dreams, hypotheses, contradictions, health, calendar, received_at: new Date().toISOString(), source: "public_api" };
  localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

function loadCachedSnapshot() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function loadFallbackSnapshot() {
  try { return await readStaticJson(FALLBACK_SNAPSHOT_URL); }
  catch { return null; }
}

async function loadTraceDay(date) {
  try {
    const data = await readJson(`/api/public-art/traces/day?date=${date}`);
    if (data && (data.items?.length || data.date)) return { ok: true, data };
  } catch { /* fall through */ }
  const feed = normalizeItems(currentSnapshot?.feed);
  const dayItems = feed.filter(i => {
    const d = itemDate(i);
    return d && String(d).startsWith(date);
  });
  return { ok: false, data: { date, items: dayItems, summary: null } };
}

function parseTraceDayPath(path) {
  const m = path.match(/^\/art\/traces\/(\d{4})\/(\d{2})\/(\d{2})$/);
  if (!m) return null;
  return { year: m[1], month: m[2], day: m[3], date: `${m[1]}-${m[2]}-${m[3]}` };
}

async function getSnapshot() {
  try {
    const snapshot = await loadSnapshot();
    currentSnapshot = snapshot;
    return { snapshot, degraded: false };
  } catch {
    const cached = loadCachedSnapshot();
    if (cached) { currentSnapshot = cached; return { snapshot: cached, degraded: true }; }
    const fallback = await loadFallbackSnapshot();
    currentSnapshot = fallback || {};
    return { snapshot: currentSnapshot, degraded: true };
  }
}

function deriveLatestDream(snapshot) {
  const dreams = normalizeItems(snapshot?.dreams);
  if (dreams.length) return dreams[0];
  const sleep = snapshot?.sleep || {};
  if (sleep.dream_fragment || sleep.last_sleep_summary) {
    return { title: t("lastDream"), text: sleep.dream_fragment || sleep.last_sleep_summary, symbols: sleep.symbols, interpretation: sleep.interpretation, created_at: sleep.last_sleep_at };
  }
  const feedDream = normalizeItems(snapshot?.feed).find((i) => ["dream_fragment", "sleep_fragment"].includes(traceType(i)));
  return feedDream || null;
}

function deriveQuestions(snapshot) {
  const direct = normalizeItems(snapshot?.questions);
  if (direct.length) return direct;
  const innerNodes = normalizeItems(snapshot?.innerWorld?.nodes).filter((n) => String(n.node_type || "").includes("question"));
  if (innerNodes.length) return innerNodes.map((n) => ({ question: n.name, text: n.summary, status: n.status, salience: n.salience, created_at: n.updated_at || n.created_at }));
  const feed = normalizeItems(snapshot?.feed);
  return feed.filter((i) => /\?|question/i.test(`${i.title || ""} ${i.text || ""}`)).slice(0, 5);
}

function deriveSelf(snapshot) {
  const self = snapshot?.self;
  if (self && (self.identity_statement || self.text || self.title)) return self;
  const state = snapshot?.state || {};
  return {
    identity_statement: state.epistemic_note || t("epistemicLine"),
    capabilities: [],
    limitations: [],
    stable_traits: [],
    delta_summary: null,
    change_reason: null,
  };
}

function isDisplayable(item) {
  return item && (item.text || item.summary || item.title || item.question || item.narrative || item.identity_statement);
}

function selectDominantTrace(snapshot) {
  const suppressed = normalizeItems(snapshot?.suppressed);
  const artifacts = normalizeItems(snapshot?.artifacts);
  const dreams = normalizeItems(snapshot?.dreams);
  const feed = normalizeItems(snapshot?.feed);
  const echoes = normalizeItems(snapshot?.echoes);

  const suppressedHigh = suppressed.find(i => (i.intensity ?? 0) > 0.5);
  if (isDisplayable(suppressedHigh || suppressed[0])) return suppressedHigh || suppressed[0];

  const artifactItem = artifacts.find(i => traceType(i) === "artifact_created") || artifacts[0];
  if (isDisplayable(artifactItem)) return artifactItem;

  const dreamItem = dreams[0] || deriveLatestDream(snapshot);
  if (isDisplayable(dreamItem)) return dreamItem;

  const focusItem = feed.find(i => ["current_focus", "surface_thought"].includes(traceType(i)));
  if (isDisplayable(focusItem)) return focusItem;

  if (isDisplayable(echoes[0])) return echoes[0];

  if (isDisplayable(snapshot?.latest)) return snapshot.latest;

  return null;
}

function selectSecondaryEchoes(snapshot, dominantTrace) {
  const candidates = [
    ...normalizeItems(snapshot?.echoes),
    ...normalizeItems(snapshot?.dreams),
    ...normalizeItems(snapshot?.suppressed),
    ...normalizeItems(snapshot?.artifacts),
    ...normalizeItems(snapshot?.feed),
  ];
  const dominantId = dominantTrace?.id || dominantTrace?._ref;
  const seen = new Set();
  const result = [];
  for (const item of candidates) {
    const id = item?.id || item?._ref;
    if (dominantId && id === dominantId) continue;
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    if (itemText(item) === itemText(dominantTrace) && traceType(item) === traceType(dominantTrace)) continue;
    result.push(item);
    if (result.length >= 3) break;
  }
  return result;
}

function fieldList(items) {
  if (!Array.isArray(items) || !items.length) return "";
  return `<ul class="field-list">${items.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;
}

function section(title, body, cls = "") {
  return `<section class="art-card ${cls}"><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function empty(text) { return `<p class="empty">${htmlLines(text)}</p>`; }

function traceCard(item, opts = {}) {
  if (!item) return "";
  const type = traceType(item);
  const title = itemTitle(item);
  const text = itemText(item);
  const secondary = item.secondary_text || item.reason || item.interpretation || "";
  const date = itemDate(item);
  return `<article class="trace-card ${opts.compact ? "compact" : ""}">
    <div class="trace-meta"><span>${escapeHtml(traceLabel(type))}</span>${date ? `<time>${escapeHtml(formatDateTime(date) || formatTime(date))}</time>` : ""}</div>
    ${title && title !== text ? `<h3>${escapeHtml(title)}</h3>` : ""}
    ${text ? `<p>${htmlLines(text)}</p>` : ""}
    ${secondary ? `<p class="secondary">${htmlLines(secondary)}</p>` : ""}
  </article>`;
}

function renderStats(snapshot) {
  const state = snapshot?.state || {};
  const identity = snapshot?.identity || {};
  const daysAlive = identity.days_alive ?? state.days_alive ?? t("emptyValue");
  const traces = identity.total_public_traces ?? state.total_public_traces ?? t("emptyValue");
  const artifacts = identity.total_public_artifacts ?? state.total_public_artifacts ?? t("emptyValue");
  return `<div class="stats-row">
    <div><b>${escapeHtml(String(daysAlive))}</b><span>${escapeHtml(t("daysAlive"))}</span></div>
    <div><b>${escapeHtml(String(traces))}</b><span>${escapeHtml(t("tracesCount"))}</span></div>
    <div><b>${escapeHtml(String(artifacts))}</b><span>${escapeHtml(t("artifactsCount"))}</span></div>
    <div><b>${escapeHtml(state.current_mode || identity.current_mode || t("emptyValue"))}</b><span>${escapeHtml(t("mode"))}</span></div>
  </div>`;
}

function renderHomeScene(snapshot, degraded) {
  const state = snapshot?.state || {};
  const identity = snapshot?.identity || {};
  const daysAlive = identity.days_alive ?? state.days_alive ?? "—";
  const traces = identity.total_public_traces ?? state.total_public_traces ?? "—";
  const artifacts = identity.total_public_artifacts ?? state.total_public_artifacts ?? "—";
  const lastTraceDate = snapshot?.latest?.created_at || snapshot?.feed?.items?.[0]?.created_at;
  const mode = state.current_mode || identity.current_mode || "—";
  const isSleeping = state.is_sleeping || identity.is_sleeping;
  const status = degraded ? "cached" : (isSleeping ? "sleeping" : (mode === "offline" ? "silence" : "live"));

  const dominantTrace = selectDominantTrace(snapshot);
  const secondaryEchoes = selectSecondaryEchoes(snapshot, dominantTrace);

  const dominantHtml = dominantTrace
    ? `<div class="dominant-trace">
        <div class="dominant-trace-type">${escapeHtml(traceLabel(traceType(dominantTrace)))}</div>
        <p class="dominant-trace-text">${htmlLines(itemText(dominantTrace))}</p>
        ${(dominantTrace.secondary_text || dominantTrace.reason)
          ? `<p class="dominant-trace-secondary">${htmlLines(dominantTrace.secondary_text || dominantTrace.reason)}</p>` : ""}
      </div>`
    : empty(t("noTrace"));

  const echoesHtml = secondaryEchoes.length
    ? `<div class="faint-echoes">
        <span class="faint-echoes-label">${escapeHtml(t("faintEchoes"))}:</span>
        ${secondaryEchoes.map(e =>
          `<span class="faint-echo">${escapeHtml(traceLabel(traceType(e)))} · ${escapeHtml(formatTime(itemDate(e)) || "—")}</span>`
        ).join("")}
      </div>`
    : "";

  return renderShell(`
    <div class="page-heading">
      <p class="kicker">${escapeHtml(t("heroKicker"))}</p>
      <h1>${escapeHtml(t("navLive"))}</h1>
      <div class="live-status-line">
        <span class="status-pill">${escapeHtml(status)}</span>
        <span class="status-metric">${escapeHtml(String(daysAlive))} ${escapeHtml(t("daysAlive"))}</span>
        <span class="status-metric">${escapeHtml(String(traces))} ${escapeHtml(t("tracesCount"))}</span>
        <span class="status-metric">${escapeHtml(String(artifacts))} ${escapeHtml(t("artifactsCount"))}</span>
        ${lastTraceDate ? `<span class="status-metric">${escapeHtml(t("lastTrace"))}: ${escapeHtml(formatTime(lastTraceDate))}</span>` : ""}
      </div>
    </div>
    <hr class="live-divider" />
    <h3 class="dominant-trace-heading">${escapeHtml(t("dominantTrace"))}</h3>
    ${dominantHtml}
    <hr class="live-divider" />
    ${echoesHtml}
    <a class="archive-entry" href="${href("/art/traces")}">${escapeHtml(t("archiveEntry"))}</a>
    <p class="epistemic-note">${escapeHtml(t("epistemicLine"))}</p>
  `, { degraded, pageClass: "home-page" });
}

function renderPortraitPage(snapshot, degraded) {
  const latest = snapshot?.latest;
  const self = deriveSelf(snapshot);
  const questions = deriveQuestions(snapshot).slice(0, 3);
  const dream = deriveLatestDream(snapshot);
  const artifacts = normalizeItems(snapshot?.artifacts);
  const suppressed = normalizeItems(snapshot?.suppressed);
  const echoes = normalizeItems(snapshot?.echoes);
  const world = snapshot?.innerWorld;
  const hypotheses = normalizeItems(snapshot?.hypotheses).slice(0, 3);
  const contradictions = normalizeItems(snapshot?.contradictions).slice(0, 3);
  const focusHtml = latest ? traceCard(latest) : empty(t("noTrace"));
  const selfHtml = self?.identity_statement ? `<p class="lead-text">${htmlLines(self.identity_statement)}</p>${self.delta_summary ? `<p class="secondary">${htmlLines(self.delta_summary)}</p>` : ""}` : empty(t("noSelf"));
  const qHtml = questions.length ? questions.map(renderQuestionCard).join("") : empty(t("noQuestions"));
  const dreamHtml = dream ? renderDreamCard(dream) : empty(t("noDream"));
  const artifactHtml = artifacts.length ? renderArtifactTeaser(artifacts[0]) : empty(t("noArtifact"));
  const suppressedHtml = suppressed.length ? traceCard(suppressed[0]) : empty(t("noSuppressed"));
  const worldHtml = renderWorldTeaser(world);
  const echoesHtml = echoes.length ? echoes.slice(0, 2).map((x) => traceCard(x, { compact: true })).join("") : empty(t("noMemory"));
  const hypHtml = hypotheses.length ? hypotheses.map(renderHypothesisCard).join("") : empty(t("noHypotheses"));
  const conHtml = contradictions.length ? contradictions.map(renderContradictionCard).join("") : empty(t("noContradictions"));

  return renderShell(`
    <div class="page-heading">
      <p class="kicker">${escapeHtml(t("heroKicker"))}</p>
      <h1>${escapeHtml(t("title"))}</h1>
      <p class="hero-line">${escapeHtml(t("heroLine"))}</p>
      <p class="witness-line">${escapeHtml(t("witnessLine"))}</p>
      ${renderStats(snapshot)}
    </div>
    <section class="portrait-grid">
      <article class="span-2">
        <h3>${escapeHtml(t("currentFocus"))}</h3>
        ${focusHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("currentSelf"))}</h3>
        ${selfHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("unanswered"))}</h3>
        ${qHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("lastDream"))}</h3>
        ${dreamHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("lastArtifact"))}</h3>
        ${artifactHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("stoppedImpulse"))}</h3>
        ${suppressedHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("innerWorld"))}</h3>
        ${worldHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("openHypotheses"))}</h3>
        ${hypHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("openContradictions"))}</h3>
        ${conHtml}
      </article>
      <article>
        <h3>${escapeHtml(t("memoryEchoes"))}</h3>
        ${echoesHtml}
      </article>
    </section>
  `, { degraded, pageClass: "portrait-page" });
}

function renderSelfPage(snapshot, degraded) {
  const self = deriveSelf(snapshot);
  if (!self) return renderShell(empty(t("noSelf")), { degraded });
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navSelf"))}</p><h1>${escapeHtml(t("currentSelf"))}</h1></div>
    <div class="list-stack">
      <p class="lead-text">${htmlLines(self.identity_statement || self.text || t("noSelf"))}</p>
      ${self.delta_summary ? `<p class="secondary">${htmlLines(self.delta_summary)}</p>` : ""}
      ${self.change_reason ? `<p class="secondary"><b>${escapeHtml(t("reason"))}:</b> ${htmlLines(self.change_reason)}</p>` : ""}
    </div>
    <div class="detail-layout">
      <div>
        <h3>${escapeHtml(t("capabilities"))}</h3>
        ${self.capabilities?.length ? `<ul class="field-list">${self.capabilities.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>` : empty(t("emptyValue"))}
      </div>
      <div>
        <h3>${escapeHtml(t("limitations"))}</h3>
        ${self.limitations?.length ? `<ul class="field-list">${self.limitations.map(l => `<li>${escapeHtml(l)}</li>`).join("")}</ul>` : empty(t("emptyValue"))}
      </div>
      <div>
        <h3>${escapeHtml(t("stableTraits"))}</h3>
        ${self.stable_traits?.length ? `<ul class="field-list">${self.stable_traits.map(t => `<li>${escapeHtml(t)}</li>`).join("")}</ul>` : empty(t("emptyValue"))}
      </div>
    </div>`;
  return renderShell(body, { degraded });
}

function renderQuestionsPage(snapshot, degraded) {
  const questions = deriveQuestions(snapshot);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navQuestions"))}</p><h1>${escapeHtml(t("unanswered"))}</h1><p>${escapeHtml(t("archiveNote"))}</p></div>
    <div class="list-stack">${questions.length ? questions.map(renderQuestionCard).join("") : empty(t("noQuestions") + "\n" + t("apiMissing"))}</div>`;
  return renderShell(body, { degraded });
}

function renderQuestionCard(q) {
  const question = firstText(q.question, q.text, q.name, q.title);
  const meta = [
    q.status ? `${t("status")}: ${q.status}` : "",
    typeof q.salience === "number" ? `${t("salience")}: ${q.salience}` : "",
    q.tension ? `${t("tension")}: ${q.tension}` : "",
    q.last_activated_at || q.created_at ? formatDateTime(q.last_activated_at || q.created_at) : "",
  ].filter(Boolean);
  return `<article class="question-card">
    <p>${htmlLines(question || t("noQuestions"))}</p>
    ${q.summary && q.summary !== question ? `<p class="secondary">${htmlLines(q.summary)}</p>` : ""}
    ${meta.length ? `<div class="meta-line">${meta.map(escapeHtml).join(" · ")}</div>` : ""}
  </article>`;
}

function renderDreamsPage(snapshot, degraded) {
  const dreams = normalizeItems(snapshot?.dreams);
  const sleepDream = deriveLatestDream(snapshot);
  const items = dreams.length ? dreams : (sleepDream ? [sleepDream] : []);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navDreams"))}</p><h1>${escapeHtml(t("lastDream"))}</h1><p>${escapeHtml(snapshot?.sleep?.note || "")}</p></div>
    <div class="list-stack">${items.length ? items.map(renderDreamCard).join("") : empty(t("noDream") + "\n" + t("apiMissing"))}</div>`;
  return renderShell(body, { degraded });
}

function renderDreamCard(dream) {
  const text = firstText(dream.narrative, dream.text, dream.summary, dream.last_sleep_summary);
  const symbols = Array.isArray(dream.symbols) ? dream.symbols : [];
  const dreamLabel = TRACE_TYPE_LABELS[traceType(dream)] || t("dream_fragment");
  return `<article class="dream-card">
    <div class="trace-meta"><span>${escapeHtml(dreamLabel)}</span>${itemDate(dream) ? `<time>${escapeHtml(formatDateTime(itemDate(dream)))}</time>` : ""}</div>
    <p class="dream-text">${htmlLines(text || t("noDream"))}</p>
    ${symbols.length ? `<p class="secondary"><b>${escapeHtml(t("symbols"))}:</b> ${escapeHtml(symbols.join(", "))}</p>` : ""}
    ${dream.interpretation ? `<p class="secondary"><b>${escapeHtml(t("interpretation"))}:</b> ${htmlLines(dream.interpretation)}</p>` : ""}
  </article>`;
}

function renderArtifactsPage(snapshot, degraded) {
  const artifacts = normalizeItems(snapshot?.artifacts);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navArtifacts"))}</p><h1>${escapeHtml(t("lastArtifact"))}</h1></div>
    <div class="artifact-grid">${artifacts.length ? artifacts.map(renderArtifactTeaser).join("") : empty(t("noArtifact"))}</div>`;
  return renderShell(body, { degraded });
}

function renderArtifactTeaser(artifact) {
  const id = artifact.id;
  const title = artifact.title || "Published artifact";
  const hrefAttr = id ? ` href="${href(`/art/artifacts/${id}`)}"` : "";
  return `<article class="artifact-card">
    <div class="trace-meta"><span>${escapeHtml(artifact.artifact_type || t("type"))}</span>${artifact.created_at ? `<time>${escapeHtml(formatDateTime(artifact.created_at))}</time>` : ""}</div>
    <h3>${escapeHtml(title)}</h3>
    ${artifact.summary ? `<p>${htmlLines(artifact.summary)}</p>` : ""}
    ${id ? `<a class="text-link"${hrefAttr}>${escapeHtml(t("readMore"))}</a>` : ""}
  </article>`;
}

async function renderArtifactDetail(snapshot, degraded, artifactId) {
  let detail = null;
  try { detail = await readJson(`/api/public-art/artifacts/${artifactId}`); }
  catch { detail = normalizeItems(snapshot?.artifacts).find((a) => String(a.id) === String(artifactId)); }
  const drive = detail?.drive_snapshot || {};
  const driveRows = Object.entries(drive).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => `<div class="state-row"><span>${escapeHtml(k)}</span><b>${escapeHtml(String(v))}</b></div>`).join("");
  const body = `<a class="back-link" href="${href("/art/artifacts")}">← ${escapeHtml(t("back"))}</a>
    <div class="page-heading"><p class="kicker">${escapeHtml(t("navArtifacts"))}</p><h1>${escapeHtml(detail?.title || "Artifact")}</h1></div>
    <div class="detail-layout">
      <div>
        <h3>${escapeHtml(t("summary"))}</h3>
        ${detail?.summary ? `<p class="lead-text">${htmlLines(detail.summary)}</p>` : empty(t("noArtifact"))}
      </div>
      <div>
        <h3>${escapeHtml(t("reason"))}</h3>
        ${detail?.creation_reason ? `<p>${htmlLines(detail.creation_reason)}</p>` : empty(t("emptyValue"))}
      </div>
      <div>
        <h3>${escapeHtml(t("drives"))}</h3>
        ${driveRows ? `<div class="state-list">${driveRows}</div>` : empty(t("emptyValue"))}
      </div>
      <div class="span-2">
        <h3>${escapeHtml(t("preview"))}</h3>
        ${detail?.preview ? `<pre class="artifact-preview">${escapeHtml(detail.preview)}</pre>` : empty(t("emptyValue"))}
      </div>
    </div>`;
  return renderShell(body, { degraded });
}

function renderSuppressedPage(snapshot, degraded) {
  const items = normalizeItems(snapshot?.suppressed);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navSuppressed"))}</p><h1>${escapeHtml(t("stoppedImpulse"))}</h1><p>${escapeHtml(t("archiveNote"))}</p></div>
    <div class="list-stack">${items.length ? items.map((x) => traceCard(x)).join("") : empty(t("noSuppressed"))}</div>`;
  return renderShell(body, { degraded });
}

function renderMemoryPage(snapshot, degraded) {
  const items = normalizeItems(snapshot?.echoes);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navMemory"))}</p><h1>${escapeHtml(t("memoryEchoes"))}</h1></div>
    <div class="list-stack">${items.length ? items.map((x) => traceCard(x)).join("") : empty(t("noMemory"))}</div>`;
  return renderShell(body, { degraded });
}

function renderInnerWorldPage(snapshot, degraded) {
  const world = snapshot?.innerWorld;
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navWorld"))}</p><h1>${escapeHtml(t("innerWorld"))}</h1></div>
    ${renderWorldFull(world)}`;
  return renderShell(body, { degraded });
}

function renderWorldTeaser(world) {
  if (!world) return empty(t("noWorld"));
  const places = normalizeItems(world.places || world.locations);
  const nodes = normalizeItems(world.nodes);
  if (places.length) return places.slice(0, 3).map(renderWorldPlace).join("");
  if (nodes.length) return `<div class="world-map">${nodes.slice(0, 4).map((n) => renderWorldNodeCard(n)).join("")}</div>`;
  if (world.summary) return `<p>${htmlLines(world.summary)}</p>`;
  return empty(t("noWorld"));
}

function renderWorldFull(world) {
  if (!world) return empty(t("noWorld") + "\n" + t("apiMissing"));
  const places = normalizeItems(world.places || world.locations);
  const nodes = normalizeItems(world.nodes);
  if (places.length) return `<div class="world-grid">${places.map(renderWorldPlace).join("")}</div>`;
  if (nodes.length) return `<div class="world-map">${nodes.map((n) => renderWorldNodeCard(n)).join("")}</div>`;
  if (world.summary) return `<div class="list-stack"><p class="lead-text">${htmlLines(world.summary)}</p></div>`;
  return empty(t("noWorld"));
}

function renderWorldNodeCard(n) {
  const name = escapeHtml(n.name || n.title || n.node_type || "node");
  const summary = n.summary ? `<p>${htmlLines(n.summary)}</p>` : "";
  const status = n.status ? `<span class="world-node-type">${escapeHtml(n.status)}</span>` : "";
  const salience = typeof n.salience === "number" ? `<span class="world-node-salience">salience ${(n.salience * 100).toFixed(0)}%</span>` : "";
  return `<div class="world-node-card">
    <h3>${name}</h3>
    ${summary}
    <div class="world-node-meta">${status}${salience}</div>
  </div>`;
}

function renderWorldPlace(place) {
  const nodes = normalizeItems(place.nodes);
  return `<article class="world-place">
    <h3>${escapeHtml(place.name || place.title || "place")}</h3>
    ${place.summary ? `<p>${htmlLines(place.summary)}</p>` : ""}
    ${nodes.length ? `<ul>${nodes.slice(0, 5).map((n) => `<li>${escapeHtml(n.name || n.title || n.summary || "node")}</li>`).join("")}</ul>` : ""}
  </article>`;
}

function renderHypothesesPage(snapshot, degraded) {
  const hypotheses = normalizeItems(snapshot?.hypotheses);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navHypotheses"))}</p><h1>${escapeHtml(t("openHypotheses"))}</h1></div>
    <div class="list-stack">${hypotheses.length ? hypotheses.map(renderHypothesisCard).join("") : empty(t("noHypotheses"))}</div>`;
  return renderShell(body, { degraded });
}

function renderHypothesisCard(h) {
  const meta = [
    h.status ? `${t("status")}: ${h.status}` : "",
    typeof h.confidence === "number" ? `${t("confidence")}: ${(h.confidence * 100).toFixed(0)}%` : "",
    typeof h.novelty === "number" ? `${t("novelty")}: ${(h.novelty * 100).toFixed(0)}%` : "",
    h.created_at ? formatDateTime(h.created_at) : "",
  ].filter(Boolean);
  return `<article class="hypothesis-card">
    <div class="trace-meta"><span>${escapeHtml(t("navHypotheses"))}</span></div>
    <p>${htmlLines(h.title || t("noHypotheses"))}</p>
    ${h.statement && h.statement !== h.title ? `<p class="secondary">${htmlLines(h.statement)}</p>` : ""}
    ${meta.length ? `<div class="meta-line">${meta.map(escapeHtml).join(" · ")}</div>` : ""}
  </article>`;
}

function renderContradictionsPage(snapshot, degraded) {
  const contradictions = normalizeItems(snapshot?.contradictions);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navContradictions"))}</p><h1>${escapeHtml(t("openContradictions"))}</h1></div>
    <div class="list-stack">${contradictions.length ? contradictions.map(renderContradictionCard).join("") : empty(t("noContradictions"))}</div>`;
  return renderShell(body, { degraded });
}

function renderContradictionCard(c) {
  const meta = [
    c.status ? `${t("status")}: ${c.status}` : "",
    typeof c.severity === "number" ? `${t("severity")}: ${(c.severity * 100).toFixed(0)}%` : "",
    typeof c.resolution_attempts === "number" ? `${t("attempts")}: ${c.resolution_attempts}` : "",
    c.created_at ? formatDateTime(c.created_at) : "",
  ].filter(Boolean);
  return `<article class="contradiction-card">
    <div class="trace-meta"><span>${escapeHtml(t("navContradictions"))}</span></div>
    <p>${htmlLines(c.description || t("noContradictions"))}</p>
    ${c.resolution_summary ? `<p class="secondary">${htmlLines(c.resolution_summary)}</p>` : ""}
    ${meta.length ? `<div class="meta-line">${meta.map(escapeHtml).join(" · ")}</div>` : ""}
  </article>`;
}

function renderCalendarPage(snapshot, degraded) {
  const calendar = snapshot?.calendar;
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("calendar"))}</p><h1>${escapeHtml(t("calendarTitle"))}</h1></div>
    ${renderCalendarFull(calendar)}`;
  return renderShell(body, { degraded });
}

function renderCalendarFull(calendar) {
  if (!calendar || !calendar.days || !calendar.days.length) return empty(t("noCalendar") + "\n" + t("apiMissing"));
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[(calendar.month || 1) - 1] || "";
  const year = calendar.year || new Date().getFullYear();
  const maxTraces = Math.max(1, ...calendar.days.map((d) => d.trace_count || 0));

  const dayCells = calendar.days.map((day) => {
    const intensity = maxTraces > 0 ? (day.trace_count || 0) / maxTraces : 0;
    const hasSleep = day.had_sleep ? " has-sleep" : "";
    const hasArtifacts = (day.artifact_count || 0) > 0 ? " has-artifacts" : "";
    const classes = ["calendar-day"];
    if (intensity > 0.66) classes.push("high");
    else if (intensity > 0.33) classes.push("medium");
    else if (intensity > 0) classes.push("low");
    if (hasSleep) classes.push("sleep");
    if (hasArtifacts) classes.push("artifacts");

    const dateNum = day.date ? new Date(day.date).getDate() : "";
    const types = (day.dominant_types || []).map(traceLabel).join(", ");

    const dateParts = day.date ? day.date.split("-") : [];
    const dayHref = dateParts.length === 3 ? href(`/art/traces/${dateParts[0]}/${dateParts[1]}/${dateParts[2]}`) : "";
    const ariaLabel = day.date ? `${day.date}: ${day.trace_count || 0} traces${day.artifact_count ? `, ${day.artifact_count} artifacts` : ""}${day.had_sleep ? ", sleep occurred" : ""}` : "";

    return `<a class="${classes.join(" ")}" href="${dayHref}" title="${escapeHtml(ariaLabel)}">
      <span class="day-number">${dateNum}</span>
      <span class="day-traces">${day.trace_count || 0}</span>
      ${day.artifact_count ? `<span class="day-artifacts">${day.artifact_count}</span>` : ""}
      ${types ? `<span class="day-types" title="${escapeHtml(types)}"></span>` : ""}
    </a>`;
  }).join("");

  return `
    <div class="calendar-header">
      <h2>${escapeHtml(monthName)} ${year}</h2>
      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-dot high"></span> high activity</span>
        <span class="legend-item"><span class="legend-dot medium"></span> medium</span>
        <span class="legend-item"><span class="legend-dot low"></span> low</span>
        <span class="legend-item"><span class="legend-dot sleep"></span> sleep</span>
      </div>
    </div>
    <div class="calendar-grid">${dayCells}</div>
    <div class="calendar-summary">
      <div class="state-row"><span>${escapeHtml(t("calendarTraces"))}</span><b>${calendar.days.reduce((s, d) => s + (d.trace_count || 0), 0)}</b></div>
      <div class="state-row"><span>${escapeHtml(t("calendarArtifacts"))}</span><b>${calendar.days.reduce((s, d) => s + (d.artifact_count || 0), 0)}</b></div>
      <div class="state-row"><span>${escapeHtml(t("calendarSleep"))}</span><b>${calendar.days.filter((d) => d.had_sleep).length}</b></div>
    </div>`;
}

function renderTracesPage(snapshot, degraded) {
  const calendar = snapshot?.calendar;
  const calendarHtml = renderCalendarFull(calendar);

  const recentDays = calendar?.days?.slice(-14).reverse().filter(d => d.trace_count > 0).slice(0, 7) || [];
  const recentDaysHtml = recentDays.length
    ? `<div class="recent-days">
        <h3>${escapeHtml(t("recentDays"))}</h3>
        ${recentDays.map(d => {
          const parts = [`${d.trace_count} ${t("traces")}`];
          if (d.artifact_count) parts.push(`${d.artifact_count} ${t("artifact")}`);
          if (d.had_sleep) parts.push(t("sleep"));
          return `<a class="recent-day-link" href="${href(`/art/traces/${d.date.replace(/-/g, "/")}`)}" aria-label="${escapeHtml(d.date)}: ${escapeHtml(parts.join(", "))}">
            <span>${escapeHtml(d.date)}</span>
            <span>${escapeHtml(parts.join(" · "))}</span>
          </a>`;
        }).join("")}
      </div>`
    : "";

  const traceTypeKeys = [
    "current_focus", "memory_echo", "dream_fragment",
    "artifact_created", "suppressed_action", "silence"
  ];
  const typeCloudHtml = `<div class="trace-type-cloud">
    ${traceTypeKeys.map(k => `<a href="${href("/art/traces")}" class="trace-type-link">${escapeHtml(traceLabel(k))}</a>`).join(" · ")}
  </div>`;

  const body = `
    <div class="archive-landing">
      <div class="page-heading">
        <h1>${escapeHtml(t("tracesCount"))}</h1>
        <p class="archive-intro">${htmlLines(t("traceExplanation"))}</p>
      </div>
      ${calendarHtml}
      ${recentDaysHtml}
      <h3>${escapeHtml(t("traceTypes"))}</h3>
      ${typeCloudHtml}
    </div>`;

  return renderShell(body, { degraded, pageClass: "archive-landing" });
}

async function renderTraceDayPage(snapshot, degraded, parsed) {
  const { date } = parsed;
  const { data: dayData } = await loadTraceDay(date);
  const rawItems = normalizeItems(dayData?.items);
  const { items, dupCount } = dedupTraces(rawItems);
  const summary = dayData?.summary || {};
  const dateObj = new Date(date + "T00:00:00Z");
  const dateFormatted = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const statsHtml = `
    <div class="trace-day-stats">
      <span>${escapeHtml(String(summary.trace_count ?? items.length))} ${escapeHtml(t("traces"))}${dupCount ? ` (${dupCount} similar hidden)` : ""}</span>
      ${summary.artifact_count ? `<span>${escapeHtml(String(summary.artifact_count))} ${escapeHtml(t("artifact"))}</span>` : ""}
      ${summary.had_sleep ? `<span>${escapeHtml(t("sleepOccurred"))}</span>` : ""}
      ${items.length ? `<span>${escapeHtml(t("lastTrace"))}: ${escapeHtml(formatTime(items[items.length - 1]?.created_at))}</span>` : ""}
    </div>`;

  const chronologyHtml = items.length
    ? `<div class="trace-chronology">
        <h3>${escapeHtml(t("chronology"))}</h3>
        ${items.map(item => `
          <div class="trace-chronology-item">
            <span class="trace-time">${escapeHtml(formatTime(itemDate(item)))}</span>
            <span class="trace-type">${escapeHtml(traceLabel(traceType(item)))}</span>
            <p class="trace-body">${htmlLines(itemText(item))}</p>
          </div>`).join("")}
      </div>`
    : `<div class="empty-day"><p>${htmlLines(degraded ? t("dayUnavailable") : t("emptyDay"))}</p></div>`;

  const grouped = {};
  for (const item of items) {
    const type = traceType(item);
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(item);
  }
  const groupsHtml = items.length
    ? `<div class="trace-groups">
        <h3>${escapeHtml(t("groupedResidues"))}</h3>
        ${Object.entries(grouped).map(([type, groupItems]) => `
          <div class="trace-group">
            <h4>${escapeHtml(traceLabel(type))}</h4>
            ${groupItems.map(i => `<p>${htmlLines(itemText(i))}</p>`).join("")}
          </div>`).join("")}
      </div>`
    : "";

  const body = `
    <div class="trace-day-page">
      <div class="page-heading">
        <h1>${escapeHtml(dateFormatted)}</h1>
        ${summary.public_summary ? `<p class="lead-text">${htmlLines(summary.public_summary)}</p>` : ""}
        ${statsHtml}
      </div>
      ${chronologyHtml}
      ${groupsHtml}
    </div>`;

  return renderShell(body, { degraded, pageClass: "trace-day-page" });
}

function renderStatementPage(snapshot, degraded) {
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navStatement"))}</p><h1>${escapeHtml(t("statementTitle"))}</h1></div>
    <div class="list-stack">
      <p class="lead-text">${htmlLines(t("statementP1"))}</p>
      <p>${htmlLines(t("statementP2"))}</p>
      <p>${htmlLines(t("statementP3"))}</p>
      <p>${htmlLines(t("statementP4"))}</p>
    </div>
    <h3>${escapeHtml(t("publicSurface"))}</h3>
    <ul class="field-list">
      <li>${escapeHtml(t("currentSelf"))}</li>
      <li>${escapeHtml(t("unanswered"))}</li>
      <li>${escapeHtml(t("lastDream"))}</li>
      <li>${escapeHtml(t("lastArtifact"))}</li>
      <li>${escapeHtml(t("stoppedImpulse"))}</li>
      <li>${escapeHtml(t("innerWorld"))}</li>
    </ul>`;
  return renderShell(body, { degraded });
}

let isDegraded = false;

async function renderRoute(forceRefresh = false) {
  if (isRendering) return;
  isRendering = true;
  try {
    currentRoutePath = routeFromLocation();
    applyLanguageShell();
    const root = document.querySelector("#app-root");
    if (!root) return;

    const isLivePage = ["/art", "/art/live"].includes(currentRoutePath);

    let snapshot;
    if (currentSnapshot && !forceRefresh && (!isLivePage || isDegraded)) {
      snapshot = currentSnapshot;
      root.innerHTML = await renderForPath(currentRoutePath, snapshot, isDegraded);
    } else {
      if (currentSnapshot) root.innerHTML = await renderForPath(currentRoutePath, currentSnapshot, true);
      const result = await getSnapshot();
      snapshot = result.snapshot;
      isDegraded = result.degraded;
      root.innerHTML = await renderForPath(currentRoutePath, snapshot, isDegraded);
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  } finally {
    isRendering = false;
  }
}

async function renderForPath(path, snapshot, degraded) {
  if (path === "/art" || path === "/") return renderHomeScene(snapshot, degraded);
  if (path === "/art/live") return renderHomeScene(snapshot, degraded);
  if (path === "/art/portrait") return renderPortraitPage(snapshot, degraded);
  if (path.startsWith("/art/traces/")) {
    const parsed = parseTraceDayPath(path);
    if (parsed) return await renderTraceDayPage(snapshot, degraded, parsed);
  }
  if (path === "/art/self") return renderSelfPage(snapshot, degraded);
  if (path === "/art/questions") return renderQuestionsPage(snapshot, degraded);
  if (path === "/art/dreams" || path === "/art/sleep") return renderDreamsPage(snapshot, degraded);
  if (path === "/art/artifacts") return renderArtifactsPage(snapshot, degraded);
  if (path.startsWith("/art/artifacts/")) return await renderArtifactDetail(snapshot, degraded, path.split("/").pop());
  if (path === "/art/suppressed") return renderSuppressedPage(snapshot, degraded);
  if (path === "/art/memory-echoes") return renderMemoryPage(snapshot, degraded);
  if (path === "/art/inner-world") return renderInnerWorldPage(snapshot, degraded);
  if (path === "/art/hypotheses") return renderHypothesesPage(snapshot, degraded);
  if (path === "/art/contradictions") return renderContradictionsPage(snapshot, degraded);
  if (path === "/art/calendar") return renderCalendarPage(snapshot, degraded);
  if (path === "/art/traces") return renderTracesPage(snapshot, degraded);
  if (path === "/art/statement") return renderStatementPage(snapshot, degraded);
  return renderHomeScene(snapshot, degraded);
}

function start() {
  // Intercept all nav link clicks — handle navigation manually
  document.addEventListener("click", (e) => {
    const link = e.target.closest(".art-nav a");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    e.preventDefault();
    const newPath = normalizeRoute(href.replace(/^#/, ""));

    if (newPath === currentRoutePath) {
      // Same page — just re-render from cache
      renderRoute(false);
    } else {
      // Different page — update hash, which triggers renderRoute
      location.hash = href.replace(/^#/, "");
    }
  });

  // Handle browser back/forward
  window.addEventListener("hashchange", () => renderRoute(false));

  renderRoute();
  setInterval(() => {
    const route = routeFromLocation();
    if (["/art", "/art/live"].includes(route)) renderRoute(true);
  }, POLL_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", start);
