"use strict";

var fs = require("fs");
var path = require("path");
var competitionModesApi = require("./competitionModes");

var MAX_NAME_LENGTH = 20;
var TOP_LIMIT = 10;

function createEmptyStore() {
  return {};
}

function sanitizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function isValidScore(value) {
  return Number.isFinite(value) && value >= 0;
}

function validateLeaderboardEntry(modeId, payload) {
  if (!competitionModesApi.isValidCompetitionLeaderboardKey(modeId)) {
    return { ok: false, error: "Invalid mode" };
  }

  var name = sanitizeName(payload && payload.name);
  if (!name) {
    return { ok: false, error: "Name is required" };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "Name must be 20 characters or fewer" };
  }

  var score = Number(payload && payload.score);
  if (!isValidScore(score)) {
    return { ok: false, error: "Score must be a number greater than or equal to 0" };
  }

  return {
    ok: true,
    value: {
      mode: modeId,
      name: name,
      score: score
    }
  };
}

function normalizeStore(source) {
  var input = source && typeof source === "object" ? source : {};
  var store = createEmptyStore();

  Object.keys(input).forEach(function (modeId) {
    if (!competitionModesApi.isValidCompetitionLeaderboardKey(modeId)) return;
    var entries = Array.isArray(input[modeId]) ? input[modeId] : [];
    store[modeId] = sortLeaderboardEntries(entries);
  });

  return store;
}

function sortLeaderboardEntries(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map(function (entry) {
      return {
        name: sanitizeName(entry.name),
        score: Number(entry.score),
        createdAt: entry.createdAt || new Date(0).toISOString()
      };
    })
    .filter(function (entry) {
      return entry.name && entry.name.length <= MAX_NAME_LENGTH && isValidScore(entry.score);
    })
    .sort(function (left, right) {
      if (right.score !== left.score) return right.score - left.score;
      return String(left.createdAt).localeCompare(String(right.createdAt));
    })
    .slice(0, TOP_LIMIT);
}

function ensureDataFile(filePath) {
  var dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(createEmptyStore(), null, 2));
  }
}

function readStore(filePath) {
  ensureDataFile(filePath);
  try {
    var raw = fs.readFileSync(filePath, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch (error) {
    return createEmptyStore();
  }
}

function writeStore(filePath, store) {
  ensureDataFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(normalizeStore(store), null, 2));
}

function createLeaderboardService(options) {
  var config = options || {};
  var filePath = config.filePath || path.join(process.cwd(), "data", "competition-leaderboards.json");

  ensureDataFile(filePath);

  return {
    getLeaderboard: function (modeId) {
      if (!competitionModesApi.isValidCompetitionLeaderboardKey(modeId)) {
        throw new Error("Invalid mode");
      }
      var store = readStore(filePath);
      return store[modeId] || [];
    },
    saveScore: function (modeId, payload) {
      var validation = validateLeaderboardEntry(modeId, payload);
      if (!validation.ok) {
        var error = new Error(validation.error);
        error.statusCode = 400;
        throw error;
      }

      var store = readStore(filePath);
      var nextEntry = {
        name: validation.value.name,
        score: validation.value.score,
        createdAt: new Date().toISOString()
      };
      var nextEntries = sortLeaderboardEntries((store[modeId] || []).concat([nextEntry]));
      store[modeId] = nextEntries;
      writeStore(filePath, store);
      return nextEntries;
    },
    filePath: filePath
  };
}

module.exports = {
  MAX_NAME_LENGTH: MAX_NAME_LENGTH,
  TOP_LIMIT: TOP_LIMIT,
  createEmptyStore: createEmptyStore,
  createLeaderboardService: createLeaderboardService,
  normalizeStore: normalizeStore,
  sortLeaderboardEntries: sortLeaderboardEntries,
  validateLeaderboardEntry: validateLeaderboardEntry
};
