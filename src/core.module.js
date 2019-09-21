// To fix broken vendor packages that assume module.exports exists.
var module = module || {};

(function () {
  'use strict';

  angular
    .module('scp.core', [
      'scp.core.api',
      'scp.core.auth',
      'scp.core.config',
      'scp.core.dashboard',
      'scp.core.mixins',
      'scp.core.search',
      'scp.core.server',
      'scp.core.util',
    ]);
})();
