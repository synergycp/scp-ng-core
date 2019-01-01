(function () {
  'use strict';

  angular
    .module('scp.core.config')
    .provider('Config', makeConfigProvider);

  /**
   * @ngInject
   */
  function makeConfigProvider() {
    var ConfigProvider = {};

    ConfigProvider.$get = makeConfigService;

    return ConfigProvider;
  }

  /**
   * @ngInject
   */
  function makeConfigService(GlobalConfig) {
    return new ConfigService(
      GlobalConfig
    );
  }

  /**
   * Config Service
   */
  function ConfigService (GlobalConfig) {
    var Config = this;

    Config.getHomeBandwidthRange = getHomeBandwidthRange;
    Config.getServerBandwidthRange = getServerBandwidthRange;
    Config.getSwitchBandwidthRange = getSwitchBandwidthRange;
    Config.getSiteName = getSiteName;

    //////////

    function getHomeBandwidthRange() {
      return GlobalConfig.get('bandwidth_default_home');
    }

    function getServerBandwidthRange() {
      return GlobalConfig.get('bandwidth_default');
    }

    function getSwitchBandwidthRange() {
      return GlobalConfig.get('bandwidth_default');
    }

    function getSiteName() {
      return GlobalConfig.get('site_name');
    }
  }
})();
