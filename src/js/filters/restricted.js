(function()
{
    angular.module('gale.filters')
        .filter('restricted', function($Api, $Identity, File)
        {
            return function(resource)
            {
                var url = resource;
                if (!url)
                {
                    return null;
                }
                else
                {
                    if ($Identity.isAuthenticated())
                    {
                        url += "?access_token=" + $Identity.getAccessToken();
                    }

                    url = File.getEndpoint() + url;
                }


                return url;
            };
        })
        .provider('File', function()
        {
            //---------------------------------------------------
            //Configurable Variable on .config Step
            var _endpoint = null;

            this.setEndpoint = function(endpoint)
            {
                _endpoint = endpoint;
            };
            //---------------------------------------------------

            var getEndpoint = function()
            {
                return _endpoint;
            };

            //---------------------------------------------------
            this.$get = function($log, $Api)
            {
                return {
                    getEndpoint: getEndpoint
                };
            };

        });

})();
