var app = angular.module('crowddata', ['ngRoute'])
  .run(function ($rootScope) {
    $rootScope.Setup = {};
    $rootScope.Setup.numOfQuestions = 1;
    $rootScope.questionNumber = 1;
  });

// Material Design initializations
$.material.init();
$(function () { $("[data-toggle='tooltip']").tooltip(); });

var handleError = function (err) {
  console.log('Error: ' + err);
};

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: '../views/landing.html',
    controller: 'mainController',
  })
  .when('/newsurvey/getting_started', {
    templateUrl: '../views/newSurveyIntro.html',
    controller: 'newSurveyController',
  })
  .when('/newsurvey/setting_up', {
    templateUrl: '../views/newSurveySetup.html',
    controller: 'newSurveyController',
  })
  .when('/newsurvey/creating_qs', {
    templateUrl: '../views/newSurveyQuestion.html',
    controller: 'newSurveyController',
  })
  .when('/newsurvey/preview', {
    templateUrl: '../views/newSurveyPreview.html',
    controller: 'newSurveyController',
  })
  .when('/signup', {
    templateUrl: '../views/signup.html',
    controller: 'mainController',
  })
  .when('/about', {
    templateUrl: '../views/about.html',
    controller: 'mainController',
  })
  .when('/myData', {
    templateUrl: '../views/myData.html',
    controller: 'mainController',
  });
  $locationProvider.html5Mode(true);
});
