import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { applyRouteMeta, routeMetaTags } from "./meta";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const route = req.originalUrl.split('?')[0];
    
    // Check if this route needs custom meta tags
    const matchedRoute = Object.keys(routeMetaTags).find(r => route.startsWith(r));
    
    if (matchedRoute) {
      // Read HTML, inject meta tags, and send
      fs.readFile(indexPath, 'utf8', (err, html) => {
        if (err) {
          return res.sendFile(indexPath);
        }
        // Build base URL from request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || '';
        const baseUrl = `${protocol}://${host}`;
        
        const modifiedHtml = applyRouteMeta(html, req.originalUrl, baseUrl);
        res.type('html').send(modifiedHtml);
      });
    } else {
      res.sendFile(indexPath);
    }
  });
}
