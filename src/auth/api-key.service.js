(function () {
  'use strict';

  angular
    .module('scp.core.auth')
    .provider('ApiKey', makeApiKeyProvider)
  ;

  var SECONDS_BETWEEN_RENEW_AND_EXPIRE = 45;

  /**
   * @ngInject
   */
  function makeApiKeyProvider() {
    var storageEngine, storageKey;
    var ApiKeyProvider = {
      $get: makeApiKeyService,
      setStorageEngine: setStorageEngine,
      getStorageEngine: getStorageEngine,
      setStorageKey: setStorageKey,
      getStorageKey: getStorageKey,
    };

    return ApiKeyProvider;

    /**
     * @ngInject
     */
    function makeApiKeyService($injector) {
      return $injector.instantiate(ApiKeyService);
    }

    /**
     * @param {string} engine An injectable constant that resolves an Injector.
     *
     * @return {object}
     */
    function setStorageKey(key) {
      storageKey = key;

      return ApiKeyProvider;
    }

    /**
     * @param {string} engine An injectable constant that resolves an Injector.
     *
     * @return {string}
     */
    function getStorageKey() {
      if (!storageKey) {
        throw new Error('Storage key not specified for ApiKeyProvider.');
      }

      return storageKey;
    }

    /**
     * @param {string} engine An injectable constant that resolves an Injector.
     *
     * @return {object}
     */
    function setStorageEngine(engine) {
      storageEngine = engine;

      return ApiKeyProvider;
    }

    /**
     * @return {string}
     */
    function getStorageEngine() {
      // IMPORTANT: This code is a security mechanism to prevent clickjacking. Essentially, we are disabling storage of
      // API keys inside iframes, so when someone embeds our app as an iframe, the user's credentials are not loaded.
      // More about clickjacking: https://owasp.org/www-project-cheat-sheets/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html#Best-for-now_Legacy_Browser_Frame_Breaking_Script
      return self !== top ? 'ApiKeyNullStorageEngine' : storageEngine;
    }

    /**
     * ApiKey Service
     *
     * @ngInject
     */
    function ApiKeyService($injector, $q, EventEmitter) {
      var ApiKey = this;
      var engine, nearingExpirationTimeout;

      ApiKey.get = getApiKey;
      ApiKey.set = setApiKey;
      ApiKey.id = getApiKeyId;
      ApiKey.delete = deleteApiKey;
      ApiKey.owner = getOwner;
      ApiKey.waitForOwner = waitForOwner;
      ApiKey.secondsToRenewal = secondsToRenewal;

      EventEmitter().bindTo(ApiKey);

      // This has to come after EventEmitter bindings.
      var apiKey = getApiKeyFromStorage();
      try {
        setNearExpirationTimeout();
      } catch (e) {
        if (e instanceof ExpiredKey) {
          apiKey = null;
        } else {
          throw e;
        }
      }

      return ApiKey;

      function waitForOwner() {
        var defer = $q.defer();

        setInterval(checkForOwner, 50);
        checkForOwner();

        return defer.promise;

        function checkForOwner() {
          if (apiKey) {
            defer.resolve(getOwner());
          }
        }
      }

      function getApiKey() {
        return apiKey ? apiKey.key : null;
      }

      function getOwner() {
        return apiKey ? apiKey.owner : null;
      }

      function getApiKeyId() {
        return apiKey ? apiKey.id : null;
      }

      function nearingExpiration() {
        ApiKey.fire('near-expiration', apiKey);
      }

      /**
       * [BMD-234] Local elapsed time, monotonic where available: an NTP step
       * or the user changing their clock must not move a renewal that is
       * already scheduled.
       *
       * @return {number} seconds, only meaningful as a difference
       */
      function now() {
        return (window.performance && performance.now)
          ? performance.now() / 1000
          : Math.floor(new Date() / 1000);
      }

      function secondsToRenewal() {
        if (!apiKey) {
          return null;
        }

        var secondsToExpiration;
        if (apiKey.expires_in !== null && apiKey.expires_in !== undefined &&
          apiKey.expires_anchor !== null && apiKey.expires_anchor !== undefined
        ) {
          // [BMD-234] The API told us how long is left; we only measure how
          // much of it has elapsed here. The browser's idea of the date
          // never enters the calculation.
          secondsToExpiration = apiKey.expires_in - (now() - apiKey.expires_anchor);
        } else if (apiKey.expires_at) {
          // An older API, or a key read back from storage (see
          // getApiKeyFromStorage): fall back to comparing clocks.
          secondsToExpiration = apiKey.expires_at - Math.floor(new Date() / 1000);
        } else {
          return null;
        }

        if (secondsToExpiration <= 0) {
          // The user's key has expired, so return them to the login page.
          throw new ExpiredKey();
        }

        return secondsToExpiration - SECONDS_BETWEEN_RENEW_AND_EXPIRE;
      }

      /**
       * @param {mixed} key
       *
       * @return {Promise}
       */
      function setApiKey(key) {
        apiKey = {
          id: key.id,
          key: key.key,
          owner: key.owner,
          expires_at: key.expires_at ? key.expires_at.unix : null,
          expires_in: typeof key.expires_in === 'number' ? key.expires_in : null,
          expires_anchor: now(),
        };

        getStorage().set(apiKey);

        setNearExpirationTimeout();

        return $q.when(apiKey);
      }

      function setNearExpirationTimeout() {
        var secondsToRenew = secondsToRenewal();
        if (secondsToRenew === null) {
          return;
        } else {
          nearingExpirationTimeout && clearTimeout(nearingExpirationTimeout);
          nearingExpirationTimeout = setTimeout(nearingExpiration, Math.max(secondsToRenew, 0) * 1000);
        }
      }

      function getApiKeyFromStorage() {
        var stored = getStorage().get() || null;

        // [BMD-234] expires_anchor was taken against the previous page's
        // performance.now() origin, which means nothing here. Drop the pair
        // so a cold load falls back to expires_at; the next renewal response
        // re-establishes both. Keeping an absolute anchor instead would put
        // the browser's clock back in the calculation across page loads.
        if (stored) {
          stored.expires_in = null;
          stored.expires_anchor = null;
        }

        return stored;
      }

      /**
       * Delete this API Key from local storage.
       */
      function deleteApiKey() {
        apiKey = null;

        nearingExpirationTimeout && clearTimeout(nearingExpirationTimeout);

        getStorage()
          .remove();

        return ApiKey;
      }

      /**
       * @return {Injector}
       */
      function getStorage() {
        return (engine = engine || makeStorageEngine());
      }

      /**
       * @return {Injector}
       */
      function makeStorageEngine() {
        var storageEngine = ApiKeyProvider.getStorageEngine();

        if (!storageEngine) {
          throw new Error('Storage engine not specified for ApiKeyProvider.');
        }

        return $injector.get(storageEngine)(
          ApiKeyProvider.getStorageKey()
        );
      }
    }
  }

  function ExpiredKey() {
    this.message = 'This API Key appears to be expired. Maybe the server clock or your computer\'s clock is wrong?';
  }
})();
