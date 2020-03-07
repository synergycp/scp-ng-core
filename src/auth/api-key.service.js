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

      function secondsToRenewal() {
        if (!apiKey || !apiKey.expires_at) {
          return null;
        }

        // TODO: get this value from the API in case the user's clock is wrong.
        var secondsToExpiration = apiKey.expires_at - Math.floor(new Date()/1000);
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
        return getStorage().get() || null;
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
