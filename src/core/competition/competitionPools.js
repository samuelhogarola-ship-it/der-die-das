(function (globalScope) {
  "use strict";

  var POOLS = {
    a1: { id: "a1" },
    a2: { id: "a2" },
    b1: { id: "b1" },
    b2: { id: "b2" },
    c1: { id: "c1" },
    c2: { id: "c2" },
    all: { id: "all" }
  };

  function getCompetitionPool(poolId) {
    return POOLS[poolId] || null;
  }

  function listCompetitionPools() {
    return Object.keys(POOLS).map(function (poolId) {
      return POOLS[poolId];
    });
  }

  function isValidCompetitionPool(poolId) {
    return !!getCompetitionPool(poolId);
  }

  var api = {
    POOLS: POOLS,
    getCompetitionPool: getCompetitionPool,
    isValidCompetitionPool: isValidCompetitionPool,
    listCompetitionPools: listCompetitionPools
  };

  globalScope.CompetitionPoolsCore = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
