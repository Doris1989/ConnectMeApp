var yourApp = angular.module('myApp', ['onsen.directives']);


yourApp.controller("mainController", function($scope) {
    $scope.pushMe = function(){
        $scope.ons.navigator.pushPage('page2.html');
    }
});


yourApp.controller("controller2", function($scope, $timeout) {

    $timeout(function(){
        var latlng = new google.maps.LatLng(-34.397, 150.644);
        var myOptions = {
            zoom: 8,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);  
    },200);
});
