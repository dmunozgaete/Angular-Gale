angular.module('gale.components')

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
        templateUrl: 'bundles/gale/js/components/gale-finder/templates/template.html',
        controller: function($scope, $element, $log , $galeFinder, $window){
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
            
        },

        link: function (scope, element, attrs, ctrl) {

        }
    };
});
