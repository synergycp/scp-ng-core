(function () {
  'use strict';

  angular
    .module('scp.core.util')
    .service('date', DateService);

  /**
   * Date Service
   *
   * @ngInject
   */
  function DateService (moment) {
    var date = this;

    date.round = round;
    date.parse = parse;
    date.formatDateTime = 'YYYY-MM-DD HH:mm';
    date.formatServer = date.formatDateTime;
    date.formatDate = 'YYYY-MM-DD';

    //////////

    function parse(str) {
      return moment(str);
    }

    function round(date, duration, type) {
      var func = ({
        floor: Math.floor,
        ceil: Math.ceil,
      }[type || ""]) || Math.round;

      return moment(
        func((+date) / (+duration)) * (+duration)
      );
    }
  }
})();
