/*------------------------------------------------------
 Company:           Valentys Ltda.
 Author:            David Gaete <dmunozgaete@gmail.com> (https://github.com/dmunozgaete)
 
 Description:       Event Handler Implementation for all Classes which need "Fire Events"
------------------------------------------------------*/
angular.module('gale.classes')

.factory('BaseEventHandler', function()
{

    //Like {eventName: [handlers]}
    var listeners = {};

    //Prototype Function
    var self = {};
    //------------------------------------------------------------------------------
    // EVENT IMPLEMENTATION
    self.$on = function(name, handler)
    {
        var namedListeners = listeners[name];
        if (!namedListeners)
        {
            listeners[name] = namedListeners = [];
        }
        namedListeners.push(handler);

        //Return Destroy Function
        return function()
        {
            var indexOf = namedListeners.indexOf(handler);
            if (indexOf >= 0)
            {
                namedListeners[indexOf] = null;
            }
        };
    };

    self.hasEventHandlersFor = function(name)
    {
        return listeners[name] != null;
    };

    self.$fire = function(name, args)
    {
        if (self.hasEventHandlersFor(name))
        {
            var handlers = listeners[name];
            angular.forEach(handlers, function(handler)
            {
                if (handler)
                {
                    handler.apply(handler, args);
                }
            });
        }
    };

    self.$clear = function(name)
    {
        if (self.hasEventHandlersFor(name))
        {
            delete listeners[name];
        }
    };
    //------------------------------------------------------------------------------

    return self;
});
