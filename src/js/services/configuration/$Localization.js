angular.module('gale.services.configuration')
.service('$Localization', function(RESOURCES) {
    function get(name, defaultValue) {
        var v = RESOURCES[name];
        if (typeof v === 'undefined') {
            ns = name.split(".");
            index = RESOURCES;
            for (var n in ns) {
                if (index[ns[n]] !== undefined) {
                    index = index[ns[n]];
                    error = false;
                }
                else {
                    error = true;
                }
            }
            if (!error) {
                return index;
            }
            else {
                if (defaultValue) {
                    return defaultValue;
                }
                throw Error(name + " don't exists in resources");
            }
        }
        return RESOURCES[name];
    }

    function exists(name) {
        return RESOURCES[name] != null;
    }

    return {
        get: get,
        exists: exists
    };
});
