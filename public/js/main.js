var app = angular.module('crowddata', ['ngRoute']);

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
  .when('/newsurvey', {
    templateUrl: '../views/newSurvey.html',
    controller: 'newSurveyController',
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
    .success(function (data) {
      $scope.user = data.user;
      if (data.user) {
        // The user is logged in
        console.log('logged in');
        $scope.user = data.user;
        $scope.loggedIn = true;
        $http.get('/api/getSurvey')
          .success(function (data) {
            console.log('Current survey: ');
            console.log(data.survey);
            $scope.survey = data.survey;
          })
          .error(handleError);
      }
    });

  $scope.submitAnswers = function () {
    //This assumes two questions with radio responses
    var selectedResponses = $scope.survey.questions.map(function (question) {
      return { questionid: question.id, response: question.response };
    });

    console.log('selectedResponses:');
    console.log(selectedResponses);

    var responseData = {
      user_id:$scope.user._id,
      survey_id:$scope.survey._id,
      response:{
        survey:$scope.survey._id,
        data:selectedResponses,
      },
    };
    $http.post('/api/survey/submit', responseData)
    .success(function (data) {
      console.log("here's the data");
      console.log(data);
    });
  };

  $scope.gotoSignUp = function () {
    $location.path('/signup');
  };

  $scope.gotoLogIn = function () {
    $location.path('/login');
  };

  $scope.logout = function () {
    $http.get('/logout')
    .success(function (data) {
      $location.path('/');
    });
  };
});

app.controller('newSurveyController', function ($scope, $http, $location) {
  $scope.numOfQuestions = 0;
  $scope.canRemoveQ = false;
  $scope.tooManyQ = false;
  console.log('using newSurveyController');

  $scope.addQ = function () {
    $scope.numOfQuestions += 1;
    $scope.canRemoveQ = true;
    if ($scope.numOfQuestions > 5) {
      $scope.numOfQuestions = 5;
      $scope.tooManyQ = true;
    }
  };

  $scope.removeQ = function () {
    if ($scope.numOfQuestions > 0) {$scope.numOfQuestions -= 1;
    } else {
      $scope.canRemoveQ = false;
    };
  };
});
