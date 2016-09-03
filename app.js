var w3App = angular.module("m3wApp", ['ngRoute']);
w3App.config(['$routeProvider', function ($routeProvider) {
	console.log('config');
	$routeProvider
		.when('/', {
			templateUrl:'templates/default-view.html'
		}).when('/:menuName', {
			templateUrl:'templates/view-data.html',
			controller: 'viewDataCtrl'
		})
		.otherwise({redirectTo: '/'});
}]);

w3App.controller("w3MainCtrl", function($scope, $location){
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
	}

	$scope.update = function() {
		if($scope.data.model != "Search item"){
			$location.path('/'+ $scope.data.model);
		}
	}
});
