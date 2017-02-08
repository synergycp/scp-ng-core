(function () {
  'use strict';

  angular
    .module('scp.core.server')
    .provider('ServerManage', ServerManageFactory)
  ;

  /**
   * @ngInject
   */
  function ServerManageFactory() {
    var ServerManageProvider = {};
    var service;

    ServerManageProvider.panels = {
      top: new PanelProvider(),
      left: new PanelProvider(),
      right: new PanelProvider(),
    };
    ServerManageProvider.$get = makeServerManageService;

    return ServerManageProvider;

    /**
     * @ngInject
     */
    function makeServerManageService(_, $injector) {
      return service = service || new ServerManageService(_, $injector);
    }

    /**
     * @ngInject
     */
    function ServerManageService(_, $injector) {
      var ServerManage = this;
      var server, $scope;
      var panelContext = {};

      ServerManage.renderedPanels = {
        top: [],
        left: [],
        right: [],
      };

      ServerManage.init = init;
      ServerManage.getServer = getServer;
      ServerManage.getControllerScope = getControllerScope;

      function init(_server, _$scope) {
        panelContext.server = server = _server;
        $scope = _$scope;

        return renderPanels();
      }

      function getServer() {
        return server;
      }

      function getControllerScope() {
        return $scope;
      }

      function renderPanels() {
        reRenderPanels();

        return ServerManage.renderedPanels;
      }

      function reRenderPanels() {
        _.each(ServerManageProvider.panels, function (panelProvider, key) {
          _.setContents(
            ServerManage.renderedPanels[key],
            _.map(panelProvider.items, renderPanel)
          );
        });
      }

      function renderPanel(panel) {
        if (typeof panel === "string") {
          return $injector.get(panel);
        }

        panel.context = panel.context || {};
        _.defaults(panel.context, panelContext);

        return panel;
      }

      return ServerManage;
    }
  }

  function PanelProvider() {
    var panelProvider = this;

    panelProvider.items = [];
    panelProvider.add = add;

    function add(item) {
      panelProvider.items.push(item);
    }
  }
}());
