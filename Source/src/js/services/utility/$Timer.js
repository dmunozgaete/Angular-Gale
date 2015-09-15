angular.module('gale.services')

.factory("$Timer", function( $timeout ) {

    // I provide a simple wrapper around the core $timeout that allows for
    // the timer to be easily reset.
    function Timer( callback, duration, invokeApply ) {

        var self = this;

        // Store properties.
        this._callback = callback;
        this._duration = ( duration || 0 );
        this._invokeApply = ( invokeApply !== false );

        // I hold the $timeout promise. This will only be non-null when the
        // timer is actively counting down to callback invocation.
        this._timer = null;

    }

    // Define the instance methods.
    Timer.prototype = {

        // Set constructor to help with instanceof operations.
        constructor: Timer,


        // I determine if the timer is currently counting down.
        isActive: function() {

            return( !! this._timer );

        },


        // I stop (if it is running) and then start the timer again.
        restart: function() {

            this.stop();
            this.start();

        },

        flush: function(){
            if(this._resolveFunction){
                this._resolveFunction();
            }
        },

        // I start the timer, which will invoke the callback upon timeout.
        start: function() {

            var self = this;

            if(self._timer){
               self.stop();    //Destroy any previously timer;
            }


            // NOTE: Instead of passing the callback directly to the timeout,
            // we're going to wrap it in an anonymous function so we can set
            // the enable flag. We need to do this approach, rather than
            // binding to the .then() event since the .then() will initiate a
            // digest, which the user may not want.
            this._timer = $timeout(
                function handleTimeoutResolve() {
                    try {
                        self._callback.call( null );
                    } finally {
                        self._timer = null;
                    }

                },
                this._duration,
                this._invokeApply
            );

        },


        // I stop the current timer, if it is running, which will prevent the
        // callback from being invoked.
        stop: function() {

            $timeout.cancel( this._timer );

            this._timer = false;

        },


        // I clean up the internal object references to help garbage
        // collection (hopefully).
        destroy: function() {

            this.stop();
            this._callback = null;
            this._duration = null;
            this._invokeApply = null;
            this._timer = null;

        }

    };


    // Create a factory that will call the constructor. This will simplify
    // the calling context.
    function timerFactory( callback, duration, invokeApply ) {

        return( new Timer( callback, duration, invokeApply ) );

    }

    // Store the actual constructor as a factory property so that it is still
    // accessible if anyone wants to use it directly.
    timerFactory.Timer = Timer;


    // Return the factory.
    return( timerFactory );

});