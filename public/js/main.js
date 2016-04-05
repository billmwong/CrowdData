var app = angular.module('crowddata', ['ngRoute']);

var handleError = function (err) {
  console.log('Error: ' + err);
};

app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {
    templateUrl: '../views/landing.html',
    controller: 'mainController',
  })
  .when('/newSurvey', {
    templateUrl: '../views/newSurvey.html',
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
