angular.module('app.controllers')

.controller('ExceptionController', function($window, $scope) {

    $scope.back = function() {
        $window.history.back();
    };

});