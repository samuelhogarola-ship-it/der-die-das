(function (globalScope) {
  "use strict";

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

  var api = {
    MODES: MODES,
    getCompetitionMode: getCompetitionMode,
    listCompetitionModes: listCompetitionModes,
    isValidCompetitionMode: isValidCompetitionMode
  };

  globalScope.CompetitionModesCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
