angular.module('gale.components')

.directive('galeCenter', function() {
    return {
        restrict: 'E',
        require: '^galeLoading',
        scope: {
        },
        controller: function($scope, $element, $log ){
           
        },

        link: function (scope, element, attrs, ctrl) {
            element.attr("layout", "row");
            element.attr("layout-align", "start center");
        }
    };
});
