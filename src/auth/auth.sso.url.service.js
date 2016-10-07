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
    function makeService($state) {
      return new SsoUrlService(SsoUrlProvider, $state);
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
  function SsoUrlService (SsoUrlProvider, $state, PackageLoader) {
    var SsoUrl = this;

    SsoUrl.get = get;

    //////////

    function get(options) {
      return PackageLoader
        .load()
        .then(getByCallback.bind(null, options))
        ;
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
