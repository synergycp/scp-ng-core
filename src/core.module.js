(function () {
  'use strict';

  angular
    .module('scp.core', [
      'ngStorage',

      'scp.core.api',
      'scp.core.mixins',
    ]);
})();
