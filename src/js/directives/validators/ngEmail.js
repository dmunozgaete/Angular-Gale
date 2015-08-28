/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')

.directive('ngEmail', function($log) {
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
});