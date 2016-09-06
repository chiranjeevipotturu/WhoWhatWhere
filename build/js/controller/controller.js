/**
 * Created by Chiranjeevi on 9/3/2016.
 */
var app = angular.module('myApp',['ngRoute']);
app.config(['$routeProvider', function ($routeProvider) {
    console.log('i am here');
    $routeProvider
        .when('/', {
            templateUrl:'templates/default-view.html'
        }).when('/:query', {
            templateUrl:'templates/view-data.html'
        })
}]);

app.controller('myController',function($scope, $http, $window, $location){
    var markers = [];
    var map;
    var mapData;
    $scope.fetchData = [];
    $scope.menuNames = [{name: "Top Pics"}, {name: "Food"}, {name: "Coffee"}, {name: "Shopping"}];

    function onPositionUpdate(position) {
        //if(mapData){
            getCurrentCity(position.coords.latitude, position.coords.longitude);
        //}else{
        //    mapData = position.coords;
        //}
    }

    function getCurrentCity(latitude, longitude){
        var latLng = new google.maps.LatLng(latitude, longitude);

        new google.maps.Geocoder().geocode(
            {'latLng': latLng},
            function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) {
                        var value = results[0].formatted_address.split(",");
                        var count = value.length;
                        var city = value[count-3];
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

    //window.onMapCallback = function(){
    //    if(mapData){
    //        getCurrentCity(mapData.latitude, mapData.longitude);
    //    }else{
    //        mapData = true;
    //    }
    //};

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

    function scrollElement(number){
        angular.element('.grid').css('background-color', '');
        angular.element('.right-div .element-'+number).css('background-color', "#ccc");
        angular.element('.right-div').animate({
            scrollTop: angular.element('.right-div .element-'+number).offset().top - 250
        }, 2000);
    }

    function addMarker(feature) {
        var marker = new google.maps.Marker({
            position: feature.position,
            map     : map
        });

        var infowindow = new google.maps.InfoWindow({
            content: feature.title
        });

        marker.addListener('mouseover', function () {
            infowindow.open(map, marker);
        });

        marker.addListener('mouseout', function () {
            infowindow.close();
        });

        marker.addListener('click', function (event) {
            scrollElement(feature.number);
        });

        return marker;
    }

    function loadGoogleMarkers(){
        var locations = $scope.fetchData;

        loadMap(locations[0].cords);

        for (var i = 0; i < locations.length; i++) {
            var current = locations[i];

            var _marker = {
                position: new google.maps.LatLng(current.cords.lat, current.cords.lon),
                title   : current.name,
                number : i,
                data    : current
            };
            markers.push(addMarker(_marker));
        }
    }

    $scope.goToBusiness = function (url) {
        if(url === 'NA'){
            //no url
        }else{
            $window.open(url, '_blank');
        }
    };

    function getData(input){
        $http.post('/getdata',input).then(function (resp) {
            if (resp.data instanceof Array && resp.data.length > 0) {
                var businessData = resp.data;
                console.log(businessData);
                setMapOnAll();
                markers.length = 0;
                $scope.fetchData = [];
                for (var i = 0; i < businessData.length; i++) {
                    $scope.fetchData.push(
                        {
                            class : "element-"+i,
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
        $scope.fetchData = [];
        if($scope.location.toString().trim().length > 0) {
            if(angular.isUndefined($scope.query)){
                $location.path('/'+$scope.query);
            }else{
                $location.path('/'+$scope.location);
            }
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

