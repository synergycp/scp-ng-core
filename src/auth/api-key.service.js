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
    this.get = function () {};

    /**
     * @param {Object} apiKey
     */
    this.set = function (apiKey) {};

    /**
     * Remove the key from storage.
     */
    this.remove = function () {};
  }

  function makeApiKeyProvider($injector) {
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
     * @return this
     */
    function setStorageKey(key) {
      storageKey = key;

      return ApiKeyProvider;
    }

    /**
     * @param {string} engine An injectable constant that resolves an Injector.
     *
     * @return this
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
     * @return this
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
    function ApiKeyService($injector) {
      var ApiKey = this;
      var engine;
      var apiKey = getApiKeyFromStorage();

      ApiKey.get = getApiKey;
      ApiKey.set = setApiKey;
      ApiKey.id = getApiKeyId;
      ApiKey.delete = deleteApiKey;
      ApiKey.owner = getOwner;

      return ApiKey;

      function getApiKey() {
        return apiKey ? apiKey.key : null;
      }

      function getOwner() {
        return apiKey ? apiKey.owner : null;
      }

      function getApiKeyId() {
        return apiKey ? apiKey.id : null;
      }

      function setApiKey(key, remember) {
        getStorage().set(apiKey = {
          id: key.id,
          key: key.key,
          owner: {
            id: key.owner.id,
            name: key.owner.name,
          },
        });

        return ApiKey;
      }

      function getApiKeyFromStorage() {
        return getStorage().get() || null;
      }

      /**
       * Delete this API Key from local storage.
       */
      function deleteApiKey() {
        apiKey = null;

        getStorage().remove();

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
