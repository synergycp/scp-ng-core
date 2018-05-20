(function () {
  'use strict';

  angular
    .module('scp.core.auth')
    .provider('ApiKey', makeApiKeyProvider)
  ;

  /**
   * Injector Interface
   *
   * @param {string} key the key to store results as.
   */
  function Injector(key) {
    /**
     * @return {Object|void} the stored API Key
     */
    this.get = function () {
    };

    /**
     * @param {Object} apiKey
     */
    this.set = function (apiKey) {
    };

    /**
     * Remove the key from storage.
     */
    this.remove = function () {
    };
  }

  function makeApiKeyProvider() {
    var storageEngine, storageKey;
    var ApiKeyProvider = {
      $get: ApiKeyService,
      setStorageEngine: setStorageEngine,
      getStorageEngine: getStorageEngine,
      setStorageKey: setStorageKey,
      getStorageKey: getStorageKey,
    };

    return ApiKeyProvider;

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
      return storageEngine;
    }

    /**
     * ApiKey Service
     *
     * @ngInject
     */
    function ApiKeyService($injector, $q) {
      var ApiKey = this;
      var engine;
      var apiKey = getApiKeyFromStorage();

      ApiKey.get = getApiKey;
      ApiKey.set = setApiKey;
      ApiKey.id = getApiKeyId;
      ApiKey.delete = deleteApiKey;
      ApiKey.owner = getOwner;
      ApiKey.waitForOwner = waitForOwner;

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

      /**
       * @param {string} key
       * @param {bool} remember
       *
       * @return {Promise}
       */
      function setApiKey(key, remember) {
        apiKey = {
          id: key.id,
          key: key.key,
          owner: key.owner,
        };

        getStorage().set(apiKey);

        return $q.when(apiKey);
      }

      function getApiKeyFromStorage() {
        return getStorage()
            .get() || null;
      }

      /**
       * Delete this API Key from local storage.
       */
      function deleteApiKey() {
        apiKey = null;

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
})();
