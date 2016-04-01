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

  $http.get('/api/getUser')
    .success(function(data){
      if(data.user){
        console.log ('logged in');
        $scope.loggedIn = true;
        $http.get('/api/getSurvey')
          .success(function(data) {
            console.log("Current survey: ");
            console.log(data.survey);
            $scope.survey = data.survey;
            $scope.survey.questions = [{  // Short list of questions, max of 3 or 5
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
          })
          .error(handleError);
      }else{
        console.log('not logged in');
        console.log(data.user);
        // $location.path('/login');
      }
    });
  $scope.submitAnswers = function () {
    //This assumes two questions with radio responses, TODO: scalability
    //also, this function does not currently have access to "data"
    var responseData = {
      user_id:data.user._id,
      survey_id:survey._id,
      response:{
        survey:survey._id,
        data:[
          {
            questionid:0,
            response: $scope.q0
          },
          {
            questionid:1,
            response:$scope.q1
          }
        ]
      }
    };
    $http.post('/api/survey/submit', responseData);
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
