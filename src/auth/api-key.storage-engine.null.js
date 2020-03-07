(function () {
  'use strict';

  angular
    .module('scp.core.auth')
    .factory('ApiKeyNullStorageEngine', ApiKeyNullStorageEngineFactory)
  ;

  /**
   * @ngInject
   */
  function ApiKeyNullStorageEngineFactory() {
    return function () {
      return new ApiKeyNullStorageEngine();
    };
  }

  function ApiKeyNullStorageEngine() {
    var storage = this;

    storage.get = get;
    storage.set = set;
    storage.remove = remove;

    //////////

    function get() {
    }

    function set(apiKey) {
    }

    function remove() {
    }
  }
})();
