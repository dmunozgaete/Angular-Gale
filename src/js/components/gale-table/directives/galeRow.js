angular.module('gale.components')

.directive('galeRow', function($compile, $interpolate) {
    return {
        restrict: 'E',
        require: '^galeTable',
        controller: function($scope, $element, $attrs, $interpolate, $compile) {
              
        },
		link: function (scope, element, attrs , ctrl) {
            angular.forEach(scope.$$formatters, function(formatter, $index){

                var template = "<gale-cell class='karma-cell'>" + formatter.template + "</gale-cell>";
                var cell = $compile(template)(scope);

                //PROPERTY: WIDTH
                cell.attr("flex", (formatter.width ? formatter.width :""));

                //PROPERTY: WIDTH
                var cls = null;
                switch (formatter.align){
                    case "left":
                        cls = "alignLeft";
                        break;
                    case "right":
                        cls = "alignRight";
                        break;
                    case "center":
                        cls = "alignCenter";
                        break;
                }
                if(cls){
                    cell.addClass(cls);
                }

                //PROPERTY: ROW INDEX
                cell.attr("y", $index);
                
                //PROPERTY: BIND ON CELL CLICK
                cell.bind("click", function(ev){
                    var $cell = angular.element(this);

                    var x = $cell.parent().attr("x");
                    var y = $cell.attr("y");
                 
                    //Cell Click    
                    ctrl.$$cellClick(ev, scope.item, y, x );

                    /*
                    ev.stopPropagation();
                    ev.preventDefault();
                    return false;
                    */
                });
            
                element.append(cell);
            });
		}
    };
});