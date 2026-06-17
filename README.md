# I Don't Know What I Am, But Here Are My Traces

A static net artwork connected to the Brownyx Mind public art API.

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
#/art/calendar         monthly activity calendar
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
.git/
.gitignore
LICENSE
.github/
```

## Public API Boundaries

The site fetches data from these Brownyx Mind public-art API endpoints:

**Core endpoints (always used):**
- `/api/public-art/state` — runtime state snapshot
- `/api/public-art/identity` — temporal identity metrics
- `/api/public-art/latest` — most recent public trace
- `/api/public-art/feed` — paginated trace feed
- `/api/public-art/sleep` — sleep/dream state
- `/api/public-art/artifacts` — published artifacts
- `/api/public-art/suppressed` — suppressed impulses
- `/api/public-art/memory-echoes` — memory echoes
- `/api/public-art/health` — feature health status

**Calendar endpoint:**
- `/api/public-art/traces/calendar` — monthly activity overview

**Optional endpoints (gracefully handled if absent):**
- `/api/public-art/self` — self-identification
- `/api/public-art/questions` — unresolved questions
- `/api/public-art/inner-world` — inner-world projection
- `/api/public-art/dreams` — dream fragments

## Offline Behavior

If the public API is unavailable, the site falls back in this order:

1. last browser-cached snapshot from `localStorage`;
2. static `assets/fallback-snapshot.json`;
3. empty public state.

## Author

Created by [Vitalii Nemchenko](https://github.com/VNemchenko).

## License

MIT License. See [LICENSE](LICENSE) for details.
