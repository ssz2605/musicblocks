#!/usr/bin/env node

/**
 * perfsense-server.cjs — Minimal static file server for PerfSense benchmarks.
 *
 * Usage:
 *   node perfsense-server.cjs <root> <port>
 *
 * Example:
 *   node perfsense-server.cjs . 3000
 *
 * Serves files from <root> on <port> with correct MIME types.
 * Blocks Google Fonts, cdnjs, and jQuery CDN via service-worker interception
 * at the Playwright driver level (not here).
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || ".");
const port = parseInt(process.argv[3] || "3000", 10);

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".mp3": "audio/mpeg",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0] || "/");
    const filePath = path.join(root, urlPath);

    // Prevent directory traversal
    if (!path.resolve(filePath).startsWith(root)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404);
            res.end("Not Found");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || "application/octet-stream";

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Access-Control-Allow-Origin": "*"
        });

        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(port, "0.0.0.0", () => {
    console.log(`[perfsense-server] Serving ${root} on http://0.0.0.0:${port}`);
});

process.on("SIGTERM", () => {
    server.close(() => process.exit(0));
});
