angular.module('gale.filters')	

.filter('template', function ($log,$interpolate) {
	return function (template, context) {

            var exp = $interpolate(template);
            var content = exp(context);
           
           return content;
	};
});