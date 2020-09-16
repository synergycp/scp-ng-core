(function () {
  'use strict';

  angular
    .module('scp.core.api')
    .provider('Api', ApiProviderFactory)
  ;

  /**
   * @ngInject
   */
  function ApiProviderFactory(RestangularProvider) {
    var ApiProvider = this;
    var typeMap = {
      'success': 'success',
      'danger': 'danger',
      'warning': 'warning',
      'info': 'info'
    };
    ApiProvider.options = {
    };

    ApiProvider.baseUrl = baseUrl;
    ApiProvider.setUrl = setUrl;
    ApiProvider.addResponseInterceptor = RestangularProvider.addResponseInterceptor;
    ApiProvider.$get = ApiService;

    function setUrl(url) {
      ApiProvider.options.url = url;

      RestangularProvider.setBaseUrl(url);
    }

    function baseUrl() {
      return ApiProvider.options.url;
    }

    /**
     * Proxy for the Restangular service.
     *
     * Responsibilities:
     * 	 - Handle API Error Responses
     * @ngInject
     */
    function ApiService(ApiKey, Restangular, Alert, $injector, _) {
      var Api = wrapRestangular(Restangular);
      var hasReceivedUnauthedError = false;
      Api.baseUrl = baseUrl;
      Api.apiUrl = apiUrl;
      Api.wrap = wrapRestangular;
      Api.showMessagesFrom = showMessagesFrom;

      function wrapRestangular(result) {
        if (!result || typeof result !== "object" || result.isWrapped) {
          return result;
        }

        result.isWrapped = true;
        result.getList = wrapList(result.getList);
        result.remove = request(result.remove);
        result.patch = request(result.patch);
        result.post = request(result.post);
        result.get = request(result.get);
        result.put = request(result.put);
        result.all = wrap(result.all);
        result.one = wrap(result.one);

        return result;

        function wrap(method) {
          return function () {
            return wrapRestangular(
              method.apply(result, arguments)
            );
          };
        }

        function request(method) {
          return function () {
            return method.apply(result, arguments)
              .then(wrapNested)
              .then(displayMessages)
              ;
          };
        }

        function wrapNested(response) {
          // TODO: this setup fixes some weird bug where the URL becomes e.g. PATCH /server/3/3 when you do
          // `server.patch({})` to one of the entries in the result of `api.getList()`. This seems very janky though.
          response.getList = result.getList;
          response.remove = result.remove;
          response.patch = result.patch;
          response.post = result.post;
          response.get = result.get;
          response.put = result.put;
          response.all = result.all;
          response.one = result.one;

          return response;
        }

        function wrapList(oldMethod) {
          return function() {
            return request(oldMethod)
              .apply(null, arguments)
              .then(setRestangularOnList)
              ;

            function setRestangularOnList(list) {
              _.each(list, wrapRestangular);

              return list;
            }
          };
        }
      }

      activate();

      return Api;

      function activate() {
        Restangular.addErrorInterceptor(apiErrorInterceptor);
        Restangular.addErrorInterceptor(apiErrorTranslator);
        Restangular.addFullRequestInterceptor(apiRequestAddApiKey);
      }

      function apiUrl() {
        return baseUrl()+'/api';
      }

      function apiErrorInterceptor(response) {
        switch (response.status) {
        case 401:
          sendToLogin();
          return;
        }
      }

      function sendToLogin() {
        $injector.get('Auth').logout();
      }

      function apiErrorTranslator(response, deferred, responseHandler) {
        Api.showMessagesFrom(response);
      }

      function showMessagesFrom(response) {
        if (response.status === 401) {
          // When someone gets an unauthorized response, we don't want them to get a bunch of errors all at once.
          if (hasReceivedUnauthedError) {
            return;
          }

          hasReceivedUnauthedError = true;
          setTimeout(function () {
            hasReceivedUnauthedError = false;
          }, 1000);
        }

        if (response.data) {
          return _.each(response.data.messages, displayMessage);
        }

        displayMessage({
          type: 'danger',
          text: 'Invalid API Response'
        });
      }

      function displayMessages(response) {
        _.each(response.messages, displayMessage);

        return response;
      }

      function displayMessage(message) {
        var type = typeMap[message.type];

        Alert[type](message.text);
      }

      function apiRequestAddApiKey(element, operation, what, url, headers, params) {
        params = _.assign({
          key: getApiKey(),
        }, params);

        return {
          params: params,
        };
      }

      /**
       * @return {string} Api Key
       */
      function getApiKey() {
        return ApiKey.get() || "";
      }
    }
  }
}());
