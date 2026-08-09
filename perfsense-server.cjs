const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const port = parseInt(process.argv[3], 10);
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0] || '/');
  let filePath = path.join(root, urlPath);
  if (path.resolve(filePath).startsWith(path.resolve(root)) === false) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`[perfsense-server] ${root} -> http://127.0.0.1:${port}`);
});
