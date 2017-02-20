angular.module('gale.services.configuration')
    .service('$Localization', function(RESOURCES) {
        function get(name, defaultValue) {
            var v = RESOURCES[name];
            if (typeof v === 'undefined') {
                var ns = name.split(".");
                var value = RESOURCES;
                for (var n in ns) {
                    if (value[ns[n]] !== undefined) {
                        value = value[ns[n]];
                        error = false;
                    } else {
                        error = true;
                    }
                }
                if (!error) {
                    return value;
                } else {
                    if (defaultValue) {
                        return defaultValue;
                    }
                    throw Error(name + " don't exists in resources");
                }
            }
            return RESOURCES[name];
        }

        function exists(name) {
            var v = RESOURCES[name];
            if (typeof v === 'undefined' && name && name.length > 0) {
                var ns = name.split(".");
                var value = RESOURCES;
                for (var n in ns) {
                    if (value[ns[n]] !== undefined) {
                        value = value[ns[n]];
                        error = false;
                    } else {
                        error = true;
                    }
                }
                if (!error) {
                    return true;
                } else {
                    return false;
                }
            }
            return v ? true : false;
        }

        return {
            get: get,
            exists: exists
        };
    });
