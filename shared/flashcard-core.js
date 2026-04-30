(function (globalScope) {
  "use strict";

  function getPracticeCore() {
    return globalScope.SharedPracticeCore || null;
  }

  function createSession(items) {
    var PracticeCore = getPracticeCore();

    if (PracticeCore && typeof PracticeCore.createSession === "function") {
      return PracticeCore.createSession(items);
    }

    var source = Array.isArray(items) ? items.slice() : [];
    return {
      items: source,
      currentIndex: source.length === 0 ? -1 : 0,
      answers: [],
      score: { correct: 0, incorrect: 0, answered: 0 },
      meta: {}
    };
  }

  function nextItem(session) {
    var PracticeCore = getPracticeCore();

    if (PracticeCore && typeof PracticeCore.nextItem === "function") {
      return PracticeCore.nextItem(session);
    }

    if (!session || !Array.isArray(session.items) || !session.items.length) {
      return Object.assign({}, session, { currentIndex: -1 });
    }

    return Object.assign({}, session, {
      currentIndex: Math.min(session.currentIndex + 1, session.items.length - 1)
    });
  }

  function getCurrentItem(session) {
    var PracticeCore = getPracticeCore();

    if (PracticeCore && typeof PracticeCore.getCurrentItem === "function") {
      return PracticeCore.getCurrentItem(session);
    }

    if (!session || !Array.isArray(session.items)) return null;
    return session.items[session.currentIndex] || null;
  }

  function createFlashcardState(items, options) {
    var config = options || {};

    return {
      session: createSession(items),
      flipped: false,
      knownIds: [],
      unknownIds: [],
      marks: [],
      meta: Object.assign({}, config.meta || {})
    };
  }

  function flipCard(state) {
    var current = state || createFlashcardState([]);

    return Object.assign({}, current, {
      flipped: !current.flipped
    });
  }

  function appendUnique(list, value) {
    return list.indexOf(value) === -1 ? list.concat([value]) : list.slice();
  }

  function markCard(state, outcome) {
    var current = state || createFlashcardState([]);
    var item = getCurrentItem(current.session);
    if (!item) return current;
    var itemId = item && item.id !== undefined ? item.id : current.session.currentIndex;
    var nextMarks = current.marks.concat([
      {
        id: itemId,
        known: outcome === "known",
        item: item
      }
    ]);

    return Object.assign({}, current, {
      session: nextItem(current.session),
      flipped: false,
      knownIds: outcome === "known" ? appendUnique(current.knownIds, itemId) : current.knownIds.slice(),
      unknownIds: outcome === "unknown" ? appendUnique(current.unknownIds, itemId) : current.unknownIds.slice(),
      marks: nextMarks
    });
  }

  function markKnown(state) {
    return markCard(state, "known");
  }

  function markUnknown(state) {
    return markCard(state, "unknown");
  }

  var api = {
    createFlashcardState: createFlashcardState,
    flipCard: flipCard,
    markKnown: markKnown,
    markUnknown: markUnknown
  };

  globalScope.FlashcardCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
