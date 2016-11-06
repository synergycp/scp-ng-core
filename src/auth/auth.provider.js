(function() {
  'use strict';

  angular
    .module('scp.core.auth')
    .provider('Auth', makeAuthProvider)
    ;

  function makeAuthProvider() {
    var loginType, uniqueField;
    var AuthProvider = {
      $get: makeAuthService,
      setLoginType: setLoginType,
      getLoginType: getLoginType,
      setUniqueField: setUniqueField,
      getUniqueField: getUniqueField,
    };

    return AuthProvider;

    function setLoginType(type) {
      loginType = type;

      return AuthProvider;
    }

    function getLoginType() {
      return loginType;
    }

    function setUniqueField(type) {
      uniqueField = type;

      return AuthProvider;
    }

    function getUniqueField() {
      return uniqueField;
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
      Auth.verify = verify;
      Auth.getLoginType = getLoginTypeOrFail;
      Auth.whileLoggedIn = whileLoggedIn;
      Auth.isLoggedIn = isLoggedIn;
      Auth.getUniqueField = getUniqueFieldOrFail;
      Auth.setApiKey = setApiKey;

      EventEmitter.bindTo(Auth);

      return Auth;

      /////////////

      function isLoggedIn() {
        return !!ApiKey.id();
      }
      
      function verify(code, verify) {
        return code
          .patch({
            verify: verify,
          })
          .then(getVerifiedApiKey)
          .then(storeApiKey.bind(null, true)) // TODO: remember
          .then(Auth.fire.bind(Auth, 'verify.complete'))
        ;
      }

      function getVerifiedApiKey(response) {
        return response.key;
      }

      function storeApiKey(remember, key) {
        ApiKey.set(key, remember);
        fireLogin();
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
          ;
      }

      function setApiKey(key, remember) {
        return $keys
          .one('current')
          .get({ key: key })
          .then(handleResponse.bind(null, remember))
          ;
      }

      function handleResponse(remember, response) {
        if (response.verify) {
          Auth.fire('verify.start', response.verify.code);
          return;
        }

        storeApiKey(remember, response);
      }

      function getLoginTypeOrFail() {
        var type = AuthProvider.getLoginType();

        if (!type) {
          throw new Error('Login type not configured on AuthProvider');
        }

        return type;
      }

      function getUniqueFieldOrFail() {
        var value = AuthProvider.getUniqueField();

        if (!value) {
          throw new Error('Unique field not configured on AuthProvider');
        }

        return value;
      }
    }
  }
}());
