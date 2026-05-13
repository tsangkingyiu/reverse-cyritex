# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
