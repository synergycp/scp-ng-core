(function () {
  'use strict';

  angular
    .module('scp.core.api')
    .config(ApiConfigRestangular);

  /**
   * @ngInject
   */
  function ApiConfigRestangular(ApiProvider) {
    var url = '/';
    if (location.host.substr(0, 'localhost'.length) == 'localhost') {
      url = 'http://dev.synergycp.net/';
    }
    if (location.port == 8001 || location.port == 8002) {
      url = 'http://dev.synergycp.net:8000/';
    }
    ApiProvider.setUrl(url);
    ApiProvider.addResponseInterceptor(apiResponseTranslator);

    ///////////

    function apiResponseTranslator(data, operation, what, url, response, deferred) {
      // TODO: Get rid of this entire translator, reference response.data everywhere.
      var extractedData = _.clone(data.data || {});
      extractedData.messages = data.messages;

      if (operation === "getList" && extractedData.data) {
        var meta = extractedData;
        extractedData = extractedData.data;
        extractedData.meta = meta;
      }

      extractedData.response = data;
      extractedData.getOriginalData = function () {
        return data.data;
      };
      return extractedData;
    }
  }
}());
