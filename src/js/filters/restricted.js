(function(){

	var resourceUrl = function(resourceUrl , Identity){
		if(Identity.isAuthenticated()){
			resourceUrl += "&access_token=" + Identity.token().access_token;
		}

		return resourceUrl;
	};

	angular.module('gale.filters')

	.filter('restricted', function ($Api, Identity) {
		return function (resourceUrl) {
			return resourceUrl(resourceUrl, Identity);
		};
	});

})();
