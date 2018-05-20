(function () {
  'use strict';

  angular
    .module('scp.core.auth')
    .service('Permission', PermissionService)
  ;

  /**
   * @ngInject
   * @constructor
   */
  function PermissionService(Api, ApiKey, _, $timeout) {
    var Permission = this;
    var cachedId;
    var cachedMap;
    var getMapPromise;

    Permission.has = has;
    Permission.ifHas = ifHas;
    Permission.map = map;

    function has(name) {
      return Permission
        .map()
        .then(function (map) {
          return !!_.get(map, name);
        })
      ;
    }

    function ifHas(name) {
      var onYes = function () {};
      var onNo = function () {};
      Permission
        .has(name)
        .then(function (has) {
          return $timeout(1).then(has ? onYes : onNo);
        })
      ;

      var result = {
        then: then,
        else: doElse,
      }

      return result;

      function doElse(callback) {
        onNo = callback;

        return result;
      }

      function then(callback) {
        onYes = callback;

        return result;
      }
    }

    function map() {
      return ApiKey.waitForOwner()
        .then(function (owner) {
          var ownerId = owner.id;
          if (cachedId && cachedId === ownerId) {
            return cachedMap;
          }

          if (getMapPromise) {
            return getMapPromise;
          }

          return getMapPromise = Api
            .oneUrl('owner', owner.url)
            .one('permission')
            .get()
            .then(function (response) {
              cachedId = ownerId;
              getMapPromise = undefined;
              return cachedMap = response.getOriginalData();
            })
            ;
        });
    }
  }
})();
