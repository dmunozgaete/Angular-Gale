angular.module('gale.components')

.factory('$galeLoading', function($q, $rootScope) {
    var self        = this;
    var _component  = null;

    var _get = function(){
        if(!_component){
            throw { 
                message: 'no gale-loading has found' 
            };
        }
        return _component;
    };

    //Entry Point to register
    self.$$register = function(component, uniqueID){
        _component = component;
    };

    //Entry Point to register
    self.$$unregister = function(component, uniqueID){
        _component = null;
    };

    //Manual Bootstrapp
    self.show = function(message){
        return _get().show(message);
    };

    self.hide = function(){
        return _get().hide();
    };

    return self;
});
