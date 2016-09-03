(function () {
  'use strict';

  angular
    .module('scp.core', [
      'ngStorage',

      'scp.core.api',
      'scp.core.auth',
      'scp.core.mixins',
      'scp.core.util',
    ]);
})();
