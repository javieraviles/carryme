'use strict';

/* App Module */

var tfgApp = angular.module('tfgApp', ['ngRoute', 'tfgControllers', 'tfgServices']);

tfgApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
        when('/', {
        templateUrl: 'partials/identification.html',
        controller: 'loginController'
      }).
        when('/profile', {
        templateUrl: 'partials/user-profile.html',
        controller: 'profileController'
      }).
        when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'loginController'
      }).
        when('/my-cars', {
        templateUrl: 'partials/my-cars.html',
        controller: 'myCarsController'
      }).
        when('/chosen-cars', {
        templateUrl: 'partials/chosen-cars.html',
        controller: 'chosenCarsController'
      }).
        when('/new-car', {
        templateUrl: 'partials/new-car.html',
        controller: 'carController'
      }).
        when('/looking-for-car', {
        templateUrl: 'partials/looking-for-car.html',
        controller: 'lookingController'
      }).
      otherwise({
        redirectTo: '/'
      });
}]);

tfgApp.run(['loginService', '$rootScope', '$firebase', function(loginService, $rootScope, $firebase) {

        $rootScope.loginObj = loginService.init('/login');
        var refCars = new Firebase ("https://tfg.firebaseio.com/cars");
        $rootScope.cars = $firebase(refCars);
}]);