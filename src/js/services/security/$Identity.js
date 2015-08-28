(function() {
    angular.module('gale.services')
        .run(function($Identity) {})
        //----------------------------------------
        .provider('$Identity', function() {
            var $this = this;
            var AUTH_EVENTS = {
                loginSuccess: 'auth-login-success',
                loginFailed: 'auth-login-failed',
                logoutSuccess: 'auth-logout-success',
                sessionTimeout: 'auth-session-timeout',
                notAuthenticated: 'auth-not-authenticated',
                notAuthorized: 'auth-not-authorized'
            };
            //Configurable Variable on .config Step
            var _issuerEndpoint = null;
            var _logInRoute = null;
            var _enable = false;
            var _whiteListResolver = function() {
                return true;
            };
            //
            $this.setIssuerEndpoint = function(value) {
                _issuerEndpoint = value;
                return $this;
            };
            $this.setLogInRoute = function(value) {
                _logInRoute = value;
                return $this;
            };
            $this.enable = function() {
                _enable = true;
                return $this;
            };
            $this.setWhiteListResolver = function(value) {
                if (typeof value !== "function") {
                    throw Error("WHITELIST_RESOLVER_FUNCTION_EXPECTED");
                }
                _whiteListResolver = value;
                return $this;
            };

            function getIssuerEndpoint() {
                if (!_issuerEndpoint) {
                    throw Error("ISSUER_ENDPOINT_NOT_SET");
                }
                return _issuerEndpoint;
            }

            function getLogInRoute() {
                if (!_logInRoute) {
                    throw Error("LOGINURL_NOT_SET");
                }
                return _logInRoute;
            }

            function getAuthorizeResolver() {
                return _authorizeResolver;
            }
            $this.$get = function($rootScope, $Api, $state, $LocalStorage, $location, $templateCache) {
                var _token_key = "$_identity";
                var _properties = {};
                var _authResponse = $LocalStorage.getObject(_token_key);
                var self = this;
                //------------------------------------------------------------------------------
                var _login = function(oauthToken) {
                    $LocalStorage.setObject(_token_key, oauthToken);
                    _authResponse = oauthToken;
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, oauthToken);
                };
                var _logout = function() {
                    $LocalStorage.remove(_token_key);
                    _authResponse = null;
                    $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                    $state.go(getLogInRoute());
                };
                var _addProperty = function(name, value) {
                    _properties[name] = value;
                };
                //------------------------------------------------------------------------------
                self.authenticate = function(credentials) {
                    return $Api.invoke('POST', getIssuerEndpoint(), credentials)
                        .success(function(data) {
                            _login(data); //Internal Authentication
                        })
                        .error(function() {
                            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                        });
                };
                self.extend = function(name, value) {
                    if (typeof name === "object") {
                        for (var key in name) {
                            _addProperty(key, name[key]);
                        }
                        return;
                    }
                    _addProperty(name, value);
                };
                self.getAccessToken = function() {
                    return _authResponse.access_token;
                };
                self.logOut = function() {
                    _logout();
                };
                self.getCurrent = function() {
                    //Get Payload
                    var payload = self.getAccessToken().split('.')[1];
                    if (atob) {
                        data = decodeURIComponent(escape(atob(payload)));
                    }
                    else {
                        throw Error("ATOB_NOT_IMPLEMENTED");
                    }
                    data = JSON.parse(data);
                    //Extend Identity
                    data.property = function(name) {
                        return _properties[name];
                    };
                    data.isInRole = function(roleName) {
                        return _.contains(data.role, roleName);
                    };
                    return data;
                };
                self.isAuthenticated = function() {
                    return _authResponse !== null;
                };
                //------------------------------------------------------------------------------
                //Add Hook if authentication is enabled
                if (_enable) {
                    //API HOOK
                    $Api.$on("before-send", function(headers) {
                        //SET AUTHORIZATION HEADER IF USER IS AUTHENTICATED
                        if (self.isAuthenticated()) {
                            var jwt = _authResponse;
                            headers.Authorization = jwt.token_type + " " + jwt.access_token;
                        }
                    });
                    $Api.$on("error", function(data, status) {
                        /*
                            401 Unauthorized — The user is not logged in
                            403 Forbidden — The user is logged in but isn’t allowed access
                            419 Authentication Timeout (non standard) — Session has expired
                            440 Login Timeout (Microsoft only) — Session has expired
                        */
                        var _event = null;
                        switch (status) {
                            case 401:
                                _logout();
                                return; //Custom Action
                            case 403:
                                _event = AUTH_EVENTS.notAuthorized;
                                break;
                            case 419:
                            case 440:
                                _event = AUTH_EVENTS.sessionTimeout;
                                break;
                        }
                        if (_event) {
                            $rootScope.$broadcast(_event, data, status);
                        }
                    });
                    //EVENT HOOK
                    $rootScope.$on('$stateChangeStart', function(event, toState, current) {
                        if (!self.isAuthenticated() && toState.name !== getLogInRoute()) {
                            //Is in Whitelist??
                            if (!_whiteListResolver(toState, current)) {
                                //Authentication is Required
                                $state.go(getLogInRoute());
                                event.preventDefault();
                            }
                        }
                    });
                }
                //------------------------------------------------------------------------------
                //Call Authentication Method to Adapt all services wich need Authorization
                return self;
            };
        });
})();
