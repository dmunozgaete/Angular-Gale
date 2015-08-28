angular.module('gale.services.configuration')

.service('$Configuration', function ($rootScope, $LocalStorage, CONFIGURATION) {
    var _values             = {};

    //LOAD THE INITIAL CONFIGURATION
    for(var env_name in CONFIGURATION){
        set(env_name, CONFIGURATION[env_name]);
    }
    
    function get(name, defaultValue){
        var v = _values[name]; 
        if(typeof v === undefined){
            if(defaultValue){
                return defaultValue;
            }
            throw Error(name + " don't exists in configuration");
        }
        return _values[name];
    }

    function exists(name){
        return _values[name] != null;
    }

    function set(name, value){
        _values[name] = value;
    }

    return {
        get: get,
        exists: exists
    };
});