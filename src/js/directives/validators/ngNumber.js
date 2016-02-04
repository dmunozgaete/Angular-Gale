angular.module('gale.directives')
    .directive('ngNumber', function($filter, $locale, $mdConstant)
    {
        return {
            require: 'ngModel',
            restrict: 'A',
            scope:
            {
                ngNumberOptions: '=?'
            },
            link: function(scope, elm, attrs, ctrl)
            {
                //Default Configuration
                var configuration = angular.extend(
                {
                    decimals: 0,
                    integers: 9,
                    format: true,
                }, (scope.ngNumberOptions ||
                {}));

                var filter = "number";
                var isReadonly = attrs.readonly;

                //WHEN USER LEAVES, FORMAT TO HUMAN READ
                elm.bind('blur', function(event)
                {
                    if (configuration.format)
                    {
                        //CHANGE TO HUMAN EASY READ
                        ctrl.$viewValue = toHuman(ctrl.$modelValue);
                        ctrl.$render();
                    }
                });

                //WHEN USER ACTIVATE THE INPUT, FORMAT FOR ENTRY DATA
                elm.bind('focus', function(event)
                {
                    if (!isReadonly)
                    {
                        //CHANGE FOR READY TO INPUT DATA
                        ctrl.$viewValue = prepareForEntry(ctrl.$viewValue);
                        ctrl.$render();
                    }
                });


                //------------------------------------------------------------
                //ACCEPT ONLY AVAILABLE KEY'S (NUMBER AND SOME SYMBOL'S)
                var stopPropagation = function()
                {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                };

                elm.bind('keydown', function(event)
                {
                    var keyCode = event.which || event.keyCode;

                    //ENABLE PASTE AND COPY AND CUT
                    // ctrlKey = Ctrl Pressed
                    // metaKey = CMD Pressed (MAC)
                    // V = 86 Keycode
                    // C = 67 Keycode
                    // X = 88 Keycode
                    if ((event.ctrlKey || event.metaKey) &&
                        (keyCode === 86 || keyCode === 67 || keyCode === 88))
                    {
                        return true;
                    }

                    //ENABLE SOME SPECIAL KEYS!!
                    if (!(
                            //TAB
                            (event.keyCode === $mdConstant.KEY_CODE.TAB) ||
                            //DELETE 
                            (event.keyCode === $mdConstant.KEY_CODE.BACKSPACE) ||
                            (event.keyCode === $mdConstant.KEY_CODE.DELETE) ||
                            //RIGHT AND LEFT ARROW
                            (event.keyCode === $mdConstant.KEY_CODE.LEFT_ARROW) ||
                            (event.keyCode === $mdConstant.KEY_CODE.RIGHT_ARROW) ||
                            //COMMA
                            (event.keyCode === $mdConstant.KEY_CODE.COMMA) ||
                            //0-9
                            (event.keyCode >= 48 && event.keyCode <= 57) ||
                            //KEYPAD 0-9
                            (event.keyCode >= 96 && event.keyCode <= 105)))
                    {
                        return stopPropagation();
                    }

                });

                //CHECK SOME VALIDATION
                elm.bind('keypress', function(event)
                {
                    var keyCode = event.which || event.keyCode;
                    var charPressed = String.fromCharCode(keyCode);

                    //Only Allow 1 Decimal Separator in the input
                    if ($locale.NUMBER_FORMATS.DECIMAL_SEP === charPressed)
                    {
                        //IF THE DECIMALS IS 0 , THEN BLOCK THE COMMA :P!!
                        if (configuration.decimals <= 0)
                        {
                            return stopPropagation();
                        }

                        //ONLY 1 DECIMAL SEPARATOR IS ACCEPTED  :P
                        var hasSeparator = ctrl.$viewValue.indexOf(",") > 0;
                        if (hasSeparator)
                        {
                            return stopPropagation();
                        }
                    }
                });

                //------------------------------------------------------------

                //CONVERT TO LOCALE FORMAT NUMBER
                var toHuman = function(value)
                {
                    if (value)
                    {
                        return $filter(filter)(ctrl.$modelValue, configuration.decimals);
                    }
                };

                //CONVERT TO INPUT READY STRING
                var prepareForEntry = function(value)
                {
                    if (value)
                    {
                        var regExp = new RegExp("[" + $locale.NUMBER_FORMATS.GROUP_SEP + "]");
                        value = value.replace(regExp, "");

                        return value;
                    }
                };

                //CONVERT TO NUMBER (FOR MODEL VALUE)
                var toNumber = function(value)
                {
                    if (value)
                    {
                        var regExp = new RegExp("[" + $locale.NUMBER_FORMATS.DECIMAL_SEP + "]");
                        value = parseFloat(value.replace(regExp, "."));

                        return value;
                    }
                };


                ctrl.$validators.validLength = function(modelValue, viewValue)
                {
                    // CHECK THE INTEGER PART!
                    if (configuration.integers > 0 && modelValue)
                    {
                        var parts = (modelValue + "").split(".");

                        if (configuration.integers > 0)
                        {
                            if (parts[0].length > configuration.integers)
                            {
                                ctrl.$viewValue = viewValue;
                                return false;
                            }
                        }
                    }

                    return true;

                };

                //DISABLE FORMAT WHEN USER DISABLE
                if (configuration.format)
                {
                    //PARSE VIEW VALUE WHEN VIEW VALUE CHANGES
                    ctrl.$formatters.push(toHuman);
                }

                //PARSE MODEL VALUE WHEN DOM CHANGES!
                ctrl.$parsers.push(toNumber);

            }
        };
    });
