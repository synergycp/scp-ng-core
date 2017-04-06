(function () {
  'use strict';

  angular
    .module('scp.core.mixins')
    .config(LodashMixinConfig)
    .constant('_', _)
    ;

  /**
   * @ngInject
   */
  function LodashMixinConfig(_) {
    _.mixin({
      setContents: setContents,
      enhance: enhance,
      makeArray: makeArray,
      overwrite: overwrite,
      return: wrappedReturn,
      passArg: passArg,
    });

    function passArg(callback) {
      return function (arg) {
        callback();

        return arg;
      };
    }

    function makeArray(length, value) {
      var arr = [];
      while (--length >= 0) {
        arr[length] = value;
      }

      return arr;
    }

    function setContents(dest, origin) {
      dest.length = 0;

      _.each(origin, _.ary(dest.push.bind(dest), 1));
    }

    function enhance(list, source) {
      return _.map(list, function (element) {
        return _.extend({}, element, source);
      });
    }

    function overwrite(original, contents) {
      if (!contents) {
        return original;
      }

      _.forEach(original, function (value, key) {
        original[key] = typeof contents[key] === 'undefined' ? value : contents[key];
      });

      return original;
    }

    function wrappedReturn(result) {
      return function () {
        return result;
      };
    }
  }
})();
