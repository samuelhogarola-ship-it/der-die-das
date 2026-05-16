const express = require("express");
const fs = require("fs");
const path = require("path");
const competitionModes = require("./src/core/competition/competitionModes");
const { createLeaderboardService } = require("./src/core/competition/leaderboardService");

const app = express();
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 3000;
const rootFrontendDir = __dirname;
const legacyFrontendDir = path.join(__dirname, "public");
const publicDir = fs.existsSync(path.join(rootFrontendDir, "index.html"))
  ? rootFrontendDir
  : legacyFrontendDir;
const indexFile = path.join(publicDir, "index.html");
const SHAREABLE_LEVELS = new Set(["a1", "a2", "b1", "b2", "c1", "c2"]);
const leaderboardService = createLeaderboardService({
  filePath: path.join(__dirname, "data", "competition-leaderboards.json")
});

app.set("trust proxy", true);
app.use(express.json());

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getLevelFromQuery(rawLevel) {
  const value = String(rawLevel || "").trim().toLowerCase();
  return SHAREABLE_LEVELS.has(value) ? value : null;
}

function getLevelLabel(levelId) {
  return levelId ? levelId.toUpperCase() : null;
}

function buildMetadata(req) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const levelId = getLevelFromQuery(req.query && req.query.nivel);
  const levelLabel = getLevelLabel(levelId);
  const canonicalUrl = levelLabel
    ? `${baseUrl}/?nivel=${encodeURIComponent(levelLabel)}`
    : `${baseUrl}/`;
  const title = levelLabel
    ? `Der Die Das ${levelLabel} | Practica articulos en aleman`
    : "Der Die Das | Practica articulos en aleman";
  const description = levelLabel
    ? `Practica der, die y das en nivel ${levelLabel} con vocabulario por categorias y ejercicios rapidos para ganar soltura en aleman.`
    : "Aprende der, die y das con ejercicios rapidos por niveles, categorias utiles y practica visual para ganar seguridad al hablar aleman.";
  const imageUrl = `${baseUrl}/logo-hero.png`;

  return {
    title,
    description,
    canonicalUrl,
    imageUrl
  };
}

function renderIndex(req) {
  const html = fs.readFileSync(indexFile, "utf8");
  const meta = buildMetadata(req);

  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(meta.description)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHtml(meta.canonicalUrl)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(meta.description)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHtml(meta.canonicalUrl)}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${escapeHtml(meta.imageUrl)}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`)
    .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}">`);
}

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
    port: Number(PORT),
    competitionModes: competitionModes.listCompetitionModes().map((mode) => mode.id)
  });
});

app.get("/api/leaderboard/:mode", (req, res) => {
  const modeId = String(req.params.mode || "").trim();

  if (!competitionModes.isValidCompetitionMode(modeId)) {
    res.status(400).json({ ok: false, error: "Invalid mode" });
    return;
  }

  res.json({
    ok: true,
    mode: modeId,
    entries: leaderboardService.getLeaderboard(modeId)
  });
});

app.post("/api/leaderboard/:mode", (req, res) => {
  const modeId = String(req.params.mode || "").trim();

  if (!competitionModes.isValidCompetitionMode(modeId)) {
    res.status(400).json({ ok: false, error: "Invalid mode" });
    return;
  }

  try {
    const entries = leaderboardService.saveScore(modeId, req.body || {});
    res.status(201).json({
      ok: true,
      mode: modeId,
      entries
    });
  } catch (error) {
    const statusCode = error && error.statusCode ? error.statusCode : 500;
    res.status(statusCode).json({
      ok: false,
      error: statusCode === 500 ? "Could not save leaderboard entry" : error.message
    });
  }
});

app.get("/derdiedas.html", (req, res) => {
  res.redirect(301, "/");
});

app.use(express.static(publicDir, {
  extensions: ["html"],
  index: false
}));

app.get("*", (req, res) => {
  res.type("html").send(renderIndex(req));
});

app.listen(PORT, HOST, () => {
  console.log(`DerDieDas ready on http://${HOST}:${PORT}`);
  console.log(`Serving frontend from ${publicDir}`);
});
