(function () {

  angular
    .module('scp.core.util')
    .provider('PromiseKeyValStore', makePromiseKeyValStoreProvider);

  function emptyFunction() {}

  /**
   * @ngInject
   */
  function makePromiseKeyValStoreProvider(_) {
    var PromiseKeyValStoreProvider = function () {
      var PromiseKeyValStore = {};
      var valueForKey = {};
      var resolverForKey = {};

      PromiseKeyValStore.$get = makeService;
      PromiseKeyValStore.set = set;

      return PromiseKeyValStore;

      /////////

      function set(key, value) {
        valueForKey[key] = value;
        (resolverForKey[key] || emptyFunction)(value);
        delete resolverForKey[key];
      }

      /**
       * @ngInject
       */
      function makeService($q) {
        return new PromiseKeyValService($q);
      }

      function PromiseKeyValService($q) {
        var PromiseKeyValService = this;

        PromiseKeyValService.get = get;
        PromiseKeyValService.getWithTimeout = getWithTimeout;

        /////////

        function get(key) {
          return getWithTimeout(key, 0);
        }

        function getWithTimeout(key, timeout) {
          if (valueForKey[key]) {
            return $q.when(valueForKey[key]);
          }

          return $q(function (resolve, reject) {
            resolverForKey[key] = resolve;

            if (timeout > 0) {
              setTimeout(function () {
                reject('timeout while fetching key: ' + key + ' from key value store.');
                delete resolverForKey[key];
              }, timeout);
            }
          });
        }
      }
    };

    PromiseKeyValStoreProvider.$get = PromiseKeyValStoreProvider;

    return PromiseKeyValStoreProvider;
  }
})();
