/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')

.directive('ngRange', function($log) {
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
});