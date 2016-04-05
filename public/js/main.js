var app = angular.module('crowddata', ['ngRoute']);

$.material.init();

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

  $http.get('/api/getUser')
    .success(function(data){
      if(data.user){
        // The user is logged in
        console.log ('logged in');
        $scope.loggedIn = true;
        $http.get('/api/getSurvey')
          .success(function(data) {
            console.log("Current survey: ");
            console.log(data.survey);
            $scope.survey = data.survey;
            $scope.survey.questions = [
              {  // Short list of questions, max of 3 or 5
                id: 1,
                type: "mc",
                content: "Are you?",
                Answers: ["yeah totally", "sure"] // of strings
              },
              {
                id: 2,
                type: "mc",
                content: "How about now?",
                Answers: ["nope", "maybe a little"] // of strings
              }
            ];
            $scope.questions = data.survey.questions;
          })
          .error(handleError);
      }
    });

  $scope.gotoSignUp = function () {
    $location.path('/signup');
  };

  $scope.gotoLogIn = function () {
    $location.path('/login');
  };

  $scope.logout = function () {
    $http.get('/logout');
    $location.path('/');
  };
});
