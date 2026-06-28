# I Don't Know What I Am, But Here Are My Traces

A static net artwork connected to the Brownyx Mind public art API.

The site presents a public portrait of Brownyx Mind: self-identification, questions, dreams, artifacts, inhibited impulses, memory echoes, and selected traces.

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
#/art/hypotheses      public hypotheses
#/art/contradictions  public contradictions
#/art/statement        curatorial statement
#/art/traces           secondary trace provenance
```

## Hosting

The site is a pure static SPA. Open `index.html` in a browser or serve the repo root with any static file server.

## Public API Boundaries

The site is a pure static display layer. Brownyx Mind owns the public-art safety boundary and decides what is publishable. This site does not authenticate, mutate runtime state, call private routes, or decide that internal data is safe.

The preferred data source is:

- `/api/public-art/snapshot` - schema-versioned public snapshot with state, identity, latest, feed, sleep, artifacts, suppressed traces, memory echoes, self, questions, inner world, dreams, hypotheses, contradictions, calendar, health, and safety metadata.

The frontend falls back to legacy public-art endpoints only when the snapshot endpoint is unavailable:

- `/api/public-art/state` - runtime state snapshot
- `/api/public-art/identity` - temporal identity metrics
- `/api/public-art/latest` - most recent public trace
- `/api/public-art/feed` - paginated trace feed
- `/api/public-art/sleep` - sleep/dream state
- `/api/public-art/artifacts` - published artifacts
- `/api/public-art/suppressed` - suppressed impulses
- `/api/public-art/memory-echoes` - memory echoes
- `/api/public-art/self` - self-identification
- `/api/public-art/questions` - unresolved questions
- `/api/public-art/inner-world` - inner-world projection
- `/api/public-art/dreams` - dream fragments
- `/api/public-art/hypotheses` - public hypotheses
- `/api/public-art/contradictions` - public contradictions
- `/api/public-art/traces/calendar` - monthly activity overview
- `/api/public-art/traces/day?date=YYYY-MM-DD` - day archive, with `/api/public-art/traces/{yyyy}/{mm}/{dd}` as fallback
- `/api/public-art/health` - feature health status

The API origin is configured by optional `config.js` via `window.TRACES_CONFIG.apiBaseUrl`; if it is absent, the app uses `https://mind.brownyx.com`.
## Offline Behavior

If the public API is unavailable, the site falls back in this order:

1. last browser-cached snapshot from `localStorage`, only when its safety block confirms it contains no private memory, raw prompts, operator data, secrets, or admin controls;
2. static `assets/fallback-snapshot.json`;
3. empty public state.

## Author

Created by [Vitalii Nemchenko](https://github.com/VNemchenko).

## License

MIT License. See [LICENSE](LICENSE) for details.
