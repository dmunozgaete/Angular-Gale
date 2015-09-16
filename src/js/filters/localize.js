angular.module('gale.filters')	

.filter('localize', function ($Localization, $log, $interpolate) {
	return function (text, parameters) {

		try {

			var template = $Localization.get(text);

			if(parameters){
				var exp = $interpolate(template);
	            template = exp({
	            	parameters: parameters
	            });
	        }

            return template;

		}catch(e){
			return text;
		}
	};
});