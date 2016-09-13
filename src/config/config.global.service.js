(function () {
  'use strict';

  angular
    .module('scp.core.config')
    .service('GlobalConfig', GlobalConfigService);

  /**
   * GlobalConfig Service
   *
   * @ngInject
   */
  function GlobalConfigService (Api, $q, _) {
    var GlobalConfig = this;
    var $groups = Api.all('setting-group');
    var groups, slugMap;

    GlobalConfig.bySlug = bySlug;
    GlobalConfig.get = get;

    //////////

    function get(slug) {
      return GlobalConfig
        .bySlug()
        .then(getSetting)
        .then(getValue)
        ;

      function getSetting() {
        return slugMap[slug];
      }
    }

    function getValue(setting) {
      return setting.options ?
        setting.options[setting.value].text :
        setting.value;
    }

    function bySlug() {
      return getList()
        .then(getSlugMap)
        ;
    }

    function getSlugMap() {
      return (slugMap = slugMap || generateSlugMap());
    }

    function generateSlugMap() {
      var map = {};

      _.map(groups, function (group) {
        _.map(group.settings, function (setting) {
          map[setting.slug] = setting;
        });
      });

      return map;
    }

    function getList() {
      if (groups) {
        return $q.when(groups);
      }

      return getFresh();
    }

    function getFresh() {
      return $groups
        .getList()
        .then(storeGroups)
        ;
    }

    function storeGroups(response) {
      // slugMap may no longer be valid, so it must be regenerated.
      slugMap = undefined;

      return (groups = response);
    }
  }
})();
