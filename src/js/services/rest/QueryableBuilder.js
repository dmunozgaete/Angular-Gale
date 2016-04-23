angular.module('gale.services')

.factory('QueryableBuilder', function()
{

    var self = this;

    // Define the constructor function.
    self.build = function(endpoint, configuration)
    {

        //Add Endpoint
        var arr = [];
        var builder = [
            endpoint + (endpoint.indexOf("?") >= 0 ? "&" : "?")
        ];


        //SELECT
        if (configuration.select)
        {
            builder.push("$select=");
            //---------------------------------
            arr = [];
            angular.forEach(configuration.select,function(key)
            {
                arr.push(key);
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //FILTER
        if (configuration.filters && configuration.filters.length>0)
        {
            builder.push("$filter=");
            //---------------------------------
            arr = [];
            angular.forEach(configuration.filters, function(item)
            {
                arr.push(
                    item.property +
                    " " +
                    item.operator +
                    " '" +
                    item.value +
                    "'"
                );
            });
            //---------------------------------
            builder.push(arr.join(","));
            builder.push("&");
        }

        //LIMIT
        if (configuration.limit)
        {
            builder.push("$limit=");
            builder.push(configuration.limit);
            builder.push("&");
        }

        //LIMIT
        if (configuration.offset)
        {
            builder.push("$offset=");
            builder.push(configuration.offset);
            builder.push("&");
        }


        //ORDER BY
        if (configuration.orderBy)
        {
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
