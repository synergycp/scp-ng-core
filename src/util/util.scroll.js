(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .service('scroll', ScrollService)
    .run(['$anchorScroll', function($anchorScroll) {
      $anchorScroll.yOffset = 65;   // always scroll by 65 extra pixels
    }])

  /**
   * Scroll Service
   *
   * @ngInject
   */
  function ScrollService ($location, $anchorScroll) {
    var scroll = this;

    scroll.scrollToAnchor = scrollToAnchor;

    //////

    function scrollToAnchor(anchor) {
      $location.hash(anchor);

      // call $anchorScroll()
      $anchorScroll();
    }
  }
})();
