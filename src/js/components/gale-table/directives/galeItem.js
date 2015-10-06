angular.module('gale.components')

.directive('item', function() {
    return {
        restrict: 'E',
        require: '^galeTable',
        compile: function (element, attrs, $transclude) {
        },
        controller: function($scope, $element, $attrs, $interpolate, $compile) {
        }
    };
});