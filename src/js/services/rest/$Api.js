angular.module('gale.services')

.provider('$Api', function()
{

    //---------------------------------------------------
    //Configurable Variable on .config Step
    var _endpoint = null;
    var EVENTS = {
        BEFORE_SEND: 'before-send',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    this.setEndpoint = function(endpoint)
    {
        _endpoint = endpoint;
    };
    //---------------------------------------------------

    //---------------------------------------------------
    this.$get = function($rootScope, $http, $log, KQLBuilder)
    {
        var self = this;

        //------------------------------------------------------------------------------
        // EVENT IMPLEMENTATION
        var $$listeners = {};
        self.$on = function(name, listener)
        {

            var namedListeners = $$listeners[name];
            if (!namedListeners)
            {
                $$listeners[name] = namedListeners = [];
            }
            namedListeners.push(listener);

            //de-register Function
            return function()
            {
                namedListeners[indexOf(namedListeners, listener)] = null;
            };
        };

        var fire = function(name, args)
        {
            var listeners = $$listeners[name];
            if (!listeners)
            {
                return;
            }

            angular.forEach(listeners, function(listener)
            {
                listener.apply(listener, args);
            });
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        self.getEndpoint = function(value)
        {
            if (!_endpoint)
            {
                throw Error("ENDPOINT_NOT_CONFIGURED");
            }
            return _endpoint;
        };
        //------------------------------------------------------------------------------

        //------------------------------------------------------------------------------
        self.parseURI = function(cfg, body)
        {

            //Has Any Replacement Character??
            if (cfg.url.indexOf("{") >= 0)
            {
                //Check Each Parameter for matching in the URI
                var parametersToRemove = [];
                for (var parameter in body)
                {
                    var regex = new RegExp("\{" + parameter + "\}", "g");

                    if (regex.test(cfg.url))
                    {
                        var value = body[parameter];
                        if (!value)
                        {
                            throw Error("URI_PARAMETER_UNDEFINED: " + parameter);
                        }
                        cfg.url = cfg.url.replace("{" + parameter + "}", value.toString());
                        parametersToRemove.push(parameter);
                    }
                }

                //Remove Each Parameter we use to build the URI
                angular.forEach(parametersToRemove, function(parameter)
                {
                    delete body[parameter];
                });

                //Add Others Params on the URL or in the payload Body
                cfg[(cfg.method === "GET" ? "params" : "data")] = body;
            }

            return cfg;
        };
        //------------------------------------------------------------------------------



        //------------------------------------------------------------------------------
        self.invoke = function(method, url, body, headers)
        {

            var _headers = {
                'Content-Type': 'application/json'
            };

            //Custom Header's??
            if (headers)
            {
                for (var name in headers)
                {
                    _headers[name] = headers[name];
                }
            }

            //---------------------------------------------------
            // CALL LISTENER'S
            fire(EVENTS.BEFORE_SEND, [_headers, url, body]);
            //---------------------------------------------------

            //Supposing is a Fragment and need to use the API
            var fullURL = self.getEndpoint() + url;

            //Url is a valid URL ??
            var regex = /(http|https):\/\//;
            if (regex.test(url))
            {
                fullURL = url;
            }

            var cfg = {
                url: fullURL,
                method: method,
                headers: _headers
            };

            self.parseURI(cfg, body);


            $log.debug("[" + method + " " + url + "] parameters: ", body);

            var http = $http(cfg)
                .success(function(data, status, headers, config)
                {
                    //---------------------------------------------------
                    fire(EVENTS.SUCCESS, [data, status, headers]);
                    //---------------------------------------------------
                })
                .error(function(data, status, headers, config)
                {

                    //---------------------------------------------------
                    fire(EVENTS.ERROR, [data, status, headers]);
                    //---------------------------------------------------

                    //$log.error(data, status, headers, config);
                });

            return http;
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: CREATE OPERATION
        self.create = function(url, body, headers)
        {
            return self.invoke('POST', url, body, headers);
        };
        //------------------------------------------------------------------------------

        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.kql = function(url, kql, headers)
        {

            //Has OData Configuration???
            url = KQLBuilder.build(url, kql);

            return self.invoke('GET', url,
            {}, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.read = function(url, parameters, headers)
        {

            return self.invoke('GET', url, parameters, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: UPDATE OPERATION
        self.update = function(url, id, body, headers)
        {
            url += "/{0}".format([id]); //PUT url/id

            return self.invoke('PUT', url, body, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: DELETE OPERATION
        self.delete = function(url, id, headers)
        {

            url += "/{0}".format([id]); //DELETE url/id

            return self.invoke('DELETE', url,
            {}, headers);
        };
        //------------------------------------------------------------------------------


        return self;
    };
    //---------------------------------------------------
});
