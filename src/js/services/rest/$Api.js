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
    this.$get = function($rootScope, $http, $log, QueryableBuilder, $q)
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
                        if (typeof value === "undefined")
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

                //If the method is [POST or PUT], check the coherence with the
                // RESTful restriction:
                //    You can't send more than one parameter in the payload
                //    (Only one entity can pass in the payload accord to the RESTFul Principales)
                if (body && cfg.method === "POST" || cfg.method === "PUT")
                {
                    var keys = Object.keys(body);

                    if (keys.length >= 2)
                    {
                        throw Error("RESTFUL_RESTRICTION: ONLY_ONE_PARAMETER_IS_PERMITTED_IN_PAYLOAD");
                    }

                    if (keys.length === 1)
                    {
                        body = body[keys[0]];
                    }
                }

            }


            //Add Others Params on the URL or in the payload Body
            cfg[(cfg.method === "GET" ? "params" : "data")] = body;

            return cfg;
        };
        //------------------------------------------------------------------------------



        //------------------------------------------------------------------------------
        self.invoke = function(method, url, body, headers)
        {
            var defer = $q.defer();
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
                    defer.resolve(data);
                    //---------------------------------------------------
                    fire(EVENTS.SUCCESS, [data, status, headers]);
                    //---------------------------------------------------
                })
                .error(function(data, status, headers, config)
                {
                    defer.reject(data);

                    //---------------------------------------------------
                    fire(EVENTS.ERROR, [data, status, headers]);
                    //---------------------------------------------------
                });

            //Extend to mantain "compatibility"
            defer.promise.success = http.success;
            defer.promise.error = http.error;
            defer.promise.finally = http.finally;

            return defer.promise;
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.kql = function(url, kql, headers)
        {

            //Has OData Configuration???
            url = QueryableBuilder.build(url, kql);

            //Clean KQL default configuration
            delete kql.select;
            delete kql.filters;
            delete kql.limit;
            delete kql.orderBy;

            return self.invoke('GET', url, kql, headers);
        };
        self.query = self.kql;
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
        self.read = function(url, parameters, headers)
        {
            return self.invoke('GET', url, parameters, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: UPDATE OPERATION
        self.update = function(url, body, headers)
        {
            return self.invoke('PUT', url, body, headers);
        };
        //------------------------------------------------------------------------------


        //------------------------------------------------------------------------------
        //CRUD: DELETE OPERATION
        self.delete = function(url, parameters, headers)
        {
            return self.invoke('DELETE', url, parameters, headers);
        };
        //------------------------------------------------------------------------------


        return self;
    };
    //---------------------------------------------------
});
