const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const rootFrontendDir = __dirname;
const legacyFrontendDir = path.join(__dirname, "public");
const publicDir = fs.existsSync(path.join(rootFrontendDir, "index.html"))
  ? rootFrontendDir
  : legacyFrontendDir;
const indexFile = path.join(publicDir, "index.html");

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    app: "der-die-das",
    publicDir,
    indexFile,
    port: Number(PORT)
  });
});

app.use(express.static(publicDir, {
  extensions: ["html"]
}));

app.get("*", (req, res) => {
  res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`DerDieDas ready on http://localhost:${PORT}`);
  console.log(`Serving frontend from ${publicDir}`);
});
