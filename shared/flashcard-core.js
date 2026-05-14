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
      currentIndex: Math.min(session.currentIndex + 1, session.items.length)
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


  function replaceTemplate(template, values) {
    return String(template || "").replace(/\{(\w+)\}/g, function (_match, key) {
      return values[key] !== undefined && values[key] !== null ? values[key] : "";
    });
  }

  function buildShareableUrl(config) {
    var options = config || {};
    var sourceUrl = options.url || "";
    if (!sourceUrl) return "";
    var hasOwnQueryValue = Object.prototype.hasOwnProperty.call(options, "queryValue");
    var levelValue = hasOwnQueryValue ? options.queryValue : options.level || "";
    var queryParam = options.queryParam || "nivel";
    var nextUrl = new URL(sourceUrl, sourceUrl.indexOf("http") === 0 ? undefined : globalScope.location && globalScope.location.href ? globalScope.location.href : "http://localhost/");
    if (levelValue) nextUrl.searchParams.set(queryParam, levelValue);
    else nextUrl.searchParams.delete(queryParam);
    return nextUrl.toString();
  }

  function buildWhatsAppUrl(text) {
    return "https://wa.me/?text=" + encodeURIComponent(text || "");
  }

  function buildSharePayload(config, defaults) {
    var options = Object.assign({}, defaults || {}, config || {});
    var values = {
      appName: options.appName || "",
      level: options.level || "",
      correct: options.correct,
      total: options.total,
      url: buildShareableUrl(options)
    };
    var text = replaceTemplate(options.textTemplate, values);
    var clipboardText = replaceTemplate(options.clipboardTemplate || options.textTemplate, values);
    return {
      mode: options.mode || "share",
      text: text,
      url: values.url,
      whatsappUrl: buildWhatsAppUrl(text),
      clipboardText: clipboardText
    };
  }

  function buildLevelShare(config) {
    return buildSharePayload(config, {
      mode: "level-share",
      textTemplate: "I am practicing with {appName} at level {level}. Want to try? {url}"
    });
  }

  function buildResultShare(config) {
    return buildSharePayload(config, {
      mode: "quiz-result",
      textTemplate: "I practiced with {appName} and scored {correct}/{total} at level {level}. Want to try? {url}"
    });
  }

  function copyToClipboard(text, options) {
    var config = options || {};
    var clipboard = config.clipboard || (config.navigator && config.navigator.clipboard) || (globalScope.navigator && globalScope.navigator.clipboard);
    if (clipboard && typeof clipboard.writeText === "function") {
      return clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var doc = config.document || globalScope.document;
      if (!doc || typeof doc.createElement !== "function" || !doc.body) {
        reject(new Error("Clipboard unavailable"));
        return;
      }
      var textarea = doc.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      doc.body.appendChild(textarea);
      if (typeof textarea.select === "function") textarea.select();
      try {
        doc.execCommand("copy");
        doc.body.removeChild(textarea);
        resolve();
      } catch (error) {
        doc.body.removeChild(textarea);
        reject(error);
      }
    });
  }

  var shareApi = {
    buildShareableUrl: buildShareableUrl,
    buildWhatsAppUrl: buildWhatsAppUrl,
    buildLevelShare: buildLevelShare,
    buildResultShare: buildResultShare,
    copyToClipboard: copyToClipboard
  };

  var api = {
    createFlashcardState: createFlashcardState,
    flipCard: flipCard,
    markKnown: markKnown,
    markUnknown: markUnknown
  };

  globalScope.FlashcardCore = api;
  globalScope.CoreShare = shareApi;
  api.CoreShare = shareApi;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
    module.exports.CoreShare = shareApi;
  }
})(typeof window !== "undefined" ? window : globalThis);
