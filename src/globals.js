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
            angular.module(name, dependencies || []);
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
        if(route.indexOf(parameter_separator)>=0){
            viewPath = viewPath.substring(0, viewPath.indexOf(parameter_separator)) + ".html";
            route = route.substring(0, route.indexOf(parameter_separator));
        }


        var config = null;
        if(layout === ""){   
            //Config Without Layout Base Content
            config = {
                url: url,
                templateUrl: viewPath,
                controller: controller
            };
        }else{
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
            }
            catch (e) {
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
        var $injector = angular.injector(['ng','config']);
        var INITIAL_CONFIGURATION = $injector.get('GLOBAL_CONFIGURATION');
        var $http = $injector.get('$http');
        var logger= getLogger();
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
                        angular.module(application_bundle).config(function($stateProvider) {
                            angular.forEach(registered_routes, function(route) {
                                //Register a 'angular like' route
                                logger.debug("route:", route);
                                $stateProvider
                                    .state(route.route, route.config);
                            });
                            registered_routes = [];
                        });
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
