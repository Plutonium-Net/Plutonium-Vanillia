import { server } from "vanilliapxy";
console.log('bruehhhhhhhhh');
// to push a vanillia update comment
const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || "0.0.0.0";

const upstreamHandlers = server.listeners("request");
server.removeAllListeners("request");

const startedAt = new Date();

function uptime() {
  const total = Math.floor(process.uptime());
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (hours || minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(" ");
}

function banner() {
  return [
    "VanilliaPXY is up and serving.",
    "",
    "The VanilliaPXY transport backend is online on this host.",
    "",
    "Routes:",
    "  /vanillia?url=<url>    proxy an HTTP request",
    "  /ws?url=<url>          proxy a WebSocket",
    "  /wisp/                 Wisp WebSocket transport",
    "  /service-worker.js     proxy service worker",
    "  /favicon?url=<url>     site icon",
    "  /api/icon?url=<url>    site icon as JSON",
    "  /health                health check as JSON",
    "  /status                this banner",
    "",
    `Started: ${startedAt.toISOString()}`,
    `Uptime:  ${uptime()}`,
    `Node:    ${process.version}`,
    "",
  ].join("\n");
}

server.on("request", (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "*");
  res.setHeader("access-control-allow-headers", "*");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  if (path === "/" || path === "/status") {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, {
        "content-type": "text/plain; charset=utf-8",
        allow: "GET, HEAD",
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow, noarchive",
      });
      res.end("Method Not Allowed\n");
      return;
    }
    const body = banner();
    res.writeHead(200, {
      "content-type": "text/plain; charset=utf-8",
      "content-length": Buffer.byteLength(body),
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow, noarchive",
    });
    res.end(req.method === "HEAD" ? undefined : body);
    return;
  }
  for (const handler of upstreamHandlers) handler.call(server, req, res);
});

server.listen(port, host, () => {
  console.log(`VanilliaPXY is listening on ${host}:${port}`);
});
