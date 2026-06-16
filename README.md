# reverse-cyritex

A Cloudflare Worker that acts as a transparent HTTPS reverse proxy, forwarding
requests from any server located in a region whose outbound connectivity to a
target host is restricted (for example, behind the **Great Firewall of China**
or any other national/corporate firewall) to the target host through
Cloudflare's global edge network.

It is a small, drop-in relay: point your client at the Worker's URL and the
Worker will forward the request to the upstream you configure.

> **Concrete example used in this repo:** forwarding traffic from a VPS in a
> restricted region to `100180.secvision.cloud` (hosted in China). You can
> repoint the Worker at any other host by setting environment variables — see
> [Configuration](#configuration).

## Problem Solved

If you have a server in a region where direct HTTPS connections to a specific
target fail due to regional network/peering issues, censorship, or routing
problems, this Worker sits in the middle and uses Cloudflare's edge network to
reach the target on your behalf. From the client's point of view it looks like
a normal HTTPS request to your Worker's URL.

Typical use cases:

- Reaching an origin in mainland China from a VPS hosted outside China (or
  vice‑versa) when the direct path is blocked or throttled.
- Reaching a service that is blocked by the **GFW** (Great Firewall of China)
  or any other national firewall from a VPS in the affected region.
- Reaching any other origin whose connectivity from your VPS is impaired.

## Architecture

```
Client / VPS (in a restricted region)
    └──> HTTPS ──> Cloudflare Worker (reverse-cyritex)
                        └──> HTTPS ──> Upstream (your target host)
```

The VPS only needs outbound access to Cloudflare's edge. The Worker then
re‑originates the request to your upstream from Cloudflare's network, which
usually has a much better path.

## Features

- Transparent proxy — forwards all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Preserves original request headers, body, and query parameters
- Fixes `Host` header automatically to match the target upstream
- Passes real client IP via `X-Forwarded-For` and `X-Real-IP` headers
- Detailed error logging via `console.log` / `console.error` (viewable in
  Cloudflare Logs / `wrangler tail`)
- Returns `502 Bad Gateway` with a descriptive error message on connection
  failure instead of a generic `500`
- **Configurable at runtime** — the target hostname and protocol are read from
  environment variables, so you can repoint the same Worker at a different
  upstream without redeploying code

## Configuration

The Worker reads two environment variables:

| Variable          | Required | Default                    | Description                                                                 |
| ----------------- | -------- | -------------------------- | --------------------------------------------------------------------------- |
| `TARGET_HOSTNAME` | No       | `100180.secvision.cloud`   | The upstream host the Worker will proxy requests to.                       |
| `TARGET_PROTOCOL` | No       | `https:`                    | Protocol used when talking to the upstream. Use `https:` (default) or `http:`. |

If a variable is not set, the default from the table above is used, so the
Worker keeps working after an upgrade without any config changes.

### Set via `wrangler.toml` (committed defaults)

```toml
[vars]
TARGET_HOSTNAME = "100180.secvision.cloud"
TARGET_PROTOCOL = "https:"
```

This is the approach used in this repository. The values are committed to git
and visible to anyone with read access to the repo, so only use it for
non‑sensitive hosts.

### Set via Cloudflare dashboard (per‑environment override)

1. Open the Cloudflare dashboard → **Workers & Pages** → `reverse-cyritex`.
2. Go to **Settings** → **Variables and Secrets**.
3. Add `TARGET_HOSTNAME` and/or `TARGET_PROTOCOL` as **Type: Variable** (or
   **Secret** if you prefer them to be hidden).

Dashboard values take precedence over the `[vars]` block in `wrangler.toml`.

### Set via the Wrangler CLI

```bash
# Interactive prompts for the value
wrangler secret put TARGET_HOSTNAME
wrangler secret put TARGET_PROTOCOL
```

`wrangler secret put` stores the value as an encrypted secret. Use it if your
upstream hostname is something you don't want in version control.

## Deployment

This Worker is automatically deployed via Cloudflare's Git integration.
Push to the `main` branch to trigger a new deployment.

```bash
git add .
git commit -m "your message"
git push origin main
```

You can also deploy manually with the Wrangler CLI:

```bash
npm install
npx wrangler deploy
```

## Local Development

```bash
npm install
npx wrangler dev
```

To use a different upstream locally, either edit the `[vars]` block in
`wrangler.toml` or create a `.dev.vars` file in the project root:

```bash
# .dev.vars (gitignored, local-only secrets)
TARGET_HOSTNAME=example.com
TARGET_PROTOCOL=https:
```

`wrangler dev` automatically loads `.dev.vars` and exposes the values on
`env.*` just like in production.

## Pointing your client at the Worker

Once deployed, the Worker is reachable at:

- `https://reverse-cyritex.<your-subdomain>.workers.dev` (the default
  `*.workers.dev` URL), and/or
- any custom domain you have bound to the Worker.

Direct your client / VPS to that URL instead of the original target host. The
path, query string, method, headers, and body are forwarded as‑is.

## License

MIT — do whatever you want with it.
