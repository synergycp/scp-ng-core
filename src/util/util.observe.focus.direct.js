(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .directive('observableFocus', observableFocusDirective)
    ;

  /**
   * @ngInject
   */
  function observableFocusDirective($timeout) {
    return {
      restrict: 'A',
      scope: {
        observableFocus: '=',
      },
      link: $link,
    };

    function $link(scope, element, attrs) {
      scope.observableFocus.on('change', function (focus) {
        var elem = element[0];

        setTimeout((focus ? elem.focus : elem.blur).bind(elem), 5);
      });

      element.on('blur', function() {
        scope.observableFocus.set(false);
      });

      element.on('focus', function() {
        scope.observableFocus.set(true);
      });
    }
  }
})();
