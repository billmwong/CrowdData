var app = angular.module('crowddata', ['ngRoute'])
  .run(function($rootScope){
    $rootScope.Setup.numOfQuestions = 0;
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

app.controller('mainController', function ($scope, $http, $location, $route) {
  $scope.loggedIn = false;
  $scope.loading = false;
  $scope.loadingText = '';

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
  var numOfOptions = 2;
  console.log('using newSurveyController');

  $scope.addQ = function () {
    $rootScope.Setup.numOfQuestions += 1;
    $scope.canRemoveQ = true;
    if ($rootScope.Setup.numOfQuestions > 5) {
      $rootScope.Setup.numOfQuestions = 5;
      $scope.tooManyQ = true;
    }
  };

  $scope.go = function (path) {
    $location.path(path);
  };

  $scope.qProgress = function () {
    console.log('Setup.numOfQuestions' + $rootScope.Setup.numOfQuestions);
    if ($rootScope.Setup.numOfQuestions > $rootScope.questionNumber){
      $rootScope.questionNumber += 1;
      $location.path('/newsurvey/creating_qs');
      console.log('qProgress just did its thing');
    } else {
      $location.path('/newsurvey/preview');
    }
  };

  $scope.addOption = function(){
    numOfOptions += 1;
    $('#addOptionBtn').before("<div class='form-group label-floating'><br><label class='control-label' for='surveyTitle'>Option " + Setup.numOfOptions + "</label><input class='form-control' id='surveyTitle' type='text' ng-focus='typingTitle=true' ng-blur='typingTitle=false' ng-model='q.{{questionNumber}}.response." + Setup.numOfOptions + "'><small class='text-muted' ng-show='typingTitle'> </small></div>");

  };

  $scope.removeQ = function () {
    if ($rootScope.Setup.numOfQuestions > 0) {$rootScope.Setup.numOfQuestions -= 1;
    } else {
      $scope.canRemoveQ = false;
    }
  };

  $scope.logout = function () {
    $scope.loading = true;
    $scope.loadingText = 'Logging Out';
    console.log('logging out...');
    $http.get('/logout')
    .success(function (data) {
      $scope.loading = false;
      $scope.loggedIn = false;
      $location.path('/');
      $route.reload();
    });

    // setTimeout(function() {
    // }, 1000);
  };
});

app.controller('newSurveyController', function ($scope, $http, $location) {
  $scope.numOfQuestions = 0;
  $scope.canRemoveQ = false;
  $scope.tooManyQ = false;
  $scope.questionNumber = 1;
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
