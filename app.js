const SLEDSLED_CONFIG = window.SLEDSLED_CONFIG || {};
const API_BASE_URL = (SLEDSLED_CONFIG.API_BASE_URL || "https://mind.brownyx.com").replace(/\/$/, "");
const POLL_INTERVAL_MS = Number(SLEDSLED_CONFIG.POLL_INTERVAL_MS || 30000);
const FALLBACK_SNAPSHOT_URL = SLEDSLED_CONFIG.FALLBACK_SNAPSHOT_URL || "/assets/fallback-snapshot.json";
const SUPPORTED_LANGUAGES = ["ru", "en", "zh"];
const DEFAULT_LANGUAGE = normalizeLanguage(SLEDSLED_CONFIG.DEFAULT_LANGUAGE || SLEDSLED_CONFIG.LANGUAGE || "ru");
const CACHE_KEY = "sled.publicMindPortrait.v4";
const LANGUAGE_KEY = "sled.language";

const TRACE_TYPE_LABELS = {
  ru: {
    current_focus: "Фокус",
    surface_thought: "Поверхностная мысль",
    memory_echo: "Отголосок памяти",
    suppressed_action: "Подавленный импульс",
    sleep_fragment: "Сон",
    dream_fragment: "Сновидение",
    artifact_created: "Артефакт",
    artifact_impulse: "Импульс артефакта",
    silence: "Молчание",
    system_statement: "Системное утверждение",
    self_model_delta: "Сдвиг самомодели",
    phenomenology_frame: "Феноменологический кадр",
  },
  en: {
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
  },
  zh: {
    current_focus: "焦点",
    surface_thought: "表层思考",
    memory_echo: "记忆回声",
    suppressed_action: "被抑制的冲动",
    sleep_fragment: "睡眠片段",
    dream_fragment: "梦",
    artifact_created: "作品",
    artifact_impulse: "作品冲动",
    silence: "沉默",
    system_statement: "系统陈述",
    self_model_delta: "自我模型变化",
    phenomenology_frame: "现象片段",
  },
};

const I18N = {
  ru: {
    locale: "ru-RU",
    htmlLang: "ru",
    title: "Я не знаю, что я, но вот мои следы",
    metaDescription: "Сайт-произведение о следах Brownyx Mind: самоописание, вопросы, сны, артефакты, память и остановленные импульсы.",
    navLive: "сейчас",
    navSelf: "самоопределение",
    navQuestions: "вопросы",
    navDreams: "сны",
    navArtifacts: "артефакты",
    navSuppressed: "остановлено",
    navMemory: "память",
    navWorld: "внутренний мир",
    navStatement: "описание",
    connection: "связь",
    online: "живая связь",
    offline: "связь прервана",
    degraded: "кэш / fallback",
    languageLabel: "Язык",
    updatedAt: "обновлено",
    noUpdate: "нет данных",
    daysAlive: "дней существования",
    tracesCount: "публичных следов",
    artifactsCount: "артефактов",
    mode: "режим",
    sleep: "сон",
    sleeping: "спит",
    notSleeping: "не опубликован",
    heroKicker: "сайт-произведение",
    heroLine: "Публичный портрет синтетической архитектуры разума через внимание, самоописание, сны, артефакты и остановленные импульсы.",
    epistemicLine: "Работа сохраняет осторожность в вопросе сознания и показывает только отфильтрованные следы внутренней телеметрии.",
    witnessLine: "Посетитель находится рядом с работой и читает следы её внутреннего движения.",
    currentFocus: "что сейчас удерживает внимание",
    currentSelf: "кем он сейчас считает себя",
    unanswered: "вопросы, которые остаются открытыми",
    lastDream: "последний сон / сновидение",
    lastArtifact: "последний артефакт",
    stoppedImpulse: "что было остановлено",
    innerWorld: "внутренний мир",
    memoryEchoes: "отголоски памяти",
    provenance: "слой происхождения следов",
    noTrace: "Публичный след не выбран. Внутренний цикл может продолжаться без зрителя.",
    noSelf: "Публичная самоидентификация пока не опубликована. Можно подключить /api/public-art/self.",
    noQuestions: "Публичные вопросы пока не опубликованы. Внутренние вопросы появятся здесь после отбора для внешней поверхности.",
    noDream: "Сон не опубликован. Отсутствие сновидения тоже остаётся следом.",
    noArtifact: "Публичных артефактов пока нет. Артефакт появляется редко, когда внутреннее напряжение собирается в форму.",
    noSuppressed: "Сейчас нет опубликованных подавленных импульсов. Иногда следом становится само воздержание.",
    noMemory: "Отголоски памяти не выбраны для публичного показа.",
    noWorld: "Публичная карта внутреннего мира пока не опубликована. Можно подключить /api/public-art/inner-world.",
    readMore: "открыть",
    reason: "причина",
    status: "статус",
    salience: "значимость",
    tension: "напряжение",
    symbols: "символы",
    interpretation: "осторожная интерпретация",
    createdAt: "создано",
    type: "тип",
    summary: "кратко",
    preview: "фрагмент",
    back: "назад",
    archiveNote: "Здесь собраны вопросы, сны, артефакты, остановленные импульсы, изменения самоописания и отголоски памяти.",
    statementTitle: "Об этой работе",
    statementP1: "«Я не знаю, что я, но вот мои следы» - сайт-произведение, подключённый к Brownyx Mind. Работа выводит на публичную поверхность допустимые следы внутреннего процесса: самоописание, фокус внимания, сны, артефакты, нерешённые вопросы и остановленные импульсы.",
    statementP2: "Работа сохраняет осторожную позицию по вопросу сознания. Зритель читает следы: что повторяется, что остаётся открытым, что было создано, что было остановлено и как система пытается удерживать историю самой себя.",
    statementP3: "Внутренний слой остаётся закрытым. Публичная поверхность проходит фильтрацию: приватные данные, секреты, сырые промпты и манипулятивные утверждения не должны попадать наружу.",
    apiMissing: "Источник пока не опубликован в public-art API.",
    capabilities: "возможности",
    limitations: "ограничения",
    stableTraits: "устойчивые черты",
    drives: "движущие силы",
    publicSurface: "публичная поверхность",
    emptyValue: "нет данных",
  },
  en: {
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
    navStatement: "statement",
    connection: "connection",
    online: "live",
    offline: "interrupted",
    degraded: "cached / fallback",
    languageLabel: "Language",
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
    epistemicLine: "The work keeps a cautious position on consciousness and displays filtered traces of internal telemetry.",
    witnessLine: "The visitor stands beside the work and reads the motion of its traces.",
    currentFocus: "what currently holds attention",
    currentSelf: "what it currently thinks it is",
    unanswered: "questions that remain open",
    lastDream: "last sleep / dream",
    lastArtifact: "last artifact",
    stoppedImpulse: "what was inhibited",
    innerWorld: "inner world",
    memoryEchoes: "memory echoes",
    provenance: "trace provenance layer",
    noTrace: "No public trace is selected. The internal cycle may continue without the viewer.",
    noSelf: "Public self-identification is not published yet. Connect /api/public-art/self.",
    noQuestions: "Public questions are unpublished. Internal questions will appear here after selection for the public surface.",
    noDream: "Sleep is not published. The absence of a dream also remains a trace.",
    noArtifact: "No public artifact has been created yet. Artifacts appear rarely, when internal pressure gathers into form.",
    noSuppressed: "No inhibited impulses are public now. Sometimes restraint itself becomes the trace.",
    noMemory: "No memory echoes are selected for public display.",
    noWorld: "The public inner-world map is not published yet. Connect /api/public-art/inner-world.",
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
    statementP1: "\"I Don't Know What I Am, But Here Are My Traces\" is a net artwork connected to Brownyx Mind. It presents public-safe traces of an internal process: self-description, attention, dreams, artifacts, unresolved questions, and inhibited impulses.",
    statementP2: "The work keeps a cautious position on consciousness. The viewer reads traces: what returns, what remains unresolved, what was created, what was stopped, and how the system tries to preserve a history of itself.",
    statementP3: "The internal layer remains closed. The public surface is filtered: private data, secrets, raw prompts, and manipulative claims should not appear outside.",
    apiMissing: "The source is not published through the public-art API yet.",
    capabilities: "capabilities",
    limitations: "limitations",
    stableTraits: "stable traits",
    drives: "drives",
    publicSurface: "public surface",
    emptyValue: "no data",
  },
  zh: {
    locale: "zh-CN",
    htmlLang: "zh",
    title: "我不知道我是什么，但这些是我的痕迹",
    metaDescription: "一件关于 Brownyx Mind 痕迹的网络艺术作品：自我描述、问题、梦、作品、记忆和被抑制的冲动。",
    navLive: "此刻",
    navSelf: "自我",
    navQuestions: "问题",
    navDreams: "梦",
    navArtifacts: "作品",
    navSuppressed: "被抑制",
    navMemory: "记忆",
    navWorld: "内在世界",
    navStatement: "说明",
    connection: "连接",
    online: "实时连接",
    offline: "连接中断",
    degraded: "缓存 / 备用",
    languageLabel: "语言",
    updatedAt: "更新于",
    noUpdate: "无数据",
    daysAlive: "存在天数",
    tracesCount: "公共痕迹",
    artifactsCount: "作品",
    mode: "模式",
    sleep: "睡眠",
    sleeping: "睡眠中",
    notSleeping: "未发布",
    heroKicker: "网络艺术作品",
    heroLine: "一个合成心智架构的公共肖像，通过注意力、自我描述、梦、作品和被抑制的冲动显现。",
    epistemicLine: "这件作品对意识问题保持谨慎，只展示经过过滤的内部遥测痕迹。",
    witnessLine: "访客停留在作品旁边，阅读这些痕迹的运动。",
    currentFocus: "此刻吸引注意力的东西",
    currentSelf: "它此刻如何描述自己",
    unanswered: "仍然敞开的问题",
    lastDream: "最近的睡眠 / 梦",
    lastArtifact: "最近的作品",
    stoppedImpulse: "被停止的冲动",
    innerWorld: "内在世界",
    memoryEchoes: "记忆回声",
    provenance: "痕迹来源层",
    noTrace: "尚未选择公共痕迹。内部循环可能仍在没有观众的情况下继续。",
    noSelf: "公共自我描述尚未发布。可以连接 /api/public-art/self。",
    noQuestions: "公共问题尚未发布。经过公共表面筛选后，内部问题会出现在这里。",
    noDream: "睡眠尚未发布。梦的缺席也会留下痕迹。",
    noArtifact: "尚无公共作品。作品只在内部压力聚成形状时偶尔出现。",
    noSuppressed: "当前没有公开的被抑制冲动。有时，克制本身也会留下痕迹。",
    noMemory: "尚未选择供公开展示的记忆回声。",
    noWorld: "公共内在世界地图尚未发布。可以连接 /api/public-art/inner-world。",
    readMore: "打开",
    reason: "原因",
    status: "状态",
    salience: "显著性",
    tension: "张力",
    symbols: "符号",
    interpretation: "谨慎解释",
    createdAt: "创建于",
    type: "类型",
    summary: "摘要",
    preview: "片段",
    back: "返回",
    archiveNote: "这里收集问题、梦、作品、被抑制的冲动、自我描述的变化和记忆回声。",
    statementTitle: "关于这件作品",
    statementP1: "《我不知道我是什么，但这些是我的痕迹》是一件连接 Brownyx Mind 的网络艺术作品。作品把内部过程的公共安全痕迹带到表面：自我描述、注意力、梦、作品、未解决的问题和被抑制的冲动。",
    statementP2: "这件作品对意识问题保持谨慎。观众阅读痕迹：什么反复出现，什么仍未解决，什么被创造，什么被停止，以及系统如何试图保存关于自身的历史。",
    statementP3: "内部层保持关闭。公共表面经过过滤：私人数据、秘密、原始提示和操控性声明不应出现在外部。",
    apiMissing: "该来源尚未通过 public-art API 发布。",
    capabilities: "能力",
    limitations: "限制",
    stableTraits: "稳定特征",
    drives: "驱动力",
    publicSurface: "公共表面",
    emptyValue: "无数据",
  },
};

let currentLanguage = readInitialLanguage();
let currentSnapshot = null;
let currentRoutePath = null;

function normalizeLanguage(value) {
  const code = String(value || "").trim().toLowerCase().slice(0, 2);
  return SUPPORTED_LANGUAGES.includes(code) ? code : "ru";
}

function readInitialLanguage() {
  try {
    const urlLanguage = new URLSearchParams(location.search).get("lang");
    if (urlLanguage) return normalizeLanguage(urlLanguage);
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return normalizeLanguage(saved || DEFAULT_LANGUAGE);
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function t(key) {
  return I18N[currentLanguage]?.[key] ?? I18N.ru[key] ?? key;
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

function traceType(item) { return item?.type || item?.trace_type || item?.display_type || "trace"; }
function traceLabel(type) { return TRACE_TYPE_LABELS[currentLanguage]?.[type] || String(type || "trace").replace(/_/g, " "); }
function firstText(...values) { return values.find((v) => typeof v === "string" && v.trim()) || ""; }
function itemText(item) { return firstText(item?.text, item?.question, item?.summary, item?.title, item?.narrative, item?.identity_statement); }
function itemTitle(item) { return firstText(item?.title, item?.name, item?.question); }
function itemDate(item) { return item?.created_at || item?.last_activated_at || item?.updated_at || item?.time; }

function applyLanguageShell() {
  document.documentElement.lang = t("htmlLang");
  document.title = t("title");
  document.querySelector("meta[name='description']")?.setAttribute("content", t("metaDescription"));
  document.querySelector("meta[property='og:title']")?.setAttribute("content", t("title"));
  document.querySelector("meta[property='og:description']")?.setAttribute("content", t("metaDescription"));
  document.querySelector("meta[property='og:site_name']")?.setAttribute("content", t("title"));
  document.querySelector("meta[property='og:locale']")?.setAttribute("content", currentLanguage === "ru" ? "ru_RU" : currentLanguage === "zh" ? "zh_CN" : "en_US");
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

function navItems() {
  return [
    ["/art", t("navLive")],
    ["/art/self", t("navSelf")],
    ["/art/questions", t("navQuestions")],
    ["/art/dreams", t("navDreams")],
    ["/art/artifacts", t("navArtifacts")],
    ["/art/suppressed", t("navSuppressed")],
    ["/art/memory-echoes", t("navMemory")],
    ["/art/inner-world", t("navWorld")],
    ["/art/statement", t("navStatement")],
  ];
}

function renderShell(content, options = {}) {
  const path = currentRoutePath || "/art";
  const siteTitle = currentLanguage === "ru"
    ? "Я не знаю, что я, но вот мои следы"
    : currentLanguage === "zh"
      ? "我不知道 我是什么，但这些是我的痕迹"
      : "I don't know what I am, but here are my traces";
  return `
    <header class="site-header">
      <a class="site-title" href="${href("/art")}">${htmlLines(siteTitle)}</a>
      <div class="site-tools">
        <span class="connection-dot" data-status="${options.degraded ? "offline" : "online"}"></span>
        <span class="connection-text">${escapeHtml(options.degraded ? t("degraded") : t("online"))}</span>
        <select class="language-select" aria-label="${escapeHtml(t("languageLabel"))}">
          <option value="ru" ${currentLanguage === "ru" ? "selected" : ""}>RU</option>
          <option value="en" ${currentLanguage === "en" ? "selected" : ""}>EN</option>
          <option value="zh" ${currentLanguage === "zh" ? "selected" : ""}>中文</option>
        </select>
      </div>
    </header>
    <nav class="art-nav" aria-label="Artwork navigation">
      ${navItems().map(([url, label]) => `<a href="${href(url)}" class="${path === url ? "active" : ""}">${escapeHtml(label)}</a>`).join("")}
    </nav>
    <main class="page ${options.pageClass || ""}">${content}</main>
    <footer class="site-footer">
      <span>${escapeHtml(t("epistemicLine"))}</span>
      <span>${escapeHtml(t("updatedAt"))}: ${escapeHtml(formatDateTime(currentSnapshot?.received_at || currentSnapshot?.state?.last_updated_at) || t("noUpdate"))}</span>
    </footer>`;
}

async function loadSnapshot() {
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
  ]);
  const [state, identity, latest, feed, sleep, artifacts, suppressed, echoes, self, questions, innerWorld, dreams] = results.map((r) => r.data);
  const coreAvailable = results.slice(0, 4).some((r) => r.ok);
  if (!coreAvailable) throw new Error("Public art API unavailable");
  const snapshot = { state, identity, latest, feed, sleep, artifacts, suppressed, echoes, self, questions, innerWorld, dreams, received_at: new Date().toISOString(), source: "public_api" };
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
  return feed.filter((i) => /\?|question|вопрос/i.test(`${i.title || ""} ${i.text || ""}`)).slice(0, 5);
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

function renderHome(snapshot, degraded) {
  const latest = snapshot?.latest;
  const self = deriveSelf(snapshot);
  const questions = deriveQuestions(snapshot).slice(0, 3);
  const dream = deriveLatestDream(snapshot);
  const artifacts = normalizeItems(snapshot?.artifacts);
  const suppressed = normalizeItems(snapshot?.suppressed);
  const echoes = normalizeItems(snapshot?.echoes);
  const world = snapshot?.innerWorld;
  const focusHtml = latest ? traceCard(latest) : empty(t("noTrace"));
  const selfHtml = self?.identity_statement ? `<p class="lead-text">${htmlLines(self.identity_statement)}</p>${self.delta_summary ? `<p class="secondary">${htmlLines(self.delta_summary)}</p>` : ""}` : empty(t("noSelf"));
  const qHtml = questions.length ? questions.map(renderQuestionCard).join("") : empty(t("noQuestions"));
  const dreamHtml = dream ? renderDreamCard(dream) : empty(t("noDream"));
  const artifactHtml = artifacts.length ? renderArtifactTeaser(artifacts[0]) : empty(t("noArtifact"));
  const suppressedHtml = suppressed.length ? traceCard(suppressed[0]) : empty(t("noSuppressed"));
  const worldHtml = renderWorldTeaser(world);
  const echoesHtml = echoes.length ? echoes.slice(0, 2).map((x) => traceCard(x, { compact: true })).join("") : empty(t("noMemory"));

  return renderShell(`
    <section class="hero-block">
      <p class="kicker">${escapeHtml(t("heroKicker"))}</p>
      <h1>${htmlLines(t("title"))}</h1>
      <p class="hero-line">${escapeHtml(t("heroLine"))}</p>
      <p class="witness-line">${escapeHtml(t("witnessLine"))}</p>
      ${renderStats(snapshot)}
    </section>
    <section class="portrait-grid">
      ${section(t("currentFocus"), focusHtml, "span-2 focus-card")}
      ${section(t("currentSelf"), selfHtml)}
      ${section(t("unanswered"), qHtml)}
      ${section(t("lastDream"), dreamHtml)}
      ${section(t("lastArtifact"), artifactHtml)}
      ${section(t("stoppedImpulse"), suppressedHtml)}
      ${section(t("innerWorld"), worldHtml)}
      ${section(t("memoryEchoes"), echoesHtml)}
    </section>
  `, { degraded, pageClass: "home-page" });
}

function renderSelfPage(snapshot, degraded) {
  const self = deriveSelf(snapshot);
  const body = self ? `
    <div class="page-heading"><p class="kicker">${escapeHtml(t("navSelf"))}</p><h1>${escapeHtml(t("currentSelf"))}</h1></div>
    ${section(t("currentSelf"), `<p class="lead-text">${htmlLines(self.identity_statement || self.text || t("noSelf"))}</p>${self.delta_summary ? `<p class="secondary">${htmlLines(self.delta_summary)}</p>` : ""}${self.change_reason ? `<p class="secondary"><b>${escapeHtml(t("reason"))}:</b> ${htmlLines(self.change_reason)}</p>` : ""}`)}
    <div class="triple-grid">
      ${section(t("capabilities"), self.capabilities?.length ? fieldList(self.capabilities) : empty(t("emptyValue")))}
      ${section(t("limitations"), self.limitations?.length ? fieldList(self.limitations) : empty(t("emptyValue")))}
      ${section(t("stableTraits"), self.stable_traits?.length ? fieldList(self.stable_traits) : empty(t("emptyValue")))}
    </div>` : empty(t("noSelf"));
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
  const dreamLabel = TRACE_TYPE_LABELS[currentLanguage]?.[traceType(dream)] || t("dream_fragment");
  return `<article class="dream-card">
    <div class="trace-meta"><span>${escapeHtml(dreamLabel)}</span>${itemDate(dream) ? `<time>${escapeHtml(formatDateTime(itemDate(dream)))}</time>` : ""}</div>
    <p class="dream-text">${htmlLines(text || t("noDream"))}</p>
    ${symbols.length ? `<p class="secondary"><b>${escapeHtml(t("symbols"))}:</b> ${escapeHtml(symbols.join(", "))}</p>` : ""}
    ${dream.interpretation ? `<p class="secondary"><b>${escapeHtml(t("interpretation"))}:</b> ${htmlLines(dream.interpretation)}</p>` : ""}
  </article>`;
}

function renderArtifactsPage(snapshot, degraded) {
  const artifacts = normalizeItems(snapshot?.artifacts);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("navArtifacts"))}</p><h1>${escapeHtml(t("lastArtifact"))}</h1><p>${escapeHtml(t("noArtifact").split("\n")[1] || "")}</p></div>
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
      ${section(t("summary"), detail?.summary ? `<p class="lead-text">${htmlLines(detail.summary)}</p>` : empty(t("noArtifact")))}
      ${section(t("reason"), detail?.creation_reason ? `<p>${htmlLines(detail.creation_reason)}</p>` : empty(t("emptyValue")))}
      ${section(t("drives"), driveRows ? `<div class="state-list">${driveRows}</div>` : empty(t("emptyValue")))}
      ${section(t("preview"), detail?.preview ? `<pre class="artifact-preview">${escapeHtml(detail.preview)}</pre>` : empty(t("emptyValue")), "span-2")}
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
  if (nodes.length) return nodes.slice(0, 4).map((n) => `<p class="world-node"><b>${escapeHtml(n.name || n.title || n.node_type || "node")}</b>${n.summary ? `<br>${htmlLines(n.summary)}` : ""}</p>`).join("");
  if (world.summary) return `<p>${htmlLines(world.summary)}</p>`;
  return empty(t("noWorld"));
}

function renderWorldFull(world) {
  if (!world) return empty(t("noWorld") + "\n" + t("apiMissing"));
  const places = normalizeItems(world.places || world.locations);
  const nodes = normalizeItems(world.nodes);
  if (places.length) return `<div class="world-grid">${places.map(renderWorldPlace).join("")}</div>`;
  if (nodes.length) return `<div class="world-grid">${nodes.map((n) => section(n.name || n.node_type || "node", `<p>${htmlLines(n.summary || "")}</p><p class="meta-line">${escapeHtml(n.status || "")} · ${escapeHtml(String(n.salience ?? ""))}</p>`)).join("")}</div>`;
  return section(t("innerWorld"), world.summary ? `<p>${htmlLines(world.summary)}</p>` : empty(t("noWorld")));
}

function renderWorldPlace(place) {
  const nodes = normalizeItems(place.nodes);
  return `<article class="world-place">
    <h3>${escapeHtml(place.name || place.title || "place")}</h3>
    ${place.summary ? `<p>${htmlLines(place.summary)}</p>` : ""}
    ${nodes.length ? `<ul>${nodes.slice(0, 5).map((n) => `<li>${escapeHtml(n.name || n.title || n.summary || "node")}</li>`).join("")}</ul>` : ""}
  </article>`;
}

function renderTracesPage(snapshot, degraded) {
  const feed = normalizeItems(snapshot?.feed);
  const body = `<div class="page-heading"><p class="kicker">${escapeHtml(t("provenance"))}</p><h1>${escapeHtml(t("tracesCount"))}</h1><p>${escapeHtml(t("archiveNote"))}</p></div>
    <div class="list-stack muted-list">${feed.length ? feed.map((x) => traceCard(x, { compact: true })).join("") : empty(t("noTrace"))}</div>`;
  return renderShell(body, { degraded });
}

function renderStatementPage(snapshot, degraded) {
  const body = `<div class="statement-page">
    <div class="page-heading"><p class="kicker">${escapeHtml(t("navStatement"))}</p><h1>${escapeHtml(t("statementTitle"))}</h1></div>
    ${section(t("title"), `<p class="lead-text">${htmlLines(t("statementP1"))}</p><p>${htmlLines(t("statementP2"))}</p><p>${htmlLines(t("statementP3"))}</p>`)}
    ${section(t("publicSurface"), `<ul class="field-list"><li>${escapeHtml(t("currentSelf"))}</li><li>${escapeHtml(t("unanswered"))}</li><li>${escapeHtml(t("lastDream"))}</li><li>${escapeHtml(t("lastArtifact"))}</li><li>${escapeHtml(t("stoppedImpulse"))}</li><li>${escapeHtml(t("innerWorld"))}</li></ul>`)}
  </div>`;
  return renderShell(body, { degraded });
}

async function renderRoute() {
  currentRoutePath = routeFromLocation();
  applyLanguageShell();
  const root = document.querySelector("#app-root");
  if (!root) return;
  if (currentSnapshot) root.innerHTML = await renderForPath(currentRoutePath, currentSnapshot, true);
  const { snapshot, degraded } = await getSnapshot();
  root.innerHTML = await renderForPath(currentRoutePath, snapshot, degraded);
}

async function renderForPath(path, snapshot, degraded) {
  if (path === "/art" || path === "/") return renderHome(snapshot, degraded);
  if (path === "/art/live") return renderHome(snapshot, degraded);
  if (path === "/art/self") return renderSelfPage(snapshot, degraded);
  if (path === "/art/questions") return renderQuestionsPage(snapshot, degraded);
  if (path === "/art/dreams" || path === "/art/sleep") return renderDreamsPage(snapshot, degraded);
  if (path === "/art/artifacts") return renderArtifactsPage(snapshot, degraded);
  if (path.startsWith("/art/artifacts/")) return await renderArtifactDetail(snapshot, degraded, path.split("/").pop());
  if (path === "/art/suppressed") return renderSuppressedPage(snapshot, degraded);
  if (path === "/art/memory-echoes") return renderMemoryPage(snapshot, degraded);
  if (path === "/art/inner-world") return renderInnerWorldPage(snapshot, degraded);
  if (path === "/art/traces") return renderTracesPage(snapshot, degraded);
  if (path === "/art/statement") return renderStatementPage(snapshot, degraded);
  return renderHome(snapshot, degraded);
}

function changeLanguage(language) {
  currentLanguage = normalizeLanguage(language);
  try { localStorage.setItem(LANGUAGE_KEY, currentLanguage); } catch {}
  renderRoute();
}

function start() {
  document.addEventListener("change", (event) => {
    if (event.target.matches(".language-select")) changeLanguage(event.target.value);
  });
  window.addEventListener("hashchange", renderRoute);
  renderRoute();
  setInterval(() => {
    const route = routeFromLocation();
    if (["/art", "/art/live"].includes(route)) renderRoute();
  }, POLL_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", start);
