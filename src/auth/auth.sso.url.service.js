(function () {
  'use strict';

  angular
    .module('scp.core.auth')
    .provider('SsoUrl', makeSsoUrlProvider)
    ;

  /**
   * @ngInject
   */
  function makeSsoUrlProvider() {
    var SsoUrlProvider = {
      $get: makeService,
      map: map,
      get: get,
      resolve: resolve,
      resolves: [],
    };
    var mapping = {};

    return SsoUrlProvider;

    /**
     * @ngInject
     */
    function makeService($state, $injector, $q) {
      return new SsoUrlService(SsoUrlProvider, $state, $injector, $q);
    }

    function resolve(injectable) {
      SsoUrlProvider.resolves.push(injectable);

      return SsoUrlProvider;
    }

    function map(type, callback) {
      mapping[type] = callback;

      return SsoUrlProvider;
    }

    function get(type) {
      return mapping[type];
    }
  }

  /**
   * SsoUrl Service
   */
  function SsoUrlService (SsoUrlProvider, $state, $injector, $q) {
    var SsoUrl = this;
    var resolveAllPromise;

    SsoUrl.get = get;

    //////////

    function get(options) {
      return promiseToResolveAll()
        .then(getByCallback.bind(null, options))
        ;
    }

    function promiseToResolveAll() {
      return (resolveAllPromise =
        resolveAllPromise ||
          makePromiseToResolveAll()
      );
    }

    function makePromiseToResolveAll() {
      return $q.all(
        _.map(SsoUrlProvider.resolves, promiseToResolve)
      );
    }

    function promiseToResolve(resolve) {
      return $injector.invoke(resolve);
    }

    function getByCallback(options) {
      if (!options.type) {
        return;
      }

      var callback = SsoUrlProvider.get(options.type);

      if (!callback) {
        console.warn(
          'No SSO URL for ' + options.type + '. '+
          'Please use SsoUrlProvider.map("'+options.type+'", callback).'
        );
        return;
      }

      var result = callback($state, options);

      if (result && result.charAt(0) === '#') {
        result = result.substring(1);
      }

      return result;
    }
  }
})();
