(function () {
  'use strict';

  angular
    .module('scp.core.api')
    .config(ApiConfigRestangular);

  /**
   * @ngInject
   */
  function ApiConfigRestangular(ApiProvider) {
    var host = location.host;

    if (startsWith(host,  'admin.')) {
      host = host.substr('admin.'.length);
    }
    var url = location.protocol + '//api.' + host + '/';
    if (startsWith(host, 'localhost') || startsWith(host,  'dev.synergycp.net')) {
      url = 'http://api.dev.synergycp.net/';
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

    function startsWith(haystack, needle) {
      return haystack.substr(0, needle.length) === needle;
    }
  }
}());
