export default {
  async fetch(request, env, ctx) {
    // 1. Parse the incoming request URL from your VPS
    const url = new URL(request.url);

    // 2. Change the destination to the target server.
    // The upstream is configured via a single env var: TARGET_URL
    // (e.g. "https://100180.secvision.cloud" or "http://example.com:8080").
    // It falls back to a sensible default so existing deployments keep working
    // if the var is not set.
    const target = new URL(env.TARGET_URL || "https://100180.secvision.cloud");
    url.hostname = target.hostname;
    url.protocol = target.protocol;

    // 3. Create a new request based on the original
    // This automatically copies the POST body, method, and original headers
    const proxyRequest = new Request(url, request);

    // 4. CRITICAL FIX: Overwrite the Host header!
    // Many servers return a 500 error if the Host header says "your-worker.workers.dev"
    // instead of their actual domain name.
    proxyRequest.headers.set("Host", target.hostname);

    // Optional: Pass the real IP of your VPS to the target server
    const realIp = request.headers.get("cf-connecting-ip");
    if (realIp) {
      proxyRequest.headers.set("X-Forwarded-For", realIp);
      proxyRequest.headers.set("X-Real-IP", realIp);
    }

    try {
      // 5. Send the request to the target server
      const response = await fetch(proxyRequest);

      // If the target server still returns a 5xx error, it will be passed back transparently,
      // but you can view it in the Cloudflare Logs.
      if (!response.ok) {
        console.log(`Origin responded with status: ${response.status}`);
      }

      return response;

    } catch (error) {
      // 6. If the connection fails entirely (e.g. SSL error, timeout, or DNS failure)
      // This will return a 502 Bad Gateway with the exact text reason instead of a generic 500 error.
      console.error("Worker Fetch Error:", error.message);

      return new Response(`Worker Proxy Error: ${error.message}`, {
        status: 502,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};
