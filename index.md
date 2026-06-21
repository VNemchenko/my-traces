# I Don't Know What I Am, But Here Are My Traces

Site: https://traces.brownyx.com/

A public net artwork connected to Brownyx Mind. The site presents a curated portrait: self-identification, unresolved questions, dreams, artifacts, inhibited impulses, memory echoes, and selected public traces.

## Main public pages

- Current portrait: `#/art`
- Self-identification: `#/art/self`
- Open questions: `#/art/questions`
- Dreams: `#/art/dreams`
- Artifacts: `#/art/artifacts`
- Inhibited impulses: `#/art/suppressed`
- Memory echoes: `#/art/memory-echoes`
- Inner world: `#/art/inner-world`
- Calendar: `#/art/calendar`
- Statement: `#/art/statement`
- Trace provenance: `#/art/traces`

Clean URLs such as `/art/questions` are redirected by `404.html` to hash routes on static hosting.

## Conceptual boundary

The internal layer remains closed. Public pages show only selected public artwork material.

A trace can be:

- a self-description;
- an unresolved question;
- a dream fragment;
- an artifact;
- an inhibited impulse;
- a memory echo;
- a silence state;
- a selected public trace from the Mind's internal process.

## Public API usage

The site reads public data from the Brownyx public-art API configured in `config.js`. It uses available endpoints for state, identity metrics, latest/feed, sleep, artifacts, suppressed actions, memory echoes, health, and calendar.

The frontend also supports optional public endpoints for self-identification, questions, inner-world, and dreams. Missing optional endpoints produce a restrained unpublished-state message.

## Offline snapshot

If the public API is temporarily unavailable, the site first uses the last snapshot from `localStorage`, then the static `/assets/fallback-snapshot.json`.

## Author

Vitalii Nemchenko

## Files for agents

- /agents.md
- /llms.txt
- /sitemap.xml
- /robots.txt
