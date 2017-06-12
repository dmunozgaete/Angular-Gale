angular.module('gale.directives')

.directive('selectTextOnClick', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.on('click', function() {
                if (this.tagName === "INPUT" || this.tagName === "TEXTAREA") {
                    this.select();
                } else {
                    if (document.selection) {
                        var range1 = document.body.createTextRange();
                        range1.moveToElementText(this);
                        range1.select();
                    } else if (window.getSelection) {
                        var range = document.createRange();
                        range.selectNode(this);
                        window.getSelection().removeAllRanges();
                        window.getSelection().addRange(range);
                    }
                }
            });
        }
    };
});
