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

app.controller('myController',function($scope,$http,$window){
    var markers = [];
    $scope.fetchData = [];

    $scope.upData = function(event) {
        $scope.fetchData = [];
        $http.post('/getdata', {query: event, location: "new york"}).then(function (resp) {
            if (resp.data instanceof Array && resp.data.length > 0) {
                console.log(resp.data);
                var businessData = resp.data;
                for (var i = 0; i < businessData.length; i++) {
                    $scope.fetchData.push(
                        {
                            name: businessData[i].name,
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
    console.log('data.....',$scope.fetchData);
    function loadGoogleMarkers(){
        var locations = $scope.fetchData;
        console.log('locations', locations);
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: new google.maps.LatLng(-33.92, 151.25),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        var infowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        var marker, i;

        for (i = 0; i < locations.length; i++) {
            var coords = locations[i].cords;

            marker = new google.maps.Marker({
                id: locations[i].id,
                position: new google.maps.LatLng(coords.lat, coords.lon),
                map: map
            });

            markers.push(marker);

            bounds.extend(marker.position);

            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                console.log('am in google maps')
                return function () {
                    infowindow.setContent(locations[i].name);
                    infowindow.open(map, marker);
                    angular.element('.grid').css('background-color', '');
                    angular.element('#' + marker.id).css('background-color', "#ccc");

                    angular.element('.right-div').animate({
                        scrollTop: angular.element('#' + marker.id).offset().top - 150
                    }, 2000);
                }
            })(marker, i));
        }

        map.fitBounds(bounds);
    }
    console.log('menunames');
    $scope.menuNames = [{name: "Top Pics"}, {name: "Food"}, {name: "Coffee"}, {name: "Shopping"}];

    $scope.data = {

        model: null,
        availableOptions: [
            {id: '0', name: 'Search item'},
            {id: '1', name: 'Top Pics'},
            {id: '2', name: 'Food'},
            {id: '3', name: 'Coffee'},
            {id: '4', name: 'Shopping'}
        ]
    };

    $scope.goToBusiness = function (url) {
        console.log('item', url);
        $window.open(url, '_blank');
    };
    /*$scope.update = function() {
        if($scope.data.model != "Search item"){
            $location.path('/'+ $scope.data.model);
        }

        console.log($scope.data.model)
        // use $scope.selectedItem.code and $scope.selectedItem.name here
        // for other stuff ...
    }*/
});

