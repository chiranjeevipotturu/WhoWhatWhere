/**
 * Created by Chiranjeevi on 9/3/2016.
 */
var app = angular.module('myApp',['ngRoute']);
app.config(['$routeProvider', function ($routeProvider) {
    console.log('i am here');
    $routeProvider
        .when('/', {
            templateUrl:'templates/default-view.html'
        }).when('/:menuName', {
            templateUrl:'templates/view-data.html'
        })
}]);

app.controller('myController',function($scope, $http, $window){
    var markers = [];
    var map;
    var mapData;
    $scope.fetchData = [];
    $scope.menuNames = [{name: "Top Pics"}, {name: "Food"}, {name: "Coffee"}, {name: "Shopping"}];

    function onPositionUpdate(position) {
        if(mapData){
            getCurrentCity(position.coords.latitude, position.coords.longitude);
        }else{
            mapData = position.coords;
        }
    }

    function getCurrentCity(latitude, longitude){
        var latlng = new google.maps.LatLng(latitude, longitude);

        new google.maps.Geocoder().geocode(
            {'latLng': latlng},
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var value= results[0].formatted_address.split(",");
                        var count=value.length;
                        var city=value[count-3];
                        $scope.$apply(function () {
                            $scope.location = city;
                        });
                    }
                    else  {
                        console.log("address not found");
                    }
                }
                else {
                    console.log("Geocoder failed due to: " + status);
                }
            }
        );
    }

    window.onMapCallback = function(){
        if(mapData){
            getCurrentCity(mapData.latitude, mapData.longitude);
        }else{
            mapData = true;
        }
    };

    navigator.geolocation.getCurrentPosition(onPositionUpdate,
        function(){
            $scope.location = 'Pune';
        },
        {enableHighAccuracy: true, timeout: 5000, maximumAge: 600000});

    $scope.upData = function(event) {
        $scope.fetchData = [];
        $scope.query = event;
         getData({query: event, location: $scope.location});
    };

    function loadMap(cords) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom  : 16,
            center: new google.maps.LatLng(cords.lat, cords.lon)
        });
    }

    function loadGoogleMarkers(){
        var locations = $scope.fetchData;

        loadMap(locations[0].cords);

        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        var i;

        for (i = 0; i < locations.length; i++) {
            var coords = locations[i].cords;

            var marker = new google.maps.Marker({
                id: locations[i].id,
                position: new google.maps.LatLng(coords.lat, coords.lon),
                map: map
            });

            console.log(locations[i].title);
            var infowindow = new google.maps.InfoWindow({
                content: locations[i].name
            });

            marker.addListener('mouseover', function () {
                infowindow.open(map, marker);
            });

            marker.addListener('mouseout', function () {
                infowindow.close();
            });

            markers.push(marker);
        }
    }

    $scope.goToBusiness = function (url) {
        if(url === 'NA'){
            //no url
        }else{
        $window.open(url, '_blank');}
    };

    function getData(input){
        $http.post('/getdata',input).then(function (resp) {
            if (resp.data instanceof Array && resp.data.length > 0) {
                var businessData = resp.data;
                console.log(resp.data);
                setMapOnAll();
                markers.length = 0;
                $scope.fetchData = [];
                for (var i = 0; i < businessData.length; i++) {
                    $scope.fetchData.push(
                        {
                            id:businessData[i].id,
                            name: businessData[i].name,
                            title: businessData[i].title,
                            phone: businessData[i].phone,
                            rating: businessData[i].rating,
                            image: businessData[i].photo,
                            address: businessData[i].address,
                            cords: businessData[i].cords,
                            url: businessData[i].url
                        }
                    )
                }
                loadGoogleMarkers();
            } else {
                console.log('No Results found');
            }
        }, function (error) {
            console.error(error);
        });
    }


    $scope.onSearch = function(){
        if($scope.location.toString().trim().length > 0) {
            getData({query: $scope.query, location: $scope.location});
        }else{
            alert('please enter a location');
        }
    };

    function setMapOnAll() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }
});

