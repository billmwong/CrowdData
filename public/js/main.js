var app = angular.module('crowddata', ['ngRoute']);

var handleError = function(err) {
  console.log("Error: "+ err);
};

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: '../views/landing.html',
    controller: 'mainController',
  })
  .when('/login', {
    templateUrl: '../views/login.html',
    controller: 'mainController',
  })
  .when('/signup', {
    templateUrl: '../views/signup.html',
    controller: 'mainController',
  });
  $locationProvider.html5Mode(true);
});

app.controller('mainController', function ($scope, $http, $location) {
  $scope.contentPath = 'views/landing.html';
  $scope.loggedIn = false;

  // TODO Check if the user is logged in:
  $http.get('/api/getUser')
    .success(function(data) {
      if (data.user._id) {
        console.log("logged in!");
        $scope.loggedIn = true;
        console.log(data.user);
      } else {
        console.log("not logged in");
      }
    })
    .error(handleError);

  $scope.gotoSignUp = function () {
    $location.path('/signup');
  };

  $scope.gotoLogIn = function () {
    $location.path('/login');
  };
});
