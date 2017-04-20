(function () {
  'use strict';

  angular
    .module('scp.core.server')
    .provider('ServerManage', ServerManageFactory)
  ;

  /**
   * @ngInject
   */
  function ServerManageFactory(_) {
    var ServerManageProvider = {};
    var service;

    ServerManageProvider.panels = {
      top: new PanelProvider(_),
      left: new PanelProvider(_),
      right: new PanelProvider(_),
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
      ServerManage.reset = reset;

      function init(_server, _$scope) {
        ServerManage.reset();

        panelContext.server = server = _server;
        $scope = _$scope;

        return renderPanels();
      }

      function reset() {
        ServerManage.renderedPanels.top.length = 0;
        ServerManage.renderedPanels.left.length = 0;
        ServerManage.renderedPanels.right.length = 0;
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
          var renderedPanels = [];
          _.map(panelProvider.items, function (item) {
            var rendered = renderPanel(item);
            _.isArray(rendered) ? 
              _.map(rendered, function(item) {
                renderedPanels.push(renderPanel(item));
              }) : 
              renderedPanels.push(rendered);
          })
          _.setContents(
            ServerManage.renderedPanels[key],
            renderedPanels
          );
        });
      }

      function renderPanel(panel) {
        if (typeof panel === "string") {
          var injectedPanel = $injector.get(panel);
          return typeof injectedPanel == 'function' ? injectedPanel() : injectedPanel;
        }

        panel = _.clone(panel);
        panel.context = _.clone(panel.context || {});
        _.defaults(panel.context, panelContext);

        return panel;
      }

      return ServerManage;
    }
  }

  /**
   * @ngInject
   */
  function PanelProvider(_) {
    var panelProvider = this;

    panelProvider.items = [];
    panelProvider.add = add;
    panelProvider.after = after;

    /**
     * @param {string} name
     * @param item
     * @returns {PanelProvider}
     */
    function after(name, item) {
      var index = _.findIndex(panelProvider.items, {
        name: name,
      });

      index = index === -1 ? panelProvider.items.length : index + 1;
      panelProvider.items.splice(index,  0, item);

      return panelProvider;
    }

    /**
     * @param item
     * @returns {PanelProvider}
     */
    function add(item) {
      panelProvider.items.push(item);

      return panelProvider;
    }
  }
}());
