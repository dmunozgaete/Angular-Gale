angular.module('gale.services')

.provider('$Api', function() {

    //---------------------------------------------------
    //Configurable Variable on .config Step
    var _endpoint = null;
    var EVENTS = {
        BEFORE_SEND:'before-send',
        SUCCESS:    'success',
        ERROR:      'error'
    };

    this.setEndpoint = function (endpoint) {
        _endpoint = endpoint;
    };
    //---------------------------------------------------

    //---------------------------------------------------
    this.$get = function ($rootScope, $http, $log, KQLBuilder) {
        var self            =   this;
        
        //------------------------------------------------------------------------------
        // EVENT IMPLEMENTATION
        var $$listeners     =   {};   
        self.$on = function(name, listener){

            var namedListeners = $$listeners[name];
            if (!namedListeners) {
              $$listeners[name] = namedListeners = [];
            }
            namedListeners.push(listener);

            //de-register Function
            return function() {
              namedListeners[indexOf(namedListeners, listener)] = null;
            };
        };

        var fire = function(name, args){
            var listeners = $$listeners[name];
            if(!listeners){
                return;
            }
            
            angular.forEach(listeners, function(listener){
                listener.apply(listener, args);
            });
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        self.getEndpoint = function(value){
            if(!_endpoint){
                throw Error("ENDPOINT_NOT_CONFIGURED");
            }
            return _endpoint;
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        self.invoke = function(method, url, body, headers) {

            var _headers = {
                'Content-Type': 'application/json'
            };

            //Custom Header's??
            if(headers){
                for(var name in headers){
                    _headers[name] = headers[name];
                }
            }
            
            //---------------------------------------------------
            // CALL LISTENER'S
            fire(EVENTS.BEFORE_SEND, [_headers, url, body]);
            //---------------------------------------------------

            var cfg = {
                url: self.getEndpoint() + url,
                method: method,
                headers: _headers
            };
            
            cfg[(method === "GET" ? "params": "data")] = body;

            $log.debug("["+method+" " + url + "] parameters: " , body);

            var http = $http(cfg)
            .success(function (data, status, headers, config) {
                //---------------------------------------------------
                fire(EVENTS.SUCCESS, [data, status, headers]);
                //---------------------------------------------------
            })
            .error(function (data, status, headers, config) {
                
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
        self.create= function(url, body, headers){
            return self.invoke('POST', url, body, headers);
        };
        //------------------------------------------------------------------------------
        
        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.kql= function(url, kql, headers){
            
            //Has OData Configuration???
            url = KQLBuilder.build(url, kql);   
            
            return self.invoke('GET', url, {}, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: GET OPERATION
        self.read= function(url, parameters, headers){
    
            return self.invoke('GET', url, parameters, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: UPDATE OPERATION
        self.update= function(url, id, body, headers){
            url += "/{0}".format([id]); //PUT url/id

            return self.invoke('PUT', url, body, headers);
        };
        //------------------------------------------------------------------------------
        

        //------------------------------------------------------------------------------
        //CRUD: DELETE OPERATION
        self.delete= function(url, id, headers){

            url += "/{0}".format([id]); //DELETE url/id

            return self.invoke('DELETE', url, {}, headers);
        };
        //------------------------------------------------------------------------------


        return self;
    };
    //---------------------------------------------------
});