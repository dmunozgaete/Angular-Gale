angular.module('gale.components')

.directive('galeColumn', function() {
    return {
        restrict: 'E',
        require: '^galeTable',
        scope: {
    		title         : '@',    // Column Title
            property      : '@',    // Property to Bind
            width         : '@',    // Column Width (in %)
            align         : '@'     // Text Align
        },
        transclude: true,   

        controller: function($scope, $element, $attrs) {
           
        },

        link: function (scope, element, attrs, galeTable, $transclude) {
            element.attr("flex", (scope.width ? scope.width :""));
            element.addClass("gale-column");
            
            $transclude( scope, function( fragments ) {
                //--------------------------------------------------------
                //Try to get header element (CUSTOM)
                var header = _.find(fragments,function(elm){
                    return elm.nodeName.toLowerCase() === "gale-header";
                });

                if(!header){
                    header = angular.element("<div>" + (scope.title||"") + "</div>");
                }else{
                    header = angular.element(header);

                    //IF HAS NG-TEMPLATE (FIX BUG TRANSCLUDE)
                    var hscript = header.find("script");
                    if(hscript.length >0 ){
                        header = hscript;
                    }else{
                        var htemplate = header.find("template");
                        if(htemplate.length >0 ){
                            htemplate = htemplate;
                        }
                    }
                }
                
                //PROPERTY: WIDTH
                var cls = null;
                switch (scope.align){
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
                    header.addClass(cls);
                }

                //Append the header 
                element.append( header );    
                //--------------------------------------------------------
                
                //--------------------------------------------------------
                //Try to get item element (CUSTOM)
                var item = _.find(fragments,function(elm){
                    return elm.nodeName.toLowerCase() === "gale-item";
                });

                if(!item){
                    var html = "";
                    if(scope.property){
                        html = "{{item." + scope.property + "}}";
                    }
                    item = angular.element("<div>" + html + "</div>");
                }else{
                    item = angular.element(item);

                    //IF HAS NG-TEMPLATE (FIX BUG TRANSCLUDE)
                    var script = item.find("script");
                    if(script.length >0 ){
                        item = script;
                    }else{
                        var template = item.find("template");
                        if(template.length >0 ){
                            item = template;
                        }
                    }
                    
                }

                //Append the item 
                galeTable.$$formatters.push({
                    property: scope.property,
                    width: scope.width,
                    align: scope.align,
                    template: item.html()
                });
                //--------------------------------------------------------
            });
        }
    };
});