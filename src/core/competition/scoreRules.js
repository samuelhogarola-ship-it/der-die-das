(function (globalScope) {
  "use strict";

  var competitionModesApi = globalScope.CompetitionModesCore;
  if (!competitionModesApi && typeof require === "function") {
    competitionModesApi = require("./competitionModes");
  }

  function createCompetitionSession(modeId, options) {
    var config = options || {};
    var mode = competitionModesApi.getCompetitionMode(modeId);

    if (!mode) {
      throw new Error("Invalid competition mode: " + modeId);
    }

    var now = typeof config.now === "number" ? config.now : Date.now();

    return {
      mode: mode.id,
      startedAt: now,
      durationSeconds: mode.durationSeconds,
      endsOnWrongAnswer: !!mode.endsOnWrongAnswer,
      scoreType: mode.scoreType,
      correctAnswers: 0,
      totalAnswers: 0,
      streak: 0,
      score: 0,
      finishedAt: null,
      finishReason: null
    };
  }

  function getRemainingSeconds(session, options) {
    if (!session || !session.durationSeconds) return null;
    var config = options || {};
    var now = typeof config.now === "number" ? config.now : Date.now();
    var elapsedSeconds = Math.floor(Math.max(0, now - session.startedAt) / 1000);
    return Math.max(0, session.durationSeconds - elapsedSeconds);
  }

  function hasCompetitionTimeExpired(session, options) {
    var remainingSeconds = getRemainingSeconds(session, options);
    return remainingSeconds !== null ? remainingSeconds <= 0 : false;
  }

  function getCompetitionProgress(session, options) {
    if (!session) return null;

    var remainingSeconds = getRemainingSeconds(session, options);
    var isExpired = remainingSeconds !== null ? remainingSeconds <= 0 : false;

    return {
      mode: session.mode,
      score: session.score,
      streak: session.streak,
      correctAnswers: session.correctAnswers,
      totalAnswers: session.totalAnswers,
      remainingSeconds: remainingSeconds,
      isExpired: isExpired,
      isFinished: !!session.finishedAt
    };
  }

  function applyCompetitionAnswer(session, payload) {
    if (!session) throw new Error("Competition session is required");
    if (session.finishedAt) return session;

    var answerPayload = payload || {};
    var isCorrect = !!answerPayload.isCorrect;
    var answeredAt = typeof answerPayload.answeredAt === "number" ? answerPayload.answeredAt : Date.now();
    var nextSession = Object.assign({}, session, {
      correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
      totalAnswers: session.totalAnswers + 1,
      streak: isCorrect ? session.streak + 1 : 0
    });

    nextSession.score = nextSession.scoreType === "streak"
      ? nextSession.streak
      : nextSession.correctAnswers;

    if (nextSession.endsOnWrongAnswer && !isCorrect) {
      return finishCompetitionSession(nextSession, {
        finishedAt: answeredAt,
        reason: "wrong-answer"
      });
    }

    if (hasCompetitionTimeExpired(nextSession, { now: answeredAt })) {
      return finishCompetitionSession(nextSession, {
        finishedAt: answeredAt,
        reason: "time-up"
      });
    }

    return nextSession;
  }

  function finishCompetitionSession(session, options) {
    if (!session) throw new Error("Competition session is required");
    if (session.finishedAt) return session;

    var config = options || {};
    return Object.assign({}, session, {
      finishedAt: typeof config.finishedAt === "number" ? config.finishedAt : Date.now(),
      finishReason: config.reason || "completed"
    });
  }

  var api = {
    applyCompetitionAnswer: applyCompetitionAnswer,
    createCompetitionSession: createCompetitionSession,
    finishCompetitionSession: finishCompetitionSession,
    getCompetitionProgress: getCompetitionProgress,
    getRemainingSeconds: getRemainingSeconds,
    hasCompetitionTimeExpired: hasCompetitionTimeExpired
  };

  globalScope.CompetitionScoreRules = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
