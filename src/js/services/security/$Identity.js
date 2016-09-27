angular.module('gale.services')
    .run(function($Identity) {})
    //----------------------------------------
    .provider('$Identity', function() {
        var $ref = this;
        var AUTH_EVENTS = {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        };
        var FLOW_TYPES = {
            oauth2: 'oauth2',
            basic: 'basic',
            custom: 'custom'
        };

        //Configurable Variable on .config Step
        var _issuerEndpoint = null;
        var _logInRoute = null;
        var _enable = false;
        var _redirectToLoginOnLogout = true;
        var _authenticationFlow = FLOW_TYPES.custom;

        var _whiteListResolver = function() {
            return false; //Block All by default
        };
        //
        this.setIssuerEndpoint = function(value) {
            _issuerEndpoint = value;
            return $ref;
        };
        this.setLogInRoute = function(value) {
            _logInRoute = value;
            return $ref;
        };
        this.setAuthenticationFlow = function(value) {
            _authenticationFlow = (value || "").toLowerCase();
            return $ref;
        };
        this.redirectToLoginOnLogout = function(value) {
            _redirectToLoginOnLogout = value;
            return $ref;
        };
        this.enable = function() {
            _enable = true;
            return $ref;
        };
        this.setWhiteListResolver = function(value) {
            if (typeof value !== "function") {
                throw Error("WHITELIST_RESOLVER_FUNCTION_EXPECTED");
            }
            _whiteListResolver = value;
            return $ref;
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

        this.$get = function($rootScope, $Api, $state, $LocalStorage, $q) {
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
            var _logout = function(settings) {
                $LocalStorage.remove(_token_key);
                _authResponse = null;
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);

                //Redirect to login Page when Logout??
                if (_enable && _redirectToLoginOnLogout) {
                    $state.go(getLogInRoute());
                }

            };
            var _addProperty = function(name, value) {
                _properties[name] = value;
            };
            //------------------------------------------------------------------------------
            self.authenticate = function(parameters, authenticationFlow) {
                //overrides??
                var _flowType = authenticationFlow || _authenticationFlow;
                var defer = $q.defer();

                switch (_flowType) {
                    case FLOW_TYPES.custom:
                        $Api.invoke('POST', getIssuerEndpoint(), parameters)
                            .success(function(data) {
                                self.logIn(data); //Internal Authentication
                                defer.resolve(data);
                            })
                            .error(function(ex) {
                                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                                defer.reject(ex);
                            });
                        break;
                    case FLOW_TYPES.basic:
                        //According to the RFC 6749
                        //  https://tools.ietf.org/html/rfc6749#section-4.4
                        var grant_type = (parameters.grant_type || "password");
                        var body = {
                            grant_type: grant_type
                        };

                        //base64(username:password)
                        var base64String = btoa("{0}:{1}".format([
                            parameters.username,
                            parameters.password
                        ]));

                        var headers = {
                            "Content-Type": "application/x-www-form-urlencoded",
                            "Authorization": "Basic " + base64String
                        };

                        $Api.invoke('POST', getIssuerEndpoint(), body, headers)
                            .success(function(data) {
                                self.logIn(data); //Internal Authentication
                                defer.resolve(data);
                            })
                            .error(function(ex) {
                                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                                defer.reject(ex);
                            });
                        break;
                    default:
                        throw Error("NotImplementedFlowException");
                }

                return defer.promise;
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
            self.getTokenType = function() {
                return _authResponse.token_type;
            };
            self.logIn = function(oauthToken) {
                //Check OAuthToken Format
                if (!oauthToken.access_token) {
                    throw Error("JWT_TOKEN_BADFORMAT: access_token (jwt)");
                }

                if (!oauthToken.token_type) {
                    throw Error("JWT_TOKEN_BADFORMAT: token_type (string)");
                }

                return _login(oauthToken);
            };

            self.logOut = function() {
                return _logout();
            };

            self.getCurrent = function() {
                var data = null;

                //Get Payload
                var payload = self.getAccessToken().split('.')[1];
                if (atob) {
                    data = decodeURIComponent(escape(atob(payload)));
                } else {
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
                    // IF CUSTOM HEADER IS SENDED, CHECK IF AUTH WAS NOT OVERRIDE
                    if (self.isAuthenticated() && !headers.Authorization) {
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
                    if (_enable) {
                        if (!self.isAuthenticated() && toState.name !== getLogInRoute()) {
                            //Is in Whitelist??
                            if (!_whiteListResolver(toState, current)) {
                                //Authentication is Required
                                $state.go(getLogInRoute());
                                event.preventDefault();
                            }
                        }
                    }
                });
            }
            //------------------------------------------------------------------------------
            //Call Authentication Method to Adapt all services wich need Authorization
            return self;
        };
    });
