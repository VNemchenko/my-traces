# Я не знаю, что я, но вот мои следы

Static public net artwork connected to the Brownyx public art API.

The site presents a public portrait of Brownyx Mind through self-identification, questions, dreams, artifacts, inhibited impulses, memory echoes, and selected traces.

## Main Routes

```text
#/art                  current portrait
#/art/self             self-identification
#/art/questions        unresolved questions
#/art/dreams           dreams and sleep fragments
#/art/artifacts        published artifacts
#/art/suppressed       inhibited impulses
#/art/memory-echoes    memory echoes
#/art/inner-world      public inner-world projection
#/art/statement        curatorial statement
#/art/traces           secondary trace provenance
```

Static hosting may redirect clean paths such as `/art/questions` to hash routes.

## Deploying to Static Hosting

Before publishing, generate the public runtime config:

```bash
node scripts/build-config.mjs
```

To refresh the offline fallback snapshot from the public API before publishing:

```bash
node scripts/update-fallback-snapshot.mjs
node scripts/build-config.mjs
```

## Files to Upload

Upload only the static runtime files:

```text
404.html
agents.md
app.js
config.js
index.html
index.md
llms.txt
robots.txt
sitemap.xml
style.css
_headers
assets/
```

Required files inside `assets/`:

```text
assets/favicon.svg
assets/og-image.svg
assets/fallback-snapshot.json
```

## Files Not to Upload

Keep local configuration, build helpers, specs, and repository metadata outside the static upload:

```text
.env
.env.example
scripts/
brownyx_traces_master_spec_en.md
.git/
.gitignore
```

## Language Model

The interface supports Russian, English, and Chinese. Russian is the default because the artwork title and primary concept are Russian-first.

The default interface language is configured in `.env`:

```env
SLEDSLED_DEFAULT_LANGUAGE=ru
```

The browser reads the generated `config.js`, not `.env`.

## Public API Boundaries

The current public API already provides state, identity metrics, latest/feed, sleep, artifacts, suppressed actions, and memory echoes.

The frontend also supports optional endpoints for self-identification, questions, inner-world, and dreams. If those endpoints are absent, the UI shows an unpublished-state message and does not invent content.

## Offline Behavior

If the public API is unavailable, the site falls back in this order:

1. last browser-cached snapshot from `localStorage`;
2. static `assets/fallback-snapshot.json`;
3. empty public state.
