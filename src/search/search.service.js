(function () {
  'use strict';

  angular
    .module('scp.core.search')
    .service('Search', SearchService)
    ;

  /**
   * Search Service
   *
   * @ngInject
   */
  function SearchService (EventEmitter, $state, $stateParams, $q) {
    var Search = this;
    var event = EventEmitter();
    var waitAll = $q.defer();

    Search.go = go;
    Search.tab = {
      items: [],
      add: addTab,
      remove: removeTab,
      waitForAllToLoad: waitForAllToLoad,
    };

    event.bindTo(Search);
    event.on('change', syncQuery);
    event.on('tab.add', syncTab);

    //////////

    function waitForAllToLoad() {
      return waitAll.promise;
    }

    function go(search) {
      if (typeof search !== 'undefined') {
        Search.query = search;
      }

      event.fire('change', Search.query);

      return Search;
    }

    function syncQuery() {
      _.map(Search.tab.items, syncTab);
    }

    function addTab(tab) {
      Search.tab.items.splice(
        _.sortedIndexBy(Search.tab.items, tab, 'order'),
        0,
        tab
      );

      event.fire('tab.add', tab);

      tab.on('load', checkAllLoaded);
    }

    function checkAllLoaded() {
      return _.every(Search.tab.items, function (tab) {
        return !tab.loader.loading;
      });
    }

    function removeTab(tab) {
      _.remove(Search.tab.items, tab);

      event.fire('tab.remove', tab);
    }

    function syncTab(tab) {
      tab.list.filter({
        q: Search.query,
      });
    }
  }
})();
