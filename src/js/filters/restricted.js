(function(){

	var resourceUrl = function(resource , $Identity){
		var url = resource;
		if($Identity.isAuthenticated()){
			url += "&access_token=" + $Identity.getAccessToken();
		}

		return url;
	};

	angular.module('gale.filters')

	.filter('restricted', function ($Api, $Identity) {
		return function (resource) {
			return resourceUrl(resource, $Identity);
		};
	});

})();
