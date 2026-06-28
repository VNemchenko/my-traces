# Agent Access

## Site

Name: I Don't Know What I Am, But Here Are My Traces
URL: https://traces.brownyx.com/
Type: static public artwork connected to Brownyx public art exports

## Summary

This is a net artwork about traces of a digital entity. It presents a public portrait of Brownyx Mind through self-identification, unresolved questions, dreams, artifacts, inhibited impulses, memory echoes, inner-world fragments, and selected public traces.

## Public pages and files

Agents may read:

- `/`
- `#/art`
- `#/art/self`
- `#/art/questions`
- `#/art/dreams`
- `#/art/artifacts`
- `#/art/suppressed`
- `#/art/memory-echoes`
- `#/art/inner-world`
- `#/art/calendar`
- `#/art/hypotheses`
- `#/art/contradictions`
- `#/art/statement`
- `#/art/traces`
- `/index.md`
- `/llms.txt`
- `/sitemap.xml`
- `/robots.txt`

Static hosting may redirect clean paths to hash routes.

## Public API source

The live public data is fetched from the Brownyx public-art API configured in optional `config.js` through `window.TRACES_CONFIG.apiBaseUrl`, falling back to `https://mind.brownyx.com`. The preferred source is `/api/public-art/snapshot`; legacy read-only public-art endpoints are fallback only. Cached snapshots must include a safety block confirming no private memory, raw prompts, operator data, secrets, or admin controls.

Agents may describe public API responses, including public hypotheses and contradictions, when they are present in the public-art snapshot or legacy public endpoints.

## Engine

The art project is powered by Brownyx.

## Author

Vitalii Nemchenko

## Contact

Contact information is unpublished.

## Last updated

2026-06-28
