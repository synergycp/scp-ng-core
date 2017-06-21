(function () {
  'use strict';

  angular
    .module('scp.core.api')
    .config(ApiConfigRestangular);

  /**
   * @ngInject
   */
  function ApiConfigRestangular(ApiProvider) {
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
