angular.module('gale.components')

.directive('galeLoading', function() {
    return {
        restrict: 'E',
        scope: {
            defaultMessage:     '@'     //Default Message
        },
        templateUrl: 'gale-loading/directives/galeLoading.tpl.html',
        controller: function($scope, $element, $log , $galeLoading){
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
        },

        link: function (scope, element, attrs, ctrl) {
            
            element.addClass("layout-row");
            element.addClass("layout-align-center-center");


        }
    };
});
