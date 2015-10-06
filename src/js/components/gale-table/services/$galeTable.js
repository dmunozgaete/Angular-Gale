angular.module('gale.components')

.factory('$galeTable', function($q, $rootScope) {
    var self        = this;
    var components  = {};
    var callbacks   = [];
    
    //Entry Point to register
    var $$register = function(component, uniqueID){
        components[uniqueID] = component;
        
        //Call all then function registered
        angular.forEach(callbacks, function(callback){
            callback(component, uniqueID);
        });
    };

    //Entry Point to register
    var $$unregister = function(uniqueID){
        delete components[uniqueID];
        callbacks = [];
    };

    var _getByHandle = function(uniqueID){
        var identifier =  uniqueID;

        if(!identifier){
            var count = Object.keys(components).length;
            if(count === 0){
                throw { 
                    message: 'no galeTable has instantied in the view' 
                };
            }

            if(count > 1){
                throw { 
                    message: 'when you have more than 1 galetable in view, you must send the uniqueID' 
                };
            }else{
                identifier = (function() { 
                    for (var id in components){
                        return id;
                    }
                })();
                    
            }
        }

        var component = components[identifier];
        if(!component){
            throw { 
                message: 'no galeTable has found with id {0}'.format([identifier]) 
            };
        }
        return component;
    };

    //Get Registered Component's
    self.getRegisteredTables = function(){
        return components;
    };

    //Call to directive endpoint
    self.endpoint = function(value, uniqueID){
        return _getByHandle(uniqueID).endpoint(value);
    };

    //Manual Bootstrapp
    self.setup = function(endpoint, cfg, uniqueID){
        return _getByHandle(uniqueID).setup(endpoint, cfg);
    };

    self.$on = function(eventName, callback, uniqueID){
        var component = _getByHandle(uniqueID);
        component.$on(eventName, callback);   //
    };

    self.then = function(callback){
        callbacks.push(callback);
    };

    self.$$register = $$register;
    self.$$unregister = $$unregister;

    return self;
});
