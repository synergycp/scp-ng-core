(function () {
  'use strict';

  // https://stackoverflow.com/a/25636705/2014288
  /*
    WARNING: hard restrictions
    This directive will work only for `href` attribute, not `ui-sref`.
    Also that means that to be able to use this directive, each state should have own url (state urls should be different). 
    https://stackoverflow.com/a/44823367/2014288
  */
  angular
    .module('scp.core.mixins')
    .directive('eatClickIf', eatClickIf)
    .directive('eatHrefIf', eatClickIf);


  /**
   * @ngInject
   */
  function eatClickIf($parse, $rootScope) {
    return {
      priority: 100,
      restrict: 'A',
      compile: compile
    };

    function compile ($element, attr) {
      var clickFn = $parse(attr.eatClickIf);
      var hrefFn = $parse(attr.eatHrefIf);
      return {
        pre: function link(scope, element) {
          var eventName = 'click';
          element.on(eventName, function(event) {
            var callback = function() {
              var isClickFnTruthy = clickFn(scope, {$event: event});
              var isHrefFnTruthy = hrefFn(scope, {$event: event});
              if (isClickFnTruthy) {
                // prevents ng-click to be executed
                event.stopImmediatePropagation();
              }
              if(isHrefFnTruthy) {
                // prevents href 
                event.preventDefault();
              }
              if(isClickFnTruthy || isHrefFnTruthy) {
                return false;
              }
            };
            if ($rootScope.$$phase) {
              scope.$evalAsync(callback);
            } else {
              scope.$apply(callback);
            }
          });
        },
        post: function() {}
      }
    }
  }
})();
