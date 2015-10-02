(function(angular) {
    var registered_routes = [];
    var getLogger = function() {
        if (!this.$log) {
            var $injector = angular.injector(['ng']);
            this.$log = $injector.get('$log');
        }
        return this.$log;
    };
    /**
     * Create "method" function to prototypes existing Classes
     *
     * @param name {string} method name.
     * @param func {string} function to extend
     * @returns Object extended.
     */
    Function.prototype.method = function(name, func) {
        this.prototype[name] = func;
        return this;
    };
    /**
     * Generate a Bundles with specified manifiest description
     *
     * @param bundle {string} module name.
     * @param namespaces {array} list of namespaces.
     * @param dependencies {array} list of modules this module depends upon.
     * @returns {*} the created/existing module.
     */
    angular.manifiest = function(bundle, namespaces, dependencies) {
        //Create the namespace via angular style
        angular.forEach(namespaces, function(name) {

            //Angular don't have "exists" method, so , try and catch =(
            try {
                angular.module(name);
            } catch (err) {
                angular.module(name, dependencies || []);
            }

        });
        //Register a 'angular like' module
        return angular.module(bundle, namespaces);
    };
    /**
     * Register a route in angular state.
     *
     * @param route {string} route name.
     * @param controller {function} Controller asociated
     * @returns {*}.
     */
    angular.route = function(route, controller) {
        var separator = "/";
        var parameter_separator = "/:";
        var layout_separator = ".";
        var logger = getLogger();
        var default_document = "/index";
        if (!route) {
            logger.error("route value is required");
        }
        var layout = "";
        var module = route.substring(0, route.indexOf(separator));
        var path = route.substring(route.indexOf(separator) + 1);


        //Exist's Layout inheritance??
        if (module.indexOf(layout_separator) > 0) {
            var baseParts = module.split(layout_separator);
            layout = baseParts[0];
            module = baseParts[1];
        }

        var url = '/{0}/{1}'.format([
            module,
            path
        ]);


        var viewPath = 'views{0}.html'.format([url]);

        // "/index" => replace for default page
        if (url.endsWith(default_document)) {
            var regex = new RegExp(default_document, "ig");
            url = url.replace(regex, "");
            route = route.replace(regex, "");
        }

        //has parameter's bindng in url??
        if (route.indexOf(parameter_separator) >= 0) {
            viewPath = viewPath.substring(0, viewPath.indexOf(parameter_separator)) + ".html";
            route = route.substring(0, route.indexOf(parameter_separator));
        }


        var config = null;
        if (layout === "") {
            //Config Without Layout Base Content
            config = {
                url: url,
                templateUrl: viewPath,
                controller: controller
            };
        } else {
            //Config With Layout Template's
            config = {
                url: url,
                views: {
                    content: {
                        templateUrl: viewPath,
                        controller: controller
                    }
                }
            };
        }

        registered_routes.push({
            route: route,
            config: config
        });
    };
    /*
        String.format Like c# Utility
        https://msdn.microsoft.com/es-es/library/system.string.format%28v=vs.110%29.aspx
     */
    var format = function(template, values, pattern) {
        pattern = pattern || /\{([^\{\}]*)\}/g;
        return template.replace(pattern, function(a, b) {
            var p = b.split('.'),
                r = values;
            try {
                for (var s in p) {
                    r = r[p[s]];
                }
            } catch (e) {
                r = a;
            }
            return (typeof r === 'string' || typeof r === 'number') ? r : a;
        });
    };
    var endsWith = function(template, value) {
        /*jslint eqeq: true*/
        return template.match(value + "$") == value;
    };
    var startsWith = function(template, value) {
        return template.indexOf(value) === 0;
    };
    String.method("format", function(values, pattern) {
        return format(this, values, pattern);
    });
    String.method("endsWith", function(value) {
        return endsWith(this, value);
    });
    String.method("startsWith", function(value) {
        return startsWith(this, value);
    });
    //MANUAL BOOTSTRAP
    angular.element(document).ready(function() {

        //Namespace Searching
        var application_bundle = "App";
        var $injector = angular.injector(['ng', 'config']);
        var INITIAL_CONFIGURATION = $injector.get('GLOBAL_CONFIGURATION');
        var $http = $injector.get('$http');
        var logger = getLogger();
        //--------------------------------------------------------------------------------------------------------------------
        //ENVIRONMENT CONFIGURATION
        var environment = (INITIAL_CONFIGURATION.application.environment + "").toLowerCase();
        $http.get('config/env/' + environment + '.json')
            .success(function(ENVIRONMENT_CONFIGURATION) {
                //MERGE CONFIGURATION'S
                var CONFIGURATION = angular.extend(INITIAL_CONFIGURATION, ENVIRONMENT_CONFIGURATION);

                //SAVE CONSTANT WITH BASE COONFIGURATION
                angular.module(application_bundle).constant("CONFIGURATION", CONFIGURATION);
                //--------------------------------------------------------------------------------------------------------------------
                //RESOURCES LOCALIZATION
                var lang = (INITIAL_CONFIGURATION.application.language + "").toLowerCase();
                $http.get('config/locale/' + lang + '.json')
                    .success(function(data) {
                        //SAVE CONSTANT WITH BASE COONFIGURATION
                        angular.module(application_bundle).constant('RESOURCES', data);
                        //ROUTE REGISTRATION STEP
                        angular.module(application_bundle).config(['$stateProvider', function($stateProvider) {
                            angular.forEach(registered_routes, function(route) {
                                //Register a 'angular like' route
                                if(CONFIGURATION.debugging){
                                    logger.debug("route:", route);
                                }
                                $stateProvider
                                    .state(route.route, route.config);
                            });
                            registered_routes = [];
                        }]);
                        //MANUAL INITIALIZE ANGULAR
                        angular.bootstrap(document, [application_bundle]);
                    })
                    .error(function(data, status, headers, config) {
                        logger.error("Can't get resources file (config/resources/" + lang + ".json)");
                    });
                //--------------------------------------------------------------------------------------------------------------------
            })
            .error(function(data, status, headers, config) {
                logger.error("Can't get configuration file (config/env/" + environment + ".json)");
            });
        //--------------------------------------------------------------------------------------------------------------------
    });
})(angular);
;angular.module('gale.templates', []).run(['$templateCache', function($templateCache) {
  "use strict";
  $templateCache.put("gale-finder/directives/galeFinder.tpl.html",
    "<div class=finder><div class=close ng-click=close()><md-icon md-svg-icon=navigation:close></md-icon></div><table><tr><td class=icon><md-icon md-svg-icon=action:search></md-icon></td><td class=box><input ng-change=search(query) ng-model=query placeholder=\"{{placeholder}}\"></td></tr></table><div ng-if=results class=results><div ng-repeat=\"item in results\" ng-click=select(item) layout=row ng-mouseenter=\"activeIndex = $index\" ng-mouseleave=\"activeIndex = -1\" ng-class=\"{'active': $index == activeIndex}\" layout-align=\"start center\"><div flex=5 class=icon><div class=thumb><img ng-src=\"{{item.icon}}\"></div></div><div flex class=name>{{item.name}}<div class=type>{{item.type}}</div></div></div></div><div ng-if=\"results && results.length > 0\" class=footer>{{results.length}} resultados</div></div>");
  $templateCache.put("gale-loading/directives/galeLoading.tpl.html",
    "<gale-center><md-progress-circular class=md-hue-2 md-mode=indeterminate></md-progress-circular><gale-text></gale-text></gale-center>");
  $templateCache.put("gale-table/directives/galeTable.tpl.html",
    "<gale-header class=gale-header layout=row layout-align=\"start center\" ng-transclude></gale-header><gale-body class=gale-body><div class=loading ng-if=isLoading><md-progress-linear md-mode=indeterminate></md-progress-linear></div><gale-row layout=row class=gale-row ng-click=onRowClick(item) layout-align=\"start center\" ng-repeat=\"item in source\" x={{$index}} formatters=$$formatters item=item></gale-row></gale-body>");
}]);
;//------------------------------------------------------
// Company: Valentys Ltda.
// Author: dmunozgaete@gmail.com
// 
// Description: Angular Gale Implementation
// 
// URL: https://github.com/dmunozgaete/angular-gale
// 
// Documentation:
//      http://gale-docs.azurewebsites.net/
//------------------------------------------------------
angular.manifiest('gale', [
    'gale.templates',
    'gale.directives',
    'gale.components',
    'gale.filters',
    'gale.services',
    'gale.services.security',
    'gale.services.configuration',
    'gale.services.rest',
    'gale.services.storage'
],
[
    'ui.router',     //NG ROUTE
    'ngMaterial'   //MATERIAL DESIGN DIRECTIVES
])

.run(['$Configuration', '$LocalStorage', '$log', 'CONFIGURATION', function($Configuration, $LocalStorage, $log, CONFIGURATION) {
    var stored_key = "$_application";
    var app_conf = CONFIGURATION.application;
    var app_stored = $LocalStorage.getObject(stored_key);

    if (app_stored) {

        //check version configuration , if old , broadcast a changeVersion event;
        if (app_stored.version !== app_conf.version || app_stored.environment !== app_conf.environment) {

            $log.debug("a new configuration version is available, calling [on_build_new_version] if exist's !", app_conf.version); //Show only in debug mode

            if (angular.isFunction(CONFIGURATION.on_build_new_version)) {
                try {
                    CONFIGURATION.on_build_new_version(app_conf.version, app_stored.version);
                } catch (e) {

                    $log.debug("failed to execute [on_build_new_version] function defined in config.js", e);
                    throw e;
                }
            }
        }

    }

    //Update
    $LocalStorage.setObject(stored_key, app_conf);

}]);
;angular.module('gale.components')

.directive('galeFinder', function() {
    return {
        restrict: 'E',
        scope: {
            onSearch:       '=',    // Search Function,
            onSelect:       '=',    // Select Function,
            placeholder:    '@',    // Placeholder
            minLength:      '@',    // Search Minimun Length
            blockUi:        '@'     //Block UI??
        },
        templateUrl: 'gale-finder/directives/galeFinder.tpl.html',
        controller: ['$scope', '$element', '$log', '$galeFinder', '$window', function($scope, $element, $log , $galeFinder, $window){
            var self        = {};
            var minLength   = $scope.minLength||3;
            var onSearch    = $scope.onSearch;
            var onSelect    = $scope.onSelect;
            var blockUi     = $scope.blockUi ? ($scope.blockUi === 'true' ? true : false) : true;
            var body        = angular.element(document.body);
            var blocker     = null;

            if(!onSearch){
                $log.error("undefined 'onSearch' for finder component");
            }

            if(!onSelect){
                $log.error("undefined 'onSelect' for finder component");
            }


            $scope.search = function(query){
                $scope.activeIndex = 0;
                if(query.length >= minLength){

                    // Call find Function
                    var promise = onSearch(query);
                    if( angular.isArray(promise) ){
                        $scope.results = items;
                    }else{
                        promise.then(function(items){
                            $scope.results = items;
                        });
                    }
                    

                }else{

                    $scope.results = [];

                }
            };

            $scope.select = function(item){
                var ret = onSelect(item);
                if(ret){
                    self.hide();
                }
            };

            $scope.close = function(){
                self.hide();
            };

            //-------------------------------------------------
            //--[ GLOBAL FUNCTION'S
            self.hide = function(){
                $element.removeClass("show");

                //RESET
                $scope.query ="";
                $scope.results = [];
                $scope.activeIndex = 0;

                //BLOCKER
                if(blocker){
                    blocker.remove();
                }
            };

            self.show = function(){
                if(blockUi){
                    blocker =  angular.element('<md-backdrop class="md-sidenav-backdrop md-opaque ng-scope md-default-theme"></md-backdrop>');
                    body.append(blocker);
                }

                $element.addClass("show");
                $element.find("input").focus();

            };
            //-------------------------------------------------
           
            //-------------------------------------------------
            //Register for Service Interaction
            $galeFinder.$$register(self);  

            //Garbage Collector Destroy
            $scope.$on('$destroy', function() {
                $galeFinder.$$unregister();      //UnRegister for Service Interaction
            });
            //-------------------------------------------------
            
            //-------------------------------------------------
            // UI KEY Navigation
            var keys = [];
            keys.push({ code: 13, action: function() {
                
                if($scope.results.length>0 && $scope.activeIndex >= 0){
                    var item = $scope.results[$scope.activeIndex];
                    $scope.select(item);
                }

            }});
            keys.push({ code: 38, action: function() { 
                $scope.activeIndex--; 
            }});
            keys.push({ code: 40, action: function() { 
                $scope.activeIndex++; 
            }});
            keys.push({ code: 27, action: function() { 
                self.hide();
            }});

            $element.bind('keydown', function( event ) {
               
               keys.forEach(function(o) {
                    if ( o.code !==  event.keyCode ) { 
                        return; 
                    }
                    o.action();
                });

               event.stopPropagation();
            });
            //-------------------------------------------------
            
        }],

        link: function (scope, element, attrs, ctrl) {

        }
    };
});
;angular.module('gale.components')

.factory('$galeFinder', ['$q', '$rootScope', function($q, $rootScope) {
    var self        = this;
    var _component  = null;

    var _get = function(){
        if(!_component){
            throw { 
                message: 'no finder has found' 
            };
        }
        return _component;
    };

    //Entry Point to register
    self.$$register = function(component, uniqueID){
        _component = component;
    };

    //Entry Point to register
    self.$$unregister = function(component, uniqueID){
        _component = null;
    };

    //Manual Bootstrapp
    self.show = function(){
        return _get().show();
    };

    self.hide = function(){
        return _get().hide();
    };

    return self;
}]);
;angular.module('gale.components')

.directive('galeCenter', function() {
    return {
        restrict: 'E',
        require: '^galeLoading',
        scope: {
        },
        controller: ['$scope', '$element', '$log', function($scope, $element, $log ){
           
        }],

        link: function (scope, element, attrs, ctrl) {
            element.attr("layout", "row");
            element.attr("layout-align", "start center");
        }
    };
});
;angular.module('gale.components')

.directive('galeLoading', function() {
    return {
        restrict: 'E',
        scope: {
            defaultMessage:     '@'     //Default Message
        },
        templateUrl: 'gale-loading/directives/galeLoading.tpl.html',
        controller: ['$scope', '$element', '$log', '$galeLoading', function($scope, $element, $log , $galeLoading){
            var self            = {};
            var defaultMesasage = $scope.defaultMessage||"";

            //-------------------------------------------------
            //--[ GLOBAL FUNCTION'S
            self.hide = function(){
                $element.removeClass("show");
            };

            self.show = function(message){
                $element.addClass("show");
                var elm = $element.find("gale-text");
                if(message){
                    elm.html(message);
                }else{
                    elm.html(defaultMesasage);
                }
            };
            //-------------------------------------------------
           
            //-------------------------------------------------
            //Register for Service Interaction
            $galeLoading.$$register(self);  

            //Garbage Collector Destroy
            $scope.$on('$destroy', function() {
                $galeLoading.$$unregister();      //UnRegister for Service Interaction
            });
            //-------------------------------------------------
        }],

        link: function (scope, element, attrs, ctrl) {
            
            element.attr("layout", "row");
            element.attr("layout-align", "center center");


        }
    };
});
;angular.module('gale.components')

.factory('$galeLoading', ['$q', '$rootScope', function($q, $rootScope) {
    var self        = this;
    var _component  = null;

    var _get = function(){
        if(!_component){
            throw { 
                message: 'no gale-loading has found' 
            };
        }
        return _component;
    };

    //Entry Point to register
    self.$$register = function(component, uniqueID){
        _component = component;
    };

    //Entry Point to register
    self.$$unregister = function(component, uniqueID){
        _component = null;
    };

    //Manual Bootstrapp
    self.show = function(message){
        return _get().show(message);
    };

    self.hide = function(){
        return _get().hide();
    };

    return self;
}]);
;angular.module('gale.components')

.directive('galePage', function() {
    return {
        restrict: 'E',

        scope: {
            title: '@',
            onKeydown: '='
        },

        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
            var $window = angular.element(window);

            //-------------------------------------------
            var onKeyDown = $scope.onKeydown;
            if(onKeyDown){
                $window.on('keydown', function( event ) {
                    onKeyDown(event, event.keyCode);
                });
            }
            //-------------------------------------------
            
            //-------------------------------------------
            //Garbage Collector Destroy
            $scope.$on('$destroy', function() {
                $window.off('keydown');
            });
            //-------------------------------------------
        }],

        link: function (scope, element, attrs) {
            scope.$emit("gale-page:title:changed", {
                title: (scope.title||" ")
            });
        }
    };
});;angular.module('gale.components')

.directive('galeColumn', function() {
    return {
        restrict: 'E',
        require: '^galeTable',
        scope: {
    		title         : '@',    // Column Title
            property      : '@',    // Property to Bind
            width         : '@',    // Column Width (in %)
            align         : '@'     // Text Align
        },
        transclude: true,   

        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
           
        }],

        link: function (scope, element, attrs, galeTable, $transclude) {
            element.attr("flex", (scope.width ? scope.width :""));
            element.addClass("gale-column");
            
            $transclude( scope, function( fragments ) {
                //--------------------------------------------------------
                //Try to get header element (CUSTOM)
                var header = _.find(fragments,function(elm){
                    return elm.nodeName.toLowerCase() === "gale-header";
                });

                if(!header){
                    header = angular.element("<div>" + (scope.title||"") + "</div>");
                }else{
                    header = angular.element(header);

                    //IF HAS NG-TEMPLATE (FIX BUG TRANSCLUDE)
                    var hscript = header.find("script");
                    if(hscript.length >0 ){
                        header = hscript;
                    }else{
                        var htemplate = header.find("template");
                        if(htemplate.length >0 ){
                            htemplate = htemplate;
                        }
                    }
                }
                
                //PROPERTY: WIDTH
                var cls = null;
                switch (scope.align){
                    case "left":
                        cls = "alignLeft";
                        break;
                    case "right":
                        cls = "alignRight";
                        break;
                    case "center":
                        cls = "alignCenter";
                        break;
                }
                if(cls){
                    header.addClass(cls);
                }

                //Append the header 
                element.append( header );    
                //--------------------------------------------------------
                
                //--------------------------------------------------------
                //Try to get item element (CUSTOM)
                var item = _.find(fragments,function(elm){
                    return elm.nodeName.toLowerCase() === "gale-item";
                });

                if(!item){
                    var html = "";
                    if(scope.property){
                        html = "{{item." + scope.property + "}}";
                    }
                    item = angular.element("<div>" + html + "</div>");
                }else{
                    item = angular.element(item);

                    //IF HAS NG-TEMPLATE (FIX BUG TRANSCLUDE)
                    var script = item.find("script");
                    if(script.length >0 ){
                        item = script;
                    }else{
                        var template = item.find("template");
                        if(template.length >0 ){
                            item = template;
                        }
                    }
                    
                }

                //Append the item 
                galeTable.$$formatters.push({
                    property: scope.property,
                    width: scope.width,
                    align: scope.align,
                    template: item.html()
                });
                //--------------------------------------------------------
            });
        }
    };
});;angular.module('gale.components')

.directive('galeItem', function() {
    return {
        restrict: 'E',
        require: '^galeTable',
        compile: function (element, attrs, $transclude) {
        },
        controller: ['$scope', '$element', '$attrs', '$interpolate', '$compile', function($scope, $element, $attrs, $interpolate, $compile) {
        }]
    };
});;angular.module('gale.components')

.directive('galeRow', ['$compile', '$interpolate', function($compile, $interpolate) {
    return {
        restrict: 'E',
        require: '^galeTable',
        controller: ['$scope', '$element', '$attrs', '$interpolate', '$compile', function($scope, $element, $attrs, $interpolate, $compile) {
              
        }],
		link: function (scope, element, attrs , ctrl) {
            angular.forEach(scope.$$formatters, function(formatter, $index){

                var template = "<gale-cell class='karma-cell'>" + formatter.template + "</gale-cell>";
                var cell = $compile(template)(scope);

                //PROPERTY: WIDTH
                cell.attr("flex", (formatter.width ? formatter.width :""));

                //PROPERTY: WIDTH
                var cls = null;
                switch (formatter.align){
                    case "left":
                        cls = "alignLeft";
                        break;
                    case "right":
                        cls = "alignRight";
                        break;
                    case "center":
                        cls = "alignCenter";
                        break;
                }
                if(cls){
                    cell.addClass(cls);
                }

                //PROPERTY: ROW INDEX
                cell.attr("y", $index);
                
                //PROPERTY: BIND ON CELL CLICK
                cell.bind("click", function(ev){
                    var $cell = angular.element(this);

                    var x = $cell.parent().attr("x");
                    var y = $cell.attr("y");
                 
                    //Cell Click    
                    ctrl.$$cellClick(ev, scope.item, y, x );

                    /*
                    ev.stopPropagation();
                    ev.preventDefault();
                    return false;
                    */
                });
            
                element.append(cell);
            });
		}
    };
}]);;angular.module('gale.components')

.directive('galeTable', function() {
    return {
        restrict: 'E',
        scope: {
            paginate:   '@',    // Paginate the items or not??
            items:      '=',    // Object with contains and Array ob Object to render
            endpoint:   '@',    // OData Endpoint
            showHeader: '@',    // Show Header in Table or Not
            rowClick:   '&',    // Row Click Handler
            cellClick:  '&',    // Cell Click Handler
            name:       '@'     // gale Table Unique ID
        },
        transclude: true,
        templateUrl: 'gale-table/directives/galeTable.tpl.html',
        controller: ['$scope', '$element', '$interpolate', '$compile', '$Api', '$galeTable', 'KQLBuilder', function($scope, $element, $interpolate, $compile, $Api, $galeTable, KQLBuilder){
            this.$$formatters   = $scope.$$formatters = [];                 //Lazy Load Instantation
            var self            = this;                                     //Auto reference
            var unique_id       = ($scope.name||(new Date()).getTime());    //Component Unique ID
            var configuration   = {};                                       //Configuration if 'setup'

            //------------------------------------------------------------------------------
            // EVENT IMPLEMENTATION
            var $$listeners     =   {};   
            self.$on = function(name, listener){

                //----------------------------------------
                //If hook, via $on change the pointer to hand
                if(name === "row-click"){
                    $element.addClass("row-click");
                }
                //----------------------------------------
                
                var namedListeners = $$listeners[name];
                if (!namedListeners) {
                  $$listeners[name] = namedListeners = [];
                }
                namedListeners.push(listener);

                //de-register Function
                return function() {
                  namedListeners[indexOf(namedListeners, listener)] = null;
                };
            };

            self.hasEventHandlersFor = function(name){
                return $$listeners[name] != null;
            };

            self.$fire = function(name, args){
                var listeners = $$listeners[name];
                if(!listeners){
                    return;
                }
                
                angular.forEach(listeners, function(listener){
                    listener.apply(listener, args);
                });
            };
            //------------------------------------------------------------------------------
            
            //------------------------------------------------------------------------------
            //Register for Service Interaction
            $galeTable.$$register(self, unique_id);   
            
            //Retrieve the Unique Id for the gale Table
            self.getUniqueId = function(){
                return unique_id;
            };

            //Manual Bootstrap
            self.setup = function(endpoint, cfg){
                
                var url = endpoint;
                if(cfg){
                    url = KQLBuilder.build(url, cfg);
                }

                configuration = cfg||{};    //Save current configuration

                $scope.endpoint = url;
            };

            //Bind to Endpoint
            self.bind = function(endpoint){
                $scope.isLoading = true;

                $Api.invoke('GET', endpoint, null, configuration.headers)
                .success(function(data){

                    self.render(data, true);
                    self.$fire("load-complete", [data, unique_id]);
                    
                })
                .finally(function(){
                    $scope.isLoading = false;
                });
            };
            
            //Render table
            self.render = function(data, isRest){
                self.$fire("before-render", [data, unique_id]);

                $scope.source = isRest ? data.items : data;
                if (isRest){
                    data.total = data.items.length;
                }
            };
            //------------------------------------------------------------------------------

            //Cell Click
            var cellClickHandler = $scope.cellClick();
            self.$$cellClick = function(ev, item , cellIndex, rowIndex){
                
                //Scale to Row Click
                self.$fire("cell-click", [ev, item , {x: rowIndex, y: cellIndex}, self.getUniqueId()]);                
            };            

            //Garbage Collector Destroy
            $scope.$on('$destroy', function() {
                $galeTable.$$unregister(self, unique_id);      //UnRegister for Service Interaction
            });

        }],

        link: function (scope, element, attrs,ctrl) {

            var rowClickHandler = scope.rowClick();

            if(scope.showHeader && !scope.$eval(scope.showHeader)) {
                element.find("gale-header").css("display", "none");
            }

            //General Clases on gale Table
            element.attr("layout-fill","");
            element.addClass("gale-table");

            //Watch for Changes
            scope.$watch('endpoint', function(value) {
                if (value) {
                    ctrl.bind(value);
                }
            });

            //Watch for Changes
            scope.$watch('items', function(value) {
                if (value) {
                    ctrl.render(value, false);
                }
            });

            //Add cursor if handler exists
            if(rowClickHandler || ctrl.hasEventHandlersFor("row-click")){
                element.addClass("row-click");
            }

            scope.onRowClick = function(item){
                
                //Row Click
                ctrl.$fire("row-click", [event, item , ctrl.getUniqueId()]);
                if(rowClickHandler){
                   rowClickHandler(item);
                }

            };
           
        }
    };
});;angular.module('gale.components')

.factory('$galeTable', ['$q', '$rootScope', function($q, $rootScope) {
    var self        = this;
    var deferred    = $q.defer();
    var components  = {};

    //Entry Point to register
    var $$register = function(component, uniqueID){
        components[uniqueID] = component;
    };

    //Entry Point to register
    var $$unregister = function(component, uniqueID){
        delete components[uniqueID];
    };

    var _getByHandle = function(uniqueID){
        var identifier =  uniqueID;

        if(!identifier){
            var count = Object.keys(components).length;
            if(count === 0){
                throw { 
                    message: 'no galeTable has instantied in the view' 
                };
            }

            if(count > 1){
                throw { 
                    message: 'when you have more than 1 galetable in view, you must send the uniqueID' 
                };
            }else{
                identifier = (function() { 
                    for (var id in components){
                        return id;
                    }
                })();
                    
            }
        }

        var component = components[identifier];
        if(!component){
            throw { 
                message: 'no galeTable has found with id {0}'.format([identifier]) 
            };
        }
        return component;
    };

    //Get Registered Component's
    self.getRegisteredTables = function(){
        return components;
    };


    //Call to directive endpoint
    self.endpoint = function(value, uniqueID){
        return _getByHandle(uniqueID).endpoint(value);
    };

    //Manual Bootstrapp
    self.setup = function(endpoint, cfg, uniqueID){
        return _getByHandle(uniqueID).setup(endpoint, cfg);
    };

    self.$on = function(eventName, callback, uniqueID){
        var component = _getByHandle(uniqueID);
        component.$on(eventName, callback);   //
    };

    deferred.promise.$$register = $$register;
    deferred.promise.$$unregister = $$unregister;

    // Resolve when the view has Completely Loaded ,and all gale-table's are registered
    $rootScope.$on('$viewContentLoaded', function(event) {
        deferred.resolve(self);
    });


    return deferred.promise;
}]);
;angular.module('gale.directives')

.directive('selectTextOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                this.select();
            });
        }
    };
});;angular.module('gale.directives')
    .directive('toNumberOnBlur', ['$filter', '$locale', function($filter, $locale) {
        return {
            require: 'ngModel',
            restrict: 'A',
            link: function(scope, elm, attrs, ctrl) {
                var isReadonly = attrs.readonly;
                elm.bind('blur', function() {
                    var filter = "number";
                    ctrl.$viewValue = $filter(filter)(ctrl.$modelValue);
                    ctrl.$render();
                });
                elm.bind('focus', function() {
                    if (!isReadonly) {
                        ctrl.$viewValue = ctrl.$modelValue;
                        ctrl.$render();
                    }
                });
                scope.$watch('ctrl.$modelValue', function() {
                    elm.triggerHandler('blur');
                });
            }
        };
    }]);
;/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')

.directive('ngEmail', ['$log', function($log) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

            ctrl.$validators.email = function(modelValue, viewValue) {

                if (ctrl.$isEmpty(modelValue)) {
                  // consider empty models to be valid
                  return true;
                }

                if (ctrl.$isEmpty(viewValue)) {
                    //is View Value is empty
                    return false;
                }

                //Validate
                return pattern.test(viewValue);  // returns a boolean 
            };

        }
    };
}]);;/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')

.directive('ngRange', ['$log', function($log) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl) {
            
            var min = parseInt(attrs.min);
            var max = parseInt(attrs.max);

            ctrl.$validators.range = function(modelValue, viewValue) {

                var value = parseInt(viewValue);

                if (ctrl.$isEmpty(modelValue)) {
                  // consider empty models to be valid
                  return true;
                }

                if (ctrl.$isEmpty(viewValue)) {
                    //is View Value is empty
                    return false;
                }

                if(!isNaN(min) && !isNaN(max)){

                    if (value >= min && value <= max) {
                        return true; 
                    }
                    return false;
                }

                if(!isNaN(min)){
                    if (value >= min) {
                        // it is valid
                        return true;
                    }
                    return false;
                }

                if(!isNaN(max)){
                    if (value <= max) {
                        // it is valid
                        return true;
                    }
                    return false;
                }

                // it is invalid
                return true;
            };

        }
    };
}]);;/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')
.directive('ngRut', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            var validaRut = function (rutCompleto) {
                var tmp = [];

                if(rutCompleto.indexOf("-") > 0){
                    if (!/^[0-9]+-[0-9kK]{1}$/.test( rutCompleto )){
                        return false;
                    }
                    tmp = rutCompleto.split('-');
                }else{
                    //Sin Guion
                    var rut = rutCompleto.replace("-", "");

                    tmp.push(rut.substring(0, rut.length-1));
                    tmp.push(rut.substring(rut.length-1));

                }
                if(tmp.length<2){
                    return false;
                }

                return (dv(tmp[0]) + "") === (tmp[1].toLowerCase() + "");
            };

            var dv  = function(T){
                var M=0,S=1;
                for(;T;T=Math.floor(T/10)){
                    S=(S+T%10*(9-M++%6))%11;
                }
                return S?S-1:'k';
            };

            ctrl.$validators.rut = function(modelValue, viewValue) {
                
                if (ctrl.$isEmpty(modelValue)) {
                  // consider empty models to be valid
                  return true;
                }

                if (ctrl.$isEmpty(viewValue)) {
                    //is View Value is empty
                    return false;
                }

                if (validaRut(viewValue)) {
                    // it is valid
                    return true;
                }

                // it is invalid
                return false;
            };

        }
    };
});;angular.module('gale.filters')
.filter('capitalize', function() {
    return function(input, all) {
        return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }) : '';
    };
});
;angular.module('gale.filters')	

.filter('localize', ['$Localization', '$log', '$interpolate', function ($Localization, $log, $interpolate) {
	return function (text, parameters) {

		try {

			var template = $Localization.get(text);

			if(parameters){
				var exp = $interpolate(template);
	            template = exp({
	            	parameters: parameters
	            });
	        }

            return template;

		}catch(e){
			return text;
		}
	};
}]);;(function(){

	var resourceUrl = function(resourceUrl , Identity){
		if(Identity.isAuthenticated()){
			resourceUrl += "&access_token=" + Identity.token().access_token;
		}

		return resourceUrl;
	};

	angular.module('gale.filters')

	.filter('restricted', ['$Api', 'Identity', function ($Api, Identity) {
		return function (resourceUrl) {
			return resourceUrl(resourceUrl, Identity);
		};
	}]);

})();
;angular.module('gale.filters')	

.filter('template', ['$log', '$interpolate', function ($log,$interpolate) {
	return function (template, context) {

            var exp = $interpolate(template);
            var content = exp(context);
           
           return content;
	};
}]);;angular.module('gale.services.configuration')

.service('$Configuration', ['$rootScope', '$LocalStorage', 'CONFIGURATION', function ($rootScope, $LocalStorage, CONFIGURATION) {
    var _values             = {};

    //LOAD THE INITIAL CONFIGURATION
    for(var env_name in CONFIGURATION){
        set(env_name, CONFIGURATION[env_name]);
    }
    
    function get(name, defaultValue){
        var v = _values[name]; 
        if(typeof v === undefined){
            if(defaultValue){
                return defaultValue;
            }
            throw Error(name + " don't exists in configuration");
        }
        return _values[name];
    }

    function exists(name){
        return _values[name] != null;
    }

    function set(name, value){
        _values[name] = value;
    }

    return {
        get: get,
        exists: exists
    };
}]);;angular.module('gale.services.configuration')
.service('$Localization', ['RESOURCES', function(RESOURCES) {
    function get(name, defaultValue) {
        var v = RESOURCES[name];
        if (typeof v === 'undefined') {
            ns = name.split(".");
            index = RESOURCES;
            for (var n in ns) {
                if (index[ns[n]] !== undefined) {
                    index = index[ns[n]];
                    error = false;
                }
                else {
                    error = true;
                }
            }
            if (!error) {
                return index;
            }
            else {
                if (defaultValue) {
                    return defaultValue;
                }
                throw Error(name + " don't exists in resources");
            }
        }
        return RESOURCES[name];
    }

    function exists(name) {
        return RESOURCES[name] != null;
    }

    return {
        get: get,
        exists: exists
    };
}]);
;angular.module('gale.services')

.provider('$Api', function() {

    //---------------------------------------------------
    //Configurable Variable on .config Step
    var _endpoint = null;
    var EVENTS = {
        BEFORE_SEND:'before-send',
        SUCCESS:    'success',
        ERROR:      'error'
    };

    this.setEndpoint = function (endpoint) {
        _endpoint = endpoint;
    };
    //---------------------------------------------------

    //---------------------------------------------------
    this.$get = ['$rootScope', '$http', '$log', 'KQLBuilder', function ($rootScope, $http, $log, KQLBuilder) {
        var self            =   this;
        
        //------------------------------------------------------------------------------
        // EVENT IMPLEMENTATION
        var $$listeners     =   {};   
        self.$on = function(name, listener){

            var namedListeners = $$listeners[name];
            if (!namedListeners) {
              $$listeners[name] = namedListeners = [];
            }
            namedListeners.push(listener);

            //de-register Function
            return function() {
              namedListeners[indexOf(namedListeners, listener)] = null;
            };
        };

        var fire = function(name, args){
            var listeners = $$listeners[name];
            if(!listeners){
                return;
            }
            
            angular.forEach(listeners, function(listener){
                listener.apply(listener, args);
            });
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        self.getEndpoint = function(value){
            if(!_endpoint){
                throw Error("ENDPOINT_NOT_CONFIGURED");
            }
            return _endpoint;
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        self.invoke = function(method, url, body, headers) {

            var _headers = {
                'Content-Type': 'application/json'
            };

            //Custom Header's??
            if(headers){
                for(var name in headers){
                    _headers[name] = headers[name];
                }
            }
            
            //---------------------------------------------------
            // CALL LISTENER'S
            fire(EVENTS.BEFORE_SEND, [_headers, url, body]);
            //---------------------------------------------------

            //Supposing is a Fragment and need to use the API
            var fullURL = self.getEndpoint() + url;

            //Url is a valid URL ??
            if(/(http|https):\/\//.test(url)) {
                fullURL = url;
            }

            var cfg = {
                url: fullURL,
                method: method,
                headers: _headers
            };
            
            cfg[(method === "GET" ? "params": "data")] = body;

            $log.debug("["+method+" " + url + "] parameters: " , body);

            var http = $http(cfg)
            .success(function (data, status, headers, config) {
                //---------------------------------------------------
                fire(EVENTS.SUCCESS, [data, status, headers]);
                //---------------------------------------------------
            })
            .error(function (data, status, headers, config) {
                
                //---------------------------------------------------
                fire(EVENTS.ERROR, [data, status, headers]);
                //---------------------------------------------------

                //$log.error(data, status, headers, config);
            });

            return http;
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: CREATE OPERATION
        self.create= function(url, body, headers){
            return self.invoke('POST', url, body, headers);
        };
        //------------------------------------------------------------------------------
        
        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.kql= function(url, kql, headers){
            
            //Has OData Configuration???
            url = KQLBuilder.build(url, kql);   
            
            return self.invoke('GET', url, {}, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.read= function(url, parameters, headers){
    
            return self.invoke('GET', url, parameters, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: UPDATE OPERATION
        self.update= function(url, id, body, headers){
            url += "/{0}".format([id]); //PUT url/id

            return self.invoke('PUT', url, body, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: DELETE OPERATION
        self.delete= function(url, id, headers){

            url += "/{0}".format([id]); //DELETE url/id

            return self.invoke('DELETE', url, {}, headers);
        };
        //------------------------------------------------------------------------------


        return self;
    }];
    //---------------------------------------------------
});;angular.module('gale.services')

.factory('KQLBuilder', function() {

	var self = this;

	// Define the constructor function.
    self.build = function(endpoint , configuration) {

    	//Add Endpoint
        var arr = [];
        var builder = [
        	endpoint + "?"
        ];


        //SELECT
        if(configuration.select){
    		builder.push("$select=");
    		//---------------------------------
    		arr = [];
    		angular.forEach(function(key){
    			arr.push(key);
    		});
			//---------------------------------
    		builder.push(arr.join(","));
    		builder.push("&");
        }

        //FILTER
        if(configuration.filters){
            builder.push("$filter=");
            //---------------------------------
            arr = [];
            angular.forEach(configuration.filters, function(item){
                arr.push(
                    item.property +
                    " " +
                    item.operator +
                    " '" +
                    item.value  +
                    "'"
                );
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //LIMIT
        if(configuration.limit){
            builder.push("$limit=");
            builder.push(configuration.limit);
            builder.push("&");
        }


        //ORDER BY
        if(configuration.orderBy){
            builder.push("$orderBy=");
            builder.push(configuration.orderBy.property);
            builder.push(" ");
            builder.push(configuration.orderBy.order);
            builder.push("&");
        }

        var url = builder.join("");

        return url;
    };


    return this;
});;angular.module('gale.services')
    .run(['$Identity', function($Identity) {}])
    //----------------------------------------
    .provider('$Identity', function() {
        var $ref = this;
        var AUTH_EVENTS = {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        };
        //Configurable Variable on .config Step
        var _issuerEndpoint = null;
        var _logInRoute = null;
        var _enable = false;
        var _whiteListResolver = function() {
            return true;
        };
        //
        this.setIssuerEndpoint = function(value) {
            _issuerEndpoint = value;
            return $ref;
        };
        this.setLogInRoute = function(value) {
            _logInRoute = value;
            return $ref;
        };
        this.enable = function() {
            _enable = true;
            return $ref;
        };
        this.setWhiteListResolver = function(value) {
            if (typeof value !== "function") {
                throw Error("WHITELIST_RESOLVER_FUNCTION_EXPECTED");
            }
            _whiteListResolver = value;
            return $ref;
        };

        function getIssuerEndpoint() {
            if (!_issuerEndpoint) {
                throw Error("ISSUER_ENDPOINT_NOT_SET");
            }
            return _issuerEndpoint;
        }

        function getLogInRoute() {
            if (!_logInRoute) {
                throw Error("LOGINURL_NOT_SET");
            }
            return _logInRoute;
        }

        function getAuthorizeResolver() {
            return _authorizeResolver;
        }

        this.$get = ['$rootScope', '$Api', '$state', '$LocalStorage', function($rootScope, $Api, $state, $LocalStorage) {
            var _token_key = "$_identity";
            var _properties = {};
            var _authResponse = $LocalStorage.getObject(_token_key);
            var self = this;
            //------------------------------------------------------------------------------
            var _login = function(oauthToken) {
                $LocalStorage.setObject(_token_key, oauthToken);
                _authResponse = oauthToken;
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, oauthToken);
            };
            var _logout = function() {
                $LocalStorage.remove(_token_key);
                _authResponse = null;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                $state.go(getLogInRoute());
            };
            var _addProperty = function(name, value) {
                _properties[name] = value;
            };
            //------------------------------------------------------------------------------
            self.authenticate = function(credentials) {
                return $Api.invoke('POST', getIssuerEndpoint(), credentials)
                    .success(function(data) {
                        _login(data); //Internal Authentication
                    })
                    .error(function() {
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    });
            };
            self.extend = function(name, value) {
                if (typeof name === "object") {
                    for (var key in name) {
                        _addProperty(key, name[key]);
                    }
                    return;
                }
                _addProperty(name, value);
            };
            self.getAccessToken = function() {
                return _authResponse.access_token;
            };
            self.logOut = function() {
                _logout();
            };
            self.getCurrent = function() {
                //Get Payload
                var payload = self.getAccessToken().split('.')[1];
                if (atob) {
                    data = decodeURIComponent(escape(atob(payload)));
                } else {
                    throw Error("ATOB_NOT_IMPLEMENTED");
                }
                data = JSON.parse(data);
                //Extend Identity
                data.property = function(name) {
                    return _properties[name];
                };
                data.isInRole = function(roleName) {
                    return _.contains(data.role, roleName);
                };
                return data;
            };
            self.isAuthenticated = function() {
                return _authResponse !== null;
            };
            //------------------------------------------------------------------------------
            //Add Hook if authentication is enabled
            if (_enable) {
                //API HOOK
                $Api.$on("before-send", function(headers) {
                    //SET AUTHORIZATION HEADER IF USER IS AUTHENTICATED
                    if (self.isAuthenticated()) {
                        var jwt = _authResponse;
                        headers.Authorization = jwt.token_type + " " + jwt.access_token;
                    }
                });
                $Api.$on("error", function(data, status) {
                    /*
                        401 Unauthorized — The user is not logged in
                        403 Forbidden — The user is logged in but isn’t allowed access
                        419 Authentication Timeout (non standard) — Session has expired
                        440 Login Timeout (Microsoft only) — Session has expired
                    */
                    var _event = null;
                    switch (status) {
                        case 401:
                            _logout();
                            return; //Custom Action
                        case 403:
                            _event = AUTH_EVENTS.notAuthorized;
                            break;
                        case 419:
                        case 440:
                            _event = AUTH_EVENTS.sessionTimeout;
                            break;
                    }
                    if (_event) {
                        $rootScope.$broadcast(_event, data, status);
                    }
                });
                //EVENT HOOK
                $rootScope.$on('$stateChangeStart', function(event, toState, current) {
                    if (!self.isAuthenticated() && toState.name !== getLogInRoute()) {
                        //Is in Whitelist??
                        if (!_whiteListResolver(toState, current)) {
                            //Authentication is Required
                            $state.go(getLogInRoute());
                            event.preventDefault();
                        }
                    }
                });
            }
            //------------------------------------------------------------------------------
            //Call Authentication Method to Adapt all services wich need Authorization
            return self;
        }];
    });
;angular.module('gale.services')

.factory('$LocalStorage', ['$window', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = angular.toJson(value);
        },
        getObject: function (key) {
            return angular.fromJson($window.localStorage[key] || null);
        },
        remove: function(key){
            $window.localStorage.removeItem(key);
        },
        clear: function () {
            $window.localStorage.clear();
        },
        exists: function (name){
             return $window.localStorage[key] != null;
        }
    };
}]);;angular.module('gale.services')

.factory("$Timer", ['$timeout', function( $timeout ) {

    // I provide a simple wrapper around the core $timeout that allows for
    // the timer to be easily reset.
    function Timer( callback, duration, invokeApply ) {

        var self = this;

        // Store properties.
        this._callback = callback;
        this._duration = ( duration || 0 );
        this._invokeApply = ( invokeApply !== false );

        // I hold the $timeout promise. This will only be non-null when the
        // timer is actively counting down to callback invocation.
        this._timer = null;

    }

    // Define the instance methods.
    Timer.prototype = {

        // Set constructor to help with instanceof operations.
        constructor: Timer,


        // I determine if the timer is currently counting down.
        isActive: function() {

            return( !! this._timer );

        },


        // I stop (if it is running) and then start the timer again.
        restart: function() {

            this.stop();
            this.start();

        },

        flush: function(){
            if(this._resolveFunction){
                this._resolveFunction();
            }
        },

        // I start the timer, which will invoke the callback upon timeout.
        start: function() {

            var self = this;

            if(self._timer){
               self.stop();    //Destroy any previously timer;
            }


            // NOTE: Instead of passing the callback directly to the timeout,
            // we're going to wrap it in an anonymous function so we can set
            // the enable flag. We need to do this approach, rather than
            // binding to the .then() event since the .then() will initiate a
            // digest, which the user may not want.
            this._timer = $timeout(
                function handleTimeoutResolve() {
                    try {
                        self._callback.call( null );
                    } finally {
                        self._timer = null;
                    }

                },
                this._duration,
                this._invokeApply
            );

        },


        // I stop the current timer, if it is running, which will prevent the
        // callback from being invoked.
        stop: function() {

            $timeout.cancel( this._timer );

            this._timer = false;

        },


        // I clean up the internal object references to help garbage
        // collection (hopefully).
        destroy: function() {

            this.stop();
            this._callback = null;
            this._duration = null;
            this._invokeApply = null;
            this._timer = null;

        }

    };


    // Create a factory that will call the constructor. This will simplify
    // the calling context.
    function timerFactory( callback, duration, invokeApply ) {

        return( new Timer( callback, duration, invokeApply ) );

    }

    // Store the actual constructor as a factory property so that it is still
    // accessible if anyone wants to use it directly.
    timerFactory.Timer = Timer;


    // Return the factory.
    return( timerFactory );

}]);