var app = angular.module('crowddata', ['ngRoute'])
  .run(function($rootScope){
    $rootScope.numOfQuestions = 0;
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
  });
  $locationProvider.html5Mode(true);
});

app.controller('mainController', function ($scope, $http, $location, $route, $rootScope) {
  $rootScope.loggedIn = false;
  $rootScope.loading = false;
  $rootScope.loadingText = '';

  $http.get('/api/getUser')
    .success(function (data) {
      $rootScope.user = data.user;
      if (data.user) {
        // The user is logged in
        console.log('logged in');
        $rootScope.user = data.user;
        $rootScope.loggedIn = true;
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
    var selectedResponses = $scope.survey.questions.map(function (question) {
      return { questionid: question.id, response: question.response };
    });

    console.log('selectedResponses:');
    console.log(selectedResponses);

    //create the response db entry
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
});

app.controller('newSurveyController', function ($scope, $rootScope, $http, $location) {
  $scope.canRemoveQ = false;
  $scope.tooManyQ = false;
  console.log('using newSurveyController');

  $scope.addQ = function () {
    $rootScope.numOfQuestions += 1;
    $scope.canRemoveQ = true;
    if ($rootScope.numOfQuestions > 5) {
      $rootScope.numOfQuestions = 5;
      $scope.tooManyQ = true;
    }
  };

  $scope.go = function (path) {
    $location.path(path);
  };

  $scope.qProgress = function () {
    console.log('numofQuestions' + $rootScope.numOfQuestions);
    if ($rootScope.numOfQuestions > $rootScope.questionNumber){
      $rootScope.questionNumber += 1;
      $location.path('/newsurvey/creating_qs');
      console.log('qProgress just did its thing');
    } else {
      $location.path('/newsurvey/preview');
    }
  };

  $scope.removeQ = function () {
    if ($rootScope.numOfQuestions > 0) {$rootScope.numOfQuestions -= 1;
    } else {
      $scope.canRemoveQ = false;
    }
  };
});

app.controller('headerController', function ($scope, $rootScope, $location, $http, $route) {
  $scope.logout = function () {
    $rootScope.loading = true;
    $rootScope.loadingText = 'Logging Out';
    console.log('logging out...');
    $http.get('/logout')
    .success(function (data) {
      $rootScope.loading = false;
      $rootScope.loggedIn = false;
      $location.path('/');
      $route.reload();
    });

    // setTimeout(function() {
    // }, 1000);
  };

  $rootScope.gotoSignUp = function () {
    $location.path('/signup');
  };

  $scope.gotoLogIn = function () {
    $location.path('/login');
  };

  $scope.gotoAbout = function () {
    $location.path('/about');
  };

  $scope.gotoGettingStarted = function () {
    $location.path('/newsurvey/getting_started');
  };
});
