angular.module('gale.components')

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
        templateUrl: 'bundles/gale/js/components/gale-table/templates/template.html',
        controller: function($scope, $element, $interpolate, $compile, $Api, $galeTable, KQLBuilder){
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
            }
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

        },

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
});