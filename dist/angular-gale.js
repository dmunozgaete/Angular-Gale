/*------------------------------------------------------
 Company:           Valentys Ltda.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Angular Implementation for the Javascript Client GALE
 Github:            https://github.com/dmunozgaete/angular-gale

 Versión:           1.0.0-rc.8
 Build Date:        2016-02-08 1:50:20
------------------------------------------------------*/

(function(angular)
{
    var registered_routes = [];
    var getLogger = function()
    {
        if (!this.$log)
        {
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
    Function.prototype.method = function(name, func)
    {
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
    angular.manifiest = function(bundle, namespaces, dependencies)
    {
        //Create the namespace via angular style
        angular.forEach(namespaces, function(name)
        {

            //Angular don't have "exists" method, so , try and catch =(
            try
            {
                angular.module(name);
            }
            catch (err)
            {
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
     * @param view {string} View Identifier , to configure the controller and template
     * @returns {*}.
     */
    angular.route = function(route, controller, view)
    {
        var separator = "/";
        var parameter_separator = "/:";
        var layout_separator = ".";
        var logger = getLogger();
        var default_document = "/index";
        if (!route)
        {
            logger.error("route value is required");
        }
        var layout = "";
        var module = route.substring(0, route.indexOf(separator));
        var path = route.substring(route.indexOf(separator) + 1);
        var viewName = "content"; //Default View Name to Place in Route
        if (view && view.length > 0)
        {
            //Override the view Name wich configure the route
            viewName = view;
        }

        //Exist's Layout inheritance??
        if (module.indexOf(layout_separator) > 0)
        {
            var baseParts = module.split(layout_separator);
            layout = baseParts[0];
            module = baseParts[1];
        }

        var url = '/{0}/{1}'.format([
            module,
            path
        ]);


        var viewPath = 'views{0}.html'.format([url]);
        var isDefaultDocument = false;

        // "/index" => replace for default page
        if (url.endsWith(default_document))
        {
            var regex = new RegExp(default_document, "ig");
            url = url.replace(regex, "");
            route = route.replace(regex, "");
            isDefaultDocument = true;
        }

        //has parameter's bindng in url??
        if (route.indexOf(parameter_separator) >= 0)
        {
            viewPath = viewPath.substring(0, viewPath.indexOf(parameter_separator)) + ".html";
            route = route.substring(0, route.indexOf(parameter_separator));
        }


        var add = function(url, route)
        {

            var config = null;
            if (layout === "")
            {
                //Config Without Layout Base Content
                config = {
                    url: url,
                    templateUrl: viewPath,
                    controller: controller
                };
            }
            else
            {
                //Config With Layout Template's
                config = {
                    url: url,
                    views:
                    {}
                };

                //add the view Name wich load the view
                config.views[viewName] = {
                    templateUrl: viewPath,
                    controller: controller
                };

            }

            registered_routes.push(
            {
                route: route,
                config: config
            });

        };

        add(url, route);

        //When the page is default Document, add two url for the same controller
        // and template: {url}/index && {url}
        if (isDefaultDocument)
        {
            add(url + default_document, route + default_document);
        }


    };
    /*
        String.format Like c# Utility
        https://msdn.microsoft.com/es-es/library/system.string.format%28v=vs.110%29.aspx
     */
    var format = function(template, values, pattern)
    {
        pattern = pattern || /\{([^\{\}]*)\}/g;
        return template.replace(pattern, function(a, b)
        {
            var p = b.split('.'),
                r = values;
            try
            {
                for (var s in p)
                {
                    r = r[p[s]];
                }
            }
            catch (e)
            {
                r = a;
            }
            return (typeof r === 'string' || typeof r === 'number') ? r : a;
        });
    };
    var endsWith = function(template, value)
    {
        /*jslint eqeq: true*/
        return template.match(value + "$") == value;
    };
    var startsWith = function(template, value)
    {
        return template.indexOf(value) === 0;
    };
    String.method("format", function(values, pattern)
    {
        return format(this, values, pattern);
    });
    String.method("endsWith", function(value)
    {
        return endsWith(this, value);
    });
    String.method("startsWith", function(value)
    {
        return startsWith(this, value);
    });
    //MANUAL BOOTSTRAP
    angular.element(document).ready(function()
    {

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
            .success(function(ENVIRONMENT_CONFIGURATION)
            {
                //MERGE CONFIGURATION'S
                var CONFIGURATION = angular.extend(INITIAL_CONFIGURATION, ENVIRONMENT_CONFIGURATION);

                //SAVE CONSTANT WITH BASE COONFIGURATION
                angular.module(application_bundle).constant("CONFIGURATION", CONFIGURATION);
                //--------------------------------------------------------------------------------------------------------------------
                //RESOURCES LOCALIZATION
                var lang = (INITIAL_CONFIGURATION.application.language + "").toLowerCase();
                $http.get('config/locale/' + lang + '.json')
                    .success(function(data)
                    {
                        //SAVE CONSTANT WITH BASE COONFIGURATION
                        angular.module(application_bundle).constant('RESOURCES', data);

                        //ROUTE REGISTRATION STEP
                        angular.module(application_bundle).config(['$stateProvider', function($stateProvider)
                        {
                            angular.forEach(registered_routes, function(route)
                            {
                                // Inject State
                                $stateProvider.state(route.route, route.config);

                                // Register a 'angular like' route
                                if (CONFIGURATION.debugging)
                                {
                                    logger.debug("route:", route);
                                }

                            });

                            registered_routes = [];
                        }]);

                        //MANUAL INITIALIZE ANGULAR
                        angular.bootstrap(document, [application_bundle]);
                    })
                    .error(function(data, status, headers, config)
                    {
                        logger.error("Can't get resources file (config/resources/" + lang + ".json)");
                    });
                //--------------------------------------------------------------------------------------------------------------------
            })
            .error(function(data, status, headers, config)
            {
                logger.error("Can't get configuration file (config/env/" + environment + ".json)");
            });
        //--------------------------------------------------------------------------------------------------------------------
    });
})(angular);
;angular.module('gale.templates', []).run(['$templateCache', function($templateCache) {
  "use strict";

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
//      http://angular-gale-docs.azurewebsites.net/
//------------------------------------------------------
angular.manifiest('gale', [
    'gale.classes',
    'gale.directives',
    'gale.filters',
    'gale.services',
    'gale.services.security',
    'gale.services.configuration',
    'gale.services.rest',
    'gale.services.storage',
    'gale.classes'
], [
    'ui.router' //NG ROUTE
])

.run(['$Configuration', '$LocalStorage', '$log', 'CONFIGURATION', function($Configuration, $LocalStorage, $log, CONFIGURATION)
{
    var stored_key = "$_application";
    var app_conf = CONFIGURATION.application;
    var app_stored = $LocalStorage.getObject(stored_key);

    if (app_stored)
    {

        //check version configuration , if old , broadcast a changeVersion event;
        if (app_stored.version !== app_conf.version || app_stored.environment !== app_conf.environment)
        {

            $log.debug("a new configuration version is available, calling [on_build_new_version] if exist's !", app_conf.version); //Show only in debug mode

            if (angular.isFunction(CONFIGURATION.on_build_new_version))
            {
                try
                {
                    CONFIGURATION.on_build_new_version(app_conf.version, app_stored.version);
                }
                catch (e)
                {

                    $log.debug("failed to execute [on_build_new_version] function defined in config.js", e);
                    throw e;
                }
            }
        }

    }

    //Update
    $LocalStorage.setObject(stored_key, app_conf);

}]);
;/*------------------------------------------------------
 Company:           Valentys Ltda.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Event Handler Implementation for all Classes which need "Fire Events"
------------------------------------------------------*/
angular.module('gale.classes')

.factory('BaseEventHandler', function()
{

    //Like {eventName: [handlers]}
    var listeners = {};

    //Prototype Function
    var self = {};
    //------------------------------------------------------------------------------
    // EVENT IMPLEMENTATION
    self.$on = function(name, handler)
    {
        var namedListeners = listeners[name];
        if (!namedListeners)
        {
            listeners[name] = namedListeners = [];
        }
        namedListeners.push(handler);

        //Return Destroy Function
        return function()
        {
            var indexOf = namedListeners.indexOf(handler);
            if (indexOf >= 0)
            {
                namedListeners[indexOf] = null;
            }
        };
    };

    self.hasEventHandlersFor = function(name)
    {
        return listeners[name] != null;
    };

    self.$fire = function(name, args)
    {
        if (self.hasEventHandlersFor(name))
        {
            var handlers = listeners[name];
            angular.forEach(handlers, function(handler)
            {
                if (handler)
                {
                    handler.apply(handler, args);
                }
            });
        }
    };

    self.$clear = function(name)
    {
        if (self.hasEventHandlersFor(name))
        {
            delete listeners[name];
        }
    };
    //------------------------------------------------------------------------------

    return self;
});
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

.directive('ngEmail', ['$log', function($log)
{
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, ctrl)
        {
            var pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

            ctrl.$validators.email = function(modelValue, viewValue)
            {

                if (ctrl.$isEmpty(modelValue))
                {
                    // consider empty models to be valid
                    return true;
                }

                if (ctrl.$isEmpty(viewValue))
                {
                    //is View Value is empty
                    return false;
                }

                //Validate
                return pattern.test(viewValue); // returns a boolean 
            };

        }
    };
}]);
;angular.module('gale.directives')
    .directive('ngNumber', ['$filter', '$locale', '$mdConstant', function($filter, $locale, $mdConstant)
    {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope:
            {
                ngNumberOptions: '=?'
            },
            link: function(scope, elm, attrs, ctrl)
            {
                //Default Configuration
                var configuration = angular.extend(
                {
                    decimals: 0,
                    integers: 9,
                    format: true,
                }, (scope.ngNumberOptions ||
                {}));

                var filter = "number";
                var isReadonly = attrs.readonly;

                //WHEN USER LEAVES, FORMAT TO HUMAN READ
                elm.bind('blur', function(event)
                {
                    if (configuration.format)
                    {
                        //CHANGE TO HUMAN EASY READ
                        ctrl.$viewValue = toHuman(ctrl.$modelValue);
                        ctrl.$render();
                    }
                });

                //WHEN USER ACTIVATE THE INPUT, FORMAT FOR ENTRY DATA
                elm.bind('focus', function(event)
                {
                    if (!isReadonly)
                    {
                        //CHANGE FOR READY TO INPUT DATA
                        ctrl.$viewValue = prepareForEntry(ctrl.$viewValue);
                        ctrl.$render();
                    }
                });


                //------------------------------------------------------------
                //ACCEPT ONLY AVAILABLE KEY'S (NUMBER AND SOME SYMBOL'S)
                var stopPropagation = function()
                {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                };

                elm.bind('keydown', function(event)
                {
                    var keyCode = event.which || event.keyCode;

                    //ENABLE PASTE AND COPY AND CUT
                    // ctrlKey = Ctrl Pressed
                    // metaKey = CMD Pressed (MAC)
                    // V = 86 Keycode
                    // C = 67 Keycode
                    // X = 88 Keycode
                    if ((event.ctrlKey || event.metaKey) &&
                        (keyCode === 86 || keyCode === 67 || keyCode === 88))
                    {
                        return true;
                    }

                    //ENABLE SOME SPECIAL KEYS!!
                    if (!(
                            //TAB
                            (event.keyCode === $mdConstant.KEY_CODE.TAB) ||
                            //DELETE 
                            (event.keyCode === $mdConstant.KEY_CODE.BACKSPACE) ||
                            (event.keyCode === $mdConstant.KEY_CODE.DELETE) ||
                            //RIGHT AND LEFT ARROW
                            (event.keyCode === $mdConstant.KEY_CODE.LEFT_ARROW) ||
                            (event.keyCode === $mdConstant.KEY_CODE.RIGHT_ARROW) ||
                            //COMMA
                            (event.keyCode === $mdConstant.KEY_CODE.COMMA) ||
                            //0-9
                            (event.keyCode >= 48 && event.keyCode <= 57) ||
                            //KEYPAD 0-9
                            (event.keyCode >= 96 && event.keyCode <= 105)))
                    {
                        return stopPropagation();
                    }

                });

                //CHECK SOME VALIDATION
                elm.bind('keypress', function(event)
                {
                    var keyCode = event.which || event.keyCode;
                    var charPressed = String.fromCharCode(keyCode);

                    //Only Allow 1 Decimal Separator in the input
                    if ($locale.NUMBER_FORMATS.DECIMAL_SEP === charPressed)
                    {
                        //IF THE DECIMALS IS 0 , THEN BLOCK THE COMMA :P!!
                        if (configuration.decimals <= 0)
                        {
                            return stopPropagation();
                        }

                        //ONLY 1 DECIMAL SEPARATOR IS ACCEPTED  :P
                        var hasSeparator = ctrl.$viewValue.indexOf(",") > 0;
                        if (hasSeparator)
                        {
                            return stopPropagation();
                        }
                    }
                });

                //------------------------------------------------------------

                //CONVERT TO LOCALE FORMAT NUMBER
                var toHuman = function(value)
                {
                    if (value)
                    {
                        return $filter(filter)(ctrl.$modelValue, configuration.decimals);
                    }
                };

                //CONVERT TO INPUT READY STRING
                var prepareForEntry = function(value)
                {
                    if (value)
                    {
                        var regExp = new RegExp("[" + $locale.NUMBER_FORMATS.GROUP_SEP + "]");
                        value = value.replace(regExp, "");

                        return value;
                    }
                };

                //CONVERT TO NUMBER (FOR MODEL VALUE)
                var toNumber = function(value)
                {
                    if (value)
                    {
                        var regExp = new RegExp("[" + $locale.NUMBER_FORMATS.DECIMAL_SEP + "]");
                        value = parseFloat(value.replace(regExp, "."));

                        return value;
                    }
                };


                ctrl.$validators.validLength = function(modelValue, viewValue)
                {
                    // CHECK THE INTEGER PART!
                    if (configuration.integers > 0 && modelValue)
                    {
                        var parts = (modelValue + "").split(".");

                        if (configuration.integers > 0)
                        {
                            if (parts[0].length > configuration.integers)
                            {
                                ctrl.$viewValue = viewValue;
                                return false;
                            }
                        }
                    }

                    return true;

                };

                //DISABLE FORMAT WHEN USER DISABLE
                if (configuration.format)
                {
                    //PARSE VIEW VALUE WHEN VIEW VALUE CHANGES
                    ctrl.$formatters.push(toHuman);
                }

                //PARSE MODEL VALUE WHEN DOM CHANGES!
                ctrl.$parsers.push(toNumber);

            }
        };
    }]);
;/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')

.directive('ngRange', ['$log', function($log)
{
    return {
        restrict: 'A',
        require: 'ngModel',
        scope:
        {
            ngRangeOptions: '=?'
        },
        link: function(scope, elem, attrs, ctrl)
        {

            //Default Configuration
            var configuration = angular.extend(
            {
                min: 0,
                max: 999999999999
            }, (scope.ngRangeOptions ||
            {}));


            var min = parseInt(configuration.min);
            var max = parseInt(configuration.max);

            ctrl.$validators.range = function(modelValue, viewValue)
            {

                var value = parseInt(viewValue);

                if (ctrl.$isEmpty(modelValue))
                {
                    // consider empty models to be valid
                    return true;
                }

                if (ctrl.$isEmpty(viewValue))
                {
                    //is View Value is empty
                    return false;
                }

                if (!isNaN(min) && !isNaN(max))
                {

                    if (value >= min && value <= max)
                    {
                        return true;
                    }
                    return false;
                }

                if (!isNaN(min))
                {
                    if (value >= min)
                    {
                        // it is valid
                        return true;
                    }
                    return false;
                }

                if (!isNaN(max))
                {
                    if (value <= max)
                    {
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
}]);
;/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')
    .directive('ngRut', ['$filter', function($filter)
    {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elem, attr, ctrl)
            {

                elem.bind('blur', function()
                {
                    var tmp = [];
                    var rutCompleto = ctrl.$modelValue;
                    if (rutCompleto)
                    {
                        if (rutCompleto.indexOf("-") > 0)
                        {
                            tmp = rutCompleto.split('-');
                        }
                        else
                        {
                            //Sin Guion
                            var rut = rutCompleto.replace("-", "");

                            tmp.push(rut.substring(0, rut.length - 1));
                            tmp.push(rut.substring(rut.length - 1));
                        }

                        if (tmp.length === 2)
                        {
                            var filter = "number";
                            ctrl.$viewValue = $filter(filter)(tmp[0]) + "-" + tmp[1];

                        }
                    }
                    ctrl.$render();

                });

                elem.bind('focus', function()
                {
                    if (ctrl.$modelValue)
                    {

                        ctrl.$viewValue = ctrl.$modelValue;
                    }
                    ctrl.$render();
                });

                scope.$watch('ctrl.$modelValue', function()
                {

                    elem.triggerHandler('blur');
                });

                var validaRut = function(rutCompleto)
                {
                    var tmp = [];

                    if (rutCompleto.indexOf("-") > 0)
                    {
                        if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto))
                        {
                            return false;
                        }
                        tmp = rutCompleto.split('-');
                    }
                    else
                    {
                        //Sin Guion
                        var rut = rutCompleto.replace("-", "");

                        tmp.push(rut.substring(0, rut.length - 1));
                        tmp.push(rut.substring(rut.length - 1));

                    }
                    if (tmp.length < 2)
                    {
                        return false;
                    }

                    return (dv(tmp[0]) + "") === (tmp[1].toLowerCase() + "");
                };

                var dv = function(T)
                {
                    var M = 0,
                        S = 1;
                    for (; T; T = Math.floor(T / 10))
                    {
                        S = (S + T % 10 * (9 - M++ % 6)) % 11;
                    }
                    return S ? S - 1 : 'k';
                };

                ctrl.$validators.rut = function(modelValue, viewValue)
                {

                    if (ctrl.$isEmpty(modelValue))
                    {
                        // consider empty models to be valid
                        return true;
                    }

                    if (ctrl.$isEmpty(viewValue))
                    {
                        //is View Value is empty
                        return false;
                    }

                    if (validaRut(viewValue))
                    {
                        // it is valid
                        return true;
                    }

                    // it is invalid
                    return false;
                };

            }
        };
    }]);
;angular.module('gale.filters')
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
}]);;(function()
{
    angular.module('gale.filters')
        .filter('restricted', ['$Api', '$Identity', 'File', function($Api, $Identity, File)
        {
            return function(resource)
            {
                var url = resource;
                if (!url)
                {
                    return null;
                }
                else
                {
                    if ($Identity.isAuthenticated())
                    {
                        url += "?access_token=" + $Identity.getAccessToken();
                    }

                    url = File.getEndpoint() + url;
                }


                return url;
            };
        }])
        .provider('File', function()
        {
            //---------------------------------------------------
            //Configurable Variable on .config Step
            var _endpoint = null;

            this.setEndpoint = function(endpoint)
            {
                _endpoint = endpoint;
            };
            //---------------------------------------------------

            var getEndpoint = function()
            {
                return _endpoint;
            };

            //---------------------------------------------------
            this.$get = ['$log', '$Api', function($log, $Api)
            {
                return {
                    getEndpoint: getEndpoint
                };
            }];

        });

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

.provider('$Api', function()
{

    //---------------------------------------------------
    //Configurable Variable on .config Step
    var _endpoint = null;
    var EVENTS = {
        BEFORE_SEND: 'before-send',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    this.setEndpoint = function(endpoint)
    {
        _endpoint = endpoint;
    };
    //---------------------------------------------------

    //---------------------------------------------------
    this.$get = ['$rootScope', '$http', '$log', 'QueryableBuilder', '$q', function($rootScope, $http, $log, QueryableBuilder, $q)
    {
        var self = this;

        //------------------------------------------------------------------------------
        // EVENT IMPLEMENTATION
        var $$listeners = {};
        self.$on = function(name, listener)
        {

            var namedListeners = $$listeners[name];
            if (!namedListeners)
            {
                $$listeners[name] = namedListeners = [];
            }
            namedListeners.push(listener);

            //de-register Function
            return function()
            {
                namedListeners[indexOf(namedListeners, listener)] = null;
            };
        };

        var fire = function(name, args)
        {
            var listeners = $$listeners[name];
            if (!listeners)
            {
                return;
            }

            angular.forEach(listeners, function(listener)
            {
                listener.apply(listener, args);
            });
        };
        //------------------------------------------------------------------------------

        //------------------------------------------------------------------------------
        self.getEndpoint = function(value)
        {
            if (!_endpoint)
            {
                throw Error("ENDPOINT_NOT_CONFIGURED");
            }
            return _endpoint;
        };
        //------------------------------------------------------------------------------

        //------------------------------------------------------------------------------
        self.parseURI = function(cfg, body)
        {

            //Has Any Replacement Character??
            if (cfg.url.indexOf("{") >= 0)
            {
                //Check Each Parameter for matching in the URI
                var parametersToRemove = [];
                for (var parameter in body)
                {
                    var regex = new RegExp("\{" + parameter + "\}", "g");

                    if (regex.test(cfg.url))
                    {
                        var value = body[parameter];
                        if (typeof value === "undefined")
                        {
                            throw Error("URI_PARAMETER_UNDEFINED: " + parameter);
                        }
                        cfg.url = cfg.url.replace("{" + parameter + "}", value.toString());
                        parametersToRemove.push(parameter);
                    }
                }

                //Remove Each Parameter we use to build the URI
                angular.forEach(parametersToRemove, function(parameter)
                {
                    delete body[parameter];
                });

                //If the method is [POST or PUT], check the coherence with the
                // RESTful restriction:
                //    You can't send more than one parameter in the payload
                //    (Only one entity can pass in the payload accord to the RESTFul Principales)
                if (body && cfg.method === "POST" || cfg.method === "PUT")
                {
                    var keys = Object.keys(body);

                    if (keys.length >= 2)
                    {
                        throw Error("RESTFUL_RESTRICTION: ONLY_ONE_PARAMETER_IS_PERMITTED_IN_PAYLOAD");
                    }

                    if (keys.length === 1)
                    {
                        body = body[keys[0]];
                    }
                }

            }


            //Add Others Params on the URL or in the payload Body
            cfg[(cfg.method === "GET" ? "params" : "data")] = body;

            return cfg;
        };
        //------------------------------------------------------------------------------



        //------------------------------------------------------------------------------
        self.invoke = function(method, url, body, headers)
        {
            var defer = $q.defer();
            var _headers = {
                'Content-Type': 'application/json'
            };

            //Custom Header's??
            if (headers)
            {
                for (var name in headers)
                {
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
            var regex = /(http|https):\/\//;
            if (regex.test(url))
            {
                fullURL = url;
            }

            var cfg = {
                url: fullURL,
                method: method,
                headers: _headers
            };

            self.parseURI(cfg, body);


            $log.debug("[" + method + " " + url + "] parameters: ", body);

            var http = $http(cfg)
                .success(function(data, status, headers, config)
                {
                    defer.resolve(data);
                    //---------------------------------------------------
                    fire(EVENTS.SUCCESS, [data, status, headers]);
                    //---------------------------------------------------
                })
                .error(function(data, status, headers, config)
                {
                    defer.reject(data);

                    //---------------------------------------------------
                    fire(EVENTS.ERROR, [data, status, headers]);
                    //---------------------------------------------------
                });

            //Extend to mantain "compatibility"
            defer.promise.success = http.success;
            defer.promise.error = http.error;
            defer.promise.finally = http.finally;

            return defer.promise;
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.kql = function(url, kql, headers)
        {

            //Has OData Configuration???
            url = QueryableBuilder.build(url, kql);

            //Clean KQL default configuration
            delete kql.select;
            delete kql.filters;
            delete kql.limit;
            delete kql.orderBy;

            return self.invoke('GET', url, kql, headers);
        };
        self.query = self.kql;
        //------------------------------------------------------------------------------

        //------------------------------------------------------------------------------
        //CRUD: CREATE OPERATION
        self.create = function(url, body, headers)
        {
            return self.invoke('POST', url, body, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.read = function(url, parameters, headers)
        {
            return self.invoke('GET', url, parameters, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: UPDATE OPERATION
        self.update = function(url, body, headers)
        {
            return self.invoke('PUT', url, body, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: DELETE OPERATION
        self.delete = function(url, parameters, headers)
        {
            return self.invoke('DELETE', url, parameters, headers);
        };
        //------------------------------------------------------------------------------


        return self;
    }];
    //---------------------------------------------------
});
;angular.module('gale.services')

.factory('QueryableBuilder', function()
{

    var self = this;

    // Define the constructor function.
    self.build = function(endpoint, configuration)
    {

        //Add Endpoint
        var arr = [];
        var builder = [
            endpoint + (endpoint.indexOf("?") >= 0 ? "&" : "?")
        ];


        //SELECT
        if (configuration.select)
        {
            builder.push("$select=");
            //---------------------------------
            arr = [];
            angular.forEach(function(key)
            {
                arr.push(key);
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //FILTER
        if (configuration.filters)
        {
            builder.push("$filter=");
            //---------------------------------
            arr = [];
            angular.forEach(configuration.filters, function(item)
            {
                arr.push(
                    item.property +
                    " " +
                    item.operator +
                    " '" +
                    item.value +
                    "'"
                );
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //LIMIT
        if (configuration.limit)
        {
            builder.push("$limit=");
            builder.push(configuration.limit);
            builder.push("&");
        }

        //LIMIT
        if (configuration.offset)
        {
            builder.push("$offset=");
            builder.push(configuration.offset);
            builder.push("&");
        }


        //ORDER BY
        if (configuration.orderBy)
        {
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
});
;angular.module('gale.services')
    .run(['$Identity', function($Identity) {}])
    //----------------------------------------
    .provider('$Identity', function()
    {
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
        var _whiteListResolver = function()
        {
            return false; //Block All by default
        };
        //
        this.setIssuerEndpoint = function(value)
        {
            _issuerEndpoint = value;
            return $ref;
        };
        this.setLogInRoute = function(value)
        {
            _logInRoute = value;
            return $ref;
        };
        this.enable = function()
        {
            _enable = true;
            return $ref;
        };
        this.setWhiteListResolver = function(value)
        {
            if (typeof value !== "function")
            {
                throw Error("WHITELIST_RESOLVER_FUNCTION_EXPECTED");
            }
            _whiteListResolver = value;
            return $ref;
        };

        function getIssuerEndpoint()
        {
            if (!_issuerEndpoint)
            {
                throw Error("ISSUER_ENDPOINT_NOT_SET");
            }
            return _issuerEndpoint;
        }

        function getLogInRoute()
        {
            if (!_logInRoute)
            {
                throw Error("LOGINURL_NOT_SET");
            }
            return _logInRoute;
        }

        function getAuthorizeResolver()
        {
            return _authorizeResolver;
        }

        this.$get = ['$rootScope', '$Api', '$state', '$LocalStorage', function($rootScope, $Api, $state, $LocalStorage)
        {
            var _token_key = "$_identity";
            var _properties = {};
            var _authResponse = $LocalStorage.getObject(_token_key);
            var self = this;
            //------------------------------------------------------------------------------
            var _login = function(oauthToken)
            {
                $LocalStorage.setObject(_token_key, oauthToken);
                _authResponse = oauthToken;
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, oauthToken);
            };
            var _logout = function(settings)
            {
                $LocalStorage.remove(_token_key);
                _authResponse = null;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);

                if (settings.redirectToLoginPage)
                {
                    $state.go(getLogInRoute());
                }

            };
            var _addProperty = function(name, value)
            {
                _properties[name] = value;
            };
            //------------------------------------------------------------------------------
            self.authenticate = function(credentials)
            {
                return $Api.invoke('POST', getIssuerEndpoint(), credentials)
                    .success(function(data)
                    {
                        self.logIn(data); //Internal Authentication
                    })
                    .error(function()
                    {
                        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                    });
            };
            self.extend = function(name, value)
            {
                if (typeof name === "object")
                {
                    for (var key in name)
                    {
                        _addProperty(key, name[key]);
                    }
                    return;
                }
                _addProperty(name, value);
            };
            self.getAccessToken = function()
            {
                return _authResponse.access_token;
            };
            self.getTokenType = function()
            {
                return _authResponse.token_type;
            };
            self.logIn = function(oauthToken)
            {
                //Check OAuthToken Format
                if (!oauthToken.access_token)
                {
                    throw Error("OAUTHTOKEN_BADFORMAT: access_token (jwt)");
                }

                //NOT ALWAYS REQUIRED ;)!
                /*
                if (!oauthToken.expires_in)
                {
                    throw Error("OAUTHTOKEN_BADFORMAT: expires_in (unixTime)");
                }
                */

                if (!oauthToken.token_type)
                {
                    throw Error("OAUTHTOKEN_BADFORMAT: token_type (string)");
                }

                _login(oauthToken);
            };

            self.logOut = function(settings)
            {
                angular.extend(
                {
                    redirectToLoginPage: true
                }, settings);

                _logout(settings);
            };
            self.getCurrent = function()
            {
                //Get Payload
                var payload = self.getAccessToken().split('.')[1];
                if (atob)
                {
                    data = decodeURIComponent(escape(atob(payload)));
                }
                else
                {
                    throw Error("ATOB_NOT_IMPLEMENTED");
                }
                data = JSON.parse(data);
                //Extend Identity
                data.property = function(name)
                {
                    return _properties[name];
                };
                data.isInRole = function(roleName)
                {
                    return _.contains(data.role, roleName);
                };
                return data;
            };
            self.isAuthenticated = function()
            {
                return _authResponse !== null;
            };
            //------------------------------------------------------------------------------
            //Add Hook if authentication is enabled
            if (_enable)
            {
                //API HOOK
                $Api.$on("before-send", function(headers)
                {
                    //SET AUTHORIZATION HEADER IF USER IS AUTHENTICATED
                    if (self.isAuthenticated())
                    {
                        var jwt = _authResponse;
                        headers.Authorization = jwt.token_type + " " + jwt.access_token;
                    }
                });
                $Api.$on("error", function(data, status)
                {
                    /*
                        401 Unauthorized — The user is not logged in
                        403 Forbidden — The user is logged in but isn’t allowed access
                        419 Authentication Timeout (non standard) — Session has expired
                        440 Login Timeout (Microsoft only) — Session has expired
                    */
                    var _event = null;
                    switch (status)
                    {
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
                    if (_event)
                    {
                        $rootScope.$broadcast(_event, data, status);
                    }
                });
                //EVENT HOOK
                $rootScope.$on('$stateChangeStart', function(event, toState, current)
                {
                    if (!self.isAuthenticated() && toState.name !== getLogInRoute())
                    {
                        //Is in Whitelist??
                        if (!_whiteListResolver(toState, current))
                        {
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