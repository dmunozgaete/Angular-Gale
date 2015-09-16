angular.module('gale.services')

.factory('KQLBuilder', function() {

	var self = this;

	// Define the constructor function.
    self.build = function(endpoint , configuration) {

    	//Add Endpoint
        var arr = [];
        var builder = [
        	endpoint + "?"
        ];


        //SELECT
        if(configuration.select){
    		builder.push("$select=");
    		//---------------------------------
    		arr = [];
    		angular.forEach(function(key){
    			arr.push(key);
    		});
			//---------------------------------
    		builder.push(arr.join(","));
    		builder.push("&");
        }

        //FILTER
        if(configuration.filters){
            builder.push("$filter=");
            //---------------------------------
            arr = [];
            angular.forEach(configuration.filters, function(item){
                arr.push(
                    item.property +
                    " " +
                    item.operator +
                    " '" +
                    item.value  +
                    "'"
                );
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //LIMIT
        if(configuration.limit){
            builder.push("$limit=");
            builder.push(configuration.limit);
            builder.push("&");
        }


        //ORDER BY
        if(configuration.orderBy){
            builder.push("$orderBy=");
            builder.push(configuration.orderBy.property);
            builder.push(" ");
            builder.push(configuration.orderBy.order);
            builder.push("&");
        }

        var url = builder.join("");

        return url;
    };


    return this;
});