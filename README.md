# reverse-cyritex

A Cloudflare Worker that acts as a transparent HTTPS reverse proxy, forwarding requests from a Japan-based Oracle Cloud VPS to `100180.secvision.cloud` (hosted in China).

## Problem Solved

Direct HTTPS connections from the Japan VPS to the China target server were failing due to regional network/peering issues. This Worker routes traffic through Cloudflare's global edge network, bypassing the connectivity problem entirely.

## Architecture

```
VPS (Oracle Cloud)
    └──> HTTPS ──> Cloudflare Worker (reverse-cyritex)
                        └──> HTTPS ──> 100180.secvision.cloud (China)
```

## Features

- Transparent proxy — forwards all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Preserves original request headers, body, and query parameters
- Fixes `Host` header automatically to match the target server
- Passes real VPS IP via `X-Forwarded-For` and `X-Real-IP` headers
- Detailed error logging via `console.log` / `console.error` (viewable in Cloudflare Logs)
- Returns `502 Bad Gateway` with descriptive error message on connection failure instead of a generic `500`

## Deployment

This Worker is automatically deployed via Cloudflare's Git integration.
Push to the `main` branch to trigger a new deployment.

```bash
git add .
git commit -m "your message"
git push origin main
```

## Local Development

```bash
npm install
npx wrangler dev
```

## Configuration

Target hostname is defined in `src/worker.js`:

```js
url.hostname = "100180.secvision.cloud";
```

Change this value to proxy to a different destination.
