var app = angular.module('crowddata', ['ngRoute'])
  .run(function ($rootScope) {
    $rootScope.Setup = {};
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

app.controller('mainController', function ($scope, $http, $location, $route, $rootScope) {
  $rootScope.loggedIn = false;
  $rootScope.loading = false;
  $rootScope.loadingText = '';
  $scope.invalidInputs = false;
  $scope.loginForm = {
    username: "",
    password: ""
  };
  $scope.invalidUsername = false;
  $scope.signupForm = {
    username: "",
    password: "",
    age: "",
    countryOfResidence: "",
    DOB_year: "",
    DOB_month: "",
    DOB_day: ""
  };

  $http.get('/api/getUser')
    .success(function (data) {
      $rootScope.user = data.user;
      if (data.user) {
        // The user is logged in
        $rootScope.user = data.user;
        $rootScope.loggedIn = true;
        $http.get('/api/getSurvey')
          .success(function (data) {
            $scope.survey = data.survey;
          })
          .error(handleError);
      }
    });

  $scope.submitLoginForm = function () {
    loginData = $scope.loginForm;
    $rootScope.loading = true;
    $rootScope.loadingText = 'Logging In';
    $http.post('/login', loginData)
      .success(function (resp) {
        if (resp.loggedIn) {
          // User is successfully logged in
          $rootScope.loading = false;
          $location.path('/');
          $route.reload();
        } else {
          // There was an invalid username/password
          $rootScope.loading = false;
          $scope.invalidInputs = true;
        }
      });
  };

  $scope.submitSignupForm = function () {
    signupData = $scope.signupForm;
    $rootScope.loading = true;
    $rootScope.loadingText = 'Signing Up';
    $http.post('/register', signupData)
      .success(function (resp) {
        if (resp.success) {
          // User successfully signed up
          $rootScope.loading = false;
          $location.path('/');
          $route.reload();
        } else {
          // There was an invalid username
          $rootScope.loading = false;
          $scope.invalidUsername = true;
        }
      });
  };

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
  $scope.allq = [];
  var numOfOptions = 2;

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
    if ($rootScope.Setup.numOfQuestions > $rootScope.questionNumber) {
      $rootScope.questionNumber += 1;
      $scope.allq.push($scope.q);
      $scope.q = {};
      $location.path('/newsurvey/creating_qs');
    } else {
      $scope.allq.push($scope.q);
      $rootScope.newSurvey = {
        author: $rootScope.user._id,  // containing user _id
        timeCreated: Date(),
        category: $scope.Setup.category,
        demographics: $scope.Setup.demographics,
        title: $scope.Setup.title,
        hypothesis: $scope.Setup.hypothesis,
        questions: $scope.allq,

        // questions: [{  // Short list of questions, max of 3 or 5
        //     id: Number,
        //     type: String,
        //     content: String,
        //     Answers: Array // of strings
        //   }
        // ],
        options: {},
        usersTaken: [],
      };
      $location.path('/newsurvey/preview');
    }
  };

  $scope.postNewSurvey = function () {
    if ($rootScope.newSurvey.questions.length) {
      $http.post('/api/survey/new', $rootScope.newSurvey)
      .success(function (data) {
        $rootScope.newSurvey = {};
      });
    }
  };

  // $scope.addOption = function () {
  //   numOfOptions += 1;
  //   $('#addOptionBtn').before("<div class='form-group label-floating'><br><label class='control-label' for='surveyTitle'>Option " + numOfOptions + "</label><input class='form-control' id='surveyTitle' type='text' ng-focus='typingTitle=true' ng-blur='typingTitle=false' ng-model='q.questionNumber.response." + numOfOptions + "'><small class='text-muted' ng-show='typingTitle'> </small></div>");
  //
  // };

  $scope.removeQ = function () {
    if ($rootScope.Setup.numOfQuestions > 0) {$rootScope.Setup.numOfQuestions -= 1;
    } else {
      $scope.canRemoveQ = false;
    }
  };
});

app.controller('headerController', function ($scope, $rootScope, $location, $http, $route) {
  $scope.logout = function () {
    $rootScope.loading = true;
    $rootScope.loadingText = 'Logging Out';
    $http.get('/logout')
    .success(function (data) {
      $rootScope.loading = false;
      $rootScope.loggedIn = false;
      $location.path('/');
      $route.reload();
    });
  };

  $rootScope.gotoSignUp = function () {
    $location.path('/signup');
  };

  $rootScope.gotoRoot = function () {
    $location.path('/');
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
