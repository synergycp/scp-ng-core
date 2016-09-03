(function() {
  'use strict';

  angular
    .module('scp.core.auth')
    .provider('Auth', makeAuthProvider)
    ;

  function makeAuthProvider() {
    var loginType;
    var AuthProvider = {
      $get: makeAuthService,
      setLoginType: setLoginType,
      getLoginType: getLoginType,
    };

    return AuthProvider;

    function setLoginType(type) {
      loginType = type;

      return AuthProvider;
    }

    function getLoginType() {
      return loginType;
    }

    /**
     * @ngInject
     */
    function makeAuthService(Api, EventEmitter, ApiKey, $q, _) {
      return new AuthService(
        Api,
        EventEmitter(),
        ApiKey,
        $q,
        _
      );
    }

    /**
     * Auth Service
     */
    function AuthService(Api, EventEmitter, ApiKey, $q, _) {
      var Auth = this;
      var $keys = Api.all('auth/key');

      Auth.logout = logout;
      Auth.login = login;
      Auth.user = user;
      Auth.getLoginType = getLoginTypeOrFail;
      Auth.whileLoggedIn = whileLoggedIn;
      Auth.isLoggedIn = isLoggedIn;

      EventEmitter.bindTo(Auth);

      return Auth;

      /////////////

      function isLoggedIn() {
        return !!ApiKey.id();
      }

      function whileLoggedIn(start, stop) {
        Auth.on('login', start);
        Auth.on('logout', stop);

        if (Auth.isLoggedIn()) {
          start();
        }
      }

      function user() {
        return Api
          .all(Auth.getLoginType())
          .one(''+ApiKey.owner().id)
          ;
      }

      /**
       * Revoke this API Key,
       * so that all of the user's browser instances
       * are logged out of the application.
       *
       * @return {promise}
       */
      function logout() {
        var promise = $q.when(0);

        if (ApiKey.id()) {
          promise.then(function() {
            return $keys
              .one(''+ApiKey.id())
              .remove()
              ;
          });
        }

        return promise
          .then(ApiKey.delete, ApiKey.delete)
          .then(fireLogout, fireLogout)
          ;
      }

      function fireLogout() {
        Auth.fire('logout');
      }

      function fireLogin() {
        Auth.fire('login');
      }

      /**
       * @param object credentials
       * @param boolean remember
       */
      function login(credentials, remember) {
        var data = _.assign({
          type: Auth.getLoginType(),
        }, credentials);

        return $keys
          .post(data)
          .then(handleResponse.bind(null, remember))
          .then(fireLogin)
          ;
      }

      function handleResponse(remember, response) {
        ApiKey.set(response, remember);
      }

      function getLoginTypeOrFail() {
        var type = AuthProvider.getLoginType();

        if (!type) {
          throw new Error('Login type not configured on AuthProvider');
        }

        return type;
      }
    }
  }
}());
