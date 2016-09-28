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
    };
    var mapping = {};

    return SsoUrlProvider;

    /**
     * @ngInject
     */
    function makeService() {
      return new SsoUrlService(SsoUrlProvider);
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
   *
   * @ngInject
   */
  function SsoUrlService (SsoUrlProvider) {
    var SsoUrl = this;

    SsoUrl.get = get;

    //////////

    function get(options) {
      return getByCallback(options);
    }

    function getByCallback(options) {
      if (!options.type) {
        return;
      }

      var callback = SsoUrlProvider.get(options.type);

      if (!callback) {
        console.warn('No SSO URL for ' + options.type + '. Please use SsoUrlProvider.map("'+options.type+'", callback).');
        return;
      }

      return callback(options);
    }
  }
})();
