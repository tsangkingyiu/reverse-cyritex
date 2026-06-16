# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.1.1] - 2026-06-16

### Changed
- Replaced the `TARGET_HOSTNAME` + `TARGET_PROTOCOL` environment variables with a single `TARGET_URL` (e.g. `https://100180.secvision.cloud` or `http://example.com:8080/path`). The new value is a real URL, which removes the awkward `https:` standalone protocol value and naturally supports a custom port or path if needed.
- `src/worker.js` now parses the env value with the `URL` constructor and derives `hostname` and `protocol` from it. The `Host` header is also set from the parsed `hostname`.
- `wrangler.toml` `[vars]` block, the `README.md` Configuration section, and the `wrangler secret put` / `.dev.vars` examples all updated to use `TARGET_URL`.

---

## [1.1.0] - 2026-06-16

### Added
- `TARGET_HOSTNAME` and `TARGET_PROTOCOL` environment variables for configuring the upstream at runtime
- `[vars]` block in `wrangler.toml` with sensible defaults (`100180.secvision.cloud`, `https:`) for backward compatibility
- Fallback to the hardcoded defaults when the new env vars are not set, so existing deployments keep working without configuration changes
- "Configuration" section in `README.md` documenting both env vars, including how to set them via `wrangler.toml`, the Cloudflare dashboard, `wrangler secret put`, and `.dev.vars` for local development
- "Pointing your client at the Worker" section in `README.md` explaining how to reach the deployed Worker
- `LICENSE` file with the standard MIT license text (Copyright 2026 Kirby T.)
- Updated `package.json` to v1.1.0 with a generic description, `"license": "MIT"`, `repository` / `homepage` / `bugs` fields, and `npm run dev` / `npm run deploy` scripts

### Changed
- `README.md` rewritten to be generic and usable by anyone. The previous copy was specific to "Japan‑based Oracle Cloud VPS → `100180.secvision.cloud`"; the new copy describes the Worker as a generic transparent HTTPS reverse proxy for any server whose outbound connectivity to a target host is impaired (including, but not limited to, the GFW and any other national / corporate firewall). The `100180.secvision.cloud` example is preserved as a concrete reference but is no longer the only supported use case.
- `src/worker.js` now reads the target hostname and protocol from `env` instead of using hardcoded string literals
- `README.md` **Deployment** and **Local Development** sections now use the `npm install` / `npm run dev` / `npm run deploy` workflow (driven by `package.json`) instead of bare `npx wrangler …` commands

### Fixed
- Restored the no-op `"build": "echo 'No build step required'"` script in `package.json`. The previous `package.json` cleanup accidentally removed it, which made Cloudflare's Git integration fail with `Missing script: "build"`. Workers don't need a real build, but the script must exist as a sentinel.

---

## [1.0.0] - 2026-05-13

### Added
- Initial release of `reverse-cyritex` Cloudflare Worker
- Transparent HTTPS reverse proxy from JP Oracle Cloud VPS to `100180.secvision.cloud`
- Automatic `Host` header rewriting to fix `500 Internal Server Error` from origin server
- Forwarding of real client IP via `X-Forwarded-For` and `X-Real-IP` headers
- `try/catch` error handling with descriptive `502 Bad Gateway` response on connection failure
- `console.log` logging for non-2xx origin responses
- `console.error` logging for fatal fetch errors (SSL, DNS, timeout)
- ES Module format (`export default { fetch }`) for Cloudflare Workers
- `wrangler.toml` configuration file for local development and Wrangler CLI deployment
