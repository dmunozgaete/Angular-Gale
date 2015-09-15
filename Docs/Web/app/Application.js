angular.module('App', [
        , 'gale'                        //ANGULAR GALE LIBRARY
        , 'app'                         //CUSTOM PROJECT LIBRARY
        , 'material-icons'              //CUSTOM PROJECT LIBRARY
        , 'hljs'                        //HIGHLIGHT
        , 'mocks'                       //DEMO MOCK'S
        , 'angular-google-analytics'    //ANGULAR GOOGLE ANALITYCS
    ])
    .run(function($location, $Configuration, $log, Analytics) {
        var application = $Configuration.get("application");
        $log.info("application start... ;)!", {
            env: application.environment,
            version: application.version
        });
        $location.url(application.home);
    
    })
    .config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue')
            .accentPalette('orange')
            .warnPalette('red');
    })
    // Set GOOGLE analytics account
    .config(function(AnalyticsProvider, CONFIGURATION) {
        AnalyticsProvider.setAccount(CONFIGURATION.google.analytics);
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');
        //AnalyticsProvider.setDomainName('none'); FOR TESTING IN LOCALHOST
    })

    //API EndPoint Configuration
    .config(function($ApiProvider, CONFIGURATION) {
        $ApiProvider.setEndpoint(CONFIGURATION.endpoint);
    })
    
    .config(function($stateProvider, $urlRouterProvider, CONFIGURATION) {
        $stateProvider
            .state('app', {
                url: "/demo",
                abstract: true,
                // ---------------------------------------------
                // TWO COLUMNS TEMPLATE
                // ---------------------------------------------
                templateUrl: "views/layouts/2-columns.html",
                controller: "2ColumnsController"
            })
            .state('exception', {
                url: "/exception",
                abstract: true,
                // ---------------------------------------------
                // EXCEPTION TEMPLATE
                // ---------------------------------------------
                templateUrl: "views/layouts/exception.html",
                controller: "ExceptionController"
            })

            // ---------------------------------------------
            // GENERALES
            // ---------------------------------------------
            .state('exception.404', {
                url: '/404',
                views: {
                    content: {
                        templateUrl: 'views/error/404.html',
                    }
                }
            });

            // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise("/exception/404");

        // ---------------------------------------------
        // GALE: Menu State's
        // ---------------------------------------------
        (function iterate(items, ref){
            angular.forEach(items, function(item) {
                
                var data = angular.copy(ref);
                if(item.label  !== ""){
                data.paths.push(item.name);
                data.labels.push(item.label||item.name);
                }

                if(!item.items){
                    var path = data.paths.join("-");
                    var url = "/" + data.paths.join("/");

                    //attach _$variable to menu item
                    item.$path = path;
                    item.$title = data.labels.join(" > ");

                    //Add Dynamic State
                    $stateProvider.state('app.{0}'.format([path]), {
                        url: url,
                        views: {
                            content: {
                                templateUrl: 'views{0}.html'.format([url]),
                            }
                        }
                    });

                    return;
                }

                iterate(item.items, data);
            });  
        })(
            CONFIGURATION.menu,
            { paths: [], labels: [] }
        );
    });
