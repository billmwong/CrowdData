var app = angular.module('crowddata', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: '../views/template.html',
    controller: 'mainController',
  });
  $locationProvider.html5Mode(true);
});

app.controller('mainController', function ($scope, $http, $location) {
  $scope.contentPath = 'views/landing.html';

  $scope.gotoSignUp = function () {
    $scope.contentPath = 'views/signup.html';
  };

  $scope.gotoLogIn = function () {
    $scope.contentPath = 'views/login.html';
    // $location.path('/login');
  };
});
