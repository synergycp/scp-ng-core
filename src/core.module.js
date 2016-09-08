(function () {
  'use strict';

  angular
    .module('scp.core', [
      'scp.core.api',
      'scp.core.auth',
      'scp.core.mixins',
      'scp.core.search',
      'scp.core.util',
    ]);
})();
