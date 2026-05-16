(function (globalScope) {
  "use strict";

  var competitionPoolsApi = globalScope.CompetitionPoolsCore;
  if (!competitionPoolsApi && typeof require === "function") {
    competitionPoolsApi = require("./competitionPools");
  }

  var MODES = {
    survival: {
      id: "survival",
      durationSeconds: null,
      endsOnWrongAnswer: true,
      scoreType: "streak"
    },
    "timed-60": {
      id: "timed-60",
      durationSeconds: 60,
      endsOnWrongAnswer: false,
      scoreType: "correct"
    },
    "timed-180": {
      id: "timed-180",
      durationSeconds: 180,
      endsOnWrongAnswer: false,
      scoreType: "correct"
    }
  };

  function getCompetitionMode(modeId) {
    return MODES[modeId] || null;
  }

  function listCompetitionModes() {
    return Object.keys(MODES).map(function (modeId) {
      return MODES[modeId];
    });
  }

  function isValidCompetitionMode(modeId) {
    return !!getCompetitionMode(modeId);
  }

  function createCompetitionLeaderboardKey(modeId, poolId) {
    return modeId + "-" + poolId;
  }

  function parseCompetitionLeaderboardKey(key) {
    var rawKey = String(key || "").trim().toLowerCase();
    var modeIds = Object.keys(MODES);

    for (var index = 0; index < modeIds.length; index += 1) {
      var modeId = modeIds[index];
      var prefix = modeId + "-";

      if (rawKey.indexOf(prefix) !== 0) continue;

      var poolId = rawKey.slice(prefix.length);
      if (!competitionPoolsApi || !competitionPoolsApi.isValidCompetitionPool(poolId)) {
        return null;
      }

      return {
        key: rawKey,
        modeId: modeId,
        poolId: poolId
      };
    }

    return null;
  }

  function isValidCompetitionLeaderboardKey(key) {
    return !!parseCompetitionLeaderboardKey(key);
  }

  var api = {
    MODES: MODES,
    createCompetitionLeaderboardKey: createCompetitionLeaderboardKey,
    getCompetitionMode: getCompetitionMode,
    isValidCompetitionLeaderboardKey: isValidCompetitionLeaderboardKey,
    isValidCompetitionMode: isValidCompetitionMode,
    listCompetitionModes: listCompetitionModes,
    parseCompetitionLeaderboardKey: parseCompetitionLeaderboardKey
  };

  globalScope.CompetitionModesCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
