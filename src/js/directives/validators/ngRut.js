/**
 * Created by Administrador on 26/08/14.
 */
angular.module('gale.directives')
    .directive('ngRut', function($filter)
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
    });
