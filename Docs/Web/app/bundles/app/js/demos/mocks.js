angular.module('mocks', ['App', 'ngMockE2E'])
.run(function($httpBackend, CONFIGURATION, $log) {
  
    var endpoint  = CONFIGURATION.endpoint;
    var Api = null;
    var build = function(Api){
        var exp = new RegExp(endpoint + Api ); 
        return exp;
    };
    
    //-------------------------------------------------------------
    //COMPONENTS: GALE-TABLE EXAMPLE 2
    Api = "/Mocks/User/";
    $httpBackend.whenGET(build(Api)).respond(function(method, url, data) {
        var result = {
          "offset": 0,
          "limit": 10,
          "total": 10,
          "elapsedTime": "00:00:00.3685175",
          "items": [
            {
              "token": "f8302e8c-ea34-4daa-a2f1-9ec727d7a4e9",
              "nombre": "SPENCE",
              "cliente": "SPENCE",
              "imagen": "",
              "creacion": "2015-06-03T12:47:40",
              "latitud": "25",
              "longitud": "25",
              "zoom": "14"
            },
            {
              "token": "65b7a72b-b508-4594-9c89-2efdae9e7e91",
              "nombre": "PROYECTO-MEL",
              "cliente": "MINERA ESCONDIDA",
              "imagen": "",
              "creacion": "2015-06-03T12:47:40",
              "latitud": "-33,4227752685547",
              "longitud": "-70,6111831665039",
              "zoom": "12"
            }
          ]
        };

        return [
            200, 
            result, 
            {}
        ];
    });
    //-------------------------------------------------------------

    //REQUIRED EXCEPTION FOR OTHER EXCEPTIONS
    $httpBackend.whenPOST(/.*/).passThrough();
    $httpBackend.whenPUT(/.*/).passThrough();
    $httpBackend.whenGET(/.*/).passThrough();
    $httpBackend.whenDELETE(/.*/).passThrough();

});