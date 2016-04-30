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
  });
  $locationProvider.html5Mode(true);
});

app.service('anchorSmoothScroll', function () {

  this.scrollTo = function (eID) {

    // This scrolling function
    // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

    var startY = currentYPosition();
    var stopY = elmYPosition(eID);
    var distance = stopY > startY ? stopY - startY : startY - stopY;
    if (distance < 100) {
      scrollTo(0, stopY); return;
    }

    var speed = Math.round(distance / 100);
    if (speed >= 20) speed = 20;
    var step = Math.round(distance / 25);
    var leapY = stopY > startY ? startY + step : startY - step;
    var timer = 0;
    if (stopY > startY) {
      for (var i = startY; i < stopY; i += step) {
        setTimeout('window.scrollTo(0, ' + leapY + ')', timer * speed);
        leapY += step; if (leapY > stopY) leapY = stopY; timer++;
      } return;
    };

    for (var i = startY; i > stopY; i -= step) {
      setTimeout('window.scrollTo(0, ' + leapY + ')', timer * speed);
      leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
    }

    function currentYPosition() {

      // Firefox, Chrome, Opera, Safari
      if (self.pageYOffset) return self.pageYOffset;

      // Internet Explorer 6 - standards mode
      if (document.documentElement && document.documentElement.scrollTop)
        return document.documentElement.scrollTop;

      // Internet Explorer 6, 7 and 8
      if (document.body.scrollTop) return document.body.scrollTop;
      return 0;
    };

    function elmYPosition(eID) {
      var elm = document.getElementById(eID);
      var y = elm.offsetTop;
      var node = elm;
      while (node.offsetParent && node.offsetParent != document.body) {
        node = node.offsetParent;
        y += node.offsetTop;
      } return y;
    };
  };
});

app.service('goToService', function ($location) {
  return {
    goTo: function (path) {
      $location.path(path);
    },
  };
});

app.controller('mainController', function ($scope, $http, $location, $route, $rootScope, goToService) {
  $rootScope.loggedIn = false;
  $rootScope.loading = false;
  $rootScope.loadingText = '';
  $scope.invalidInputs = false;
  $scope.loginForm = {
    username: '',
    password: '',
  };
  $scope.invalidUsername = false;
  $scope.signupForm = {
    username: '',
    password: '',
    age: '',
    countryOfResidence: '',
    DOB_year: '',
    DOB_month: '',
    DOB_day: '',
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
            console.log('scope.survey', $scope.survey);
          })
          .error(handleError);
      }
    });

  $scope.goTo = function (path) {
    goToService.goTo(path);
  };

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
      console.log(question.selectedResponse);
      return { questionid: question.id, response: question.selectedResponse };
    });

    console.log('selectedResponses:', selectedResponses);
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

app.controller('newSurveyController', function ($scope, $rootScope, $http, $location, goToService, anchorSmoothScroll) {
  $scope.canRemoveQ = false;
  $scope.tooManyQ = false;
  $scope.surveyUploaded = false;
  $scope.q = {};
  $scope.allq = [];
  var numOfOptions = 2;

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

  $scope.addQ = function () {
    $rootScope.Setup.numOfQuestions += 1;
    $scope.canRemoveQ = true;
    if ($rootScope.Setup.numOfQuestions > 5) {
      $rootScope.Setup.numOfQuestions = 5;
      $scope.tooManyQ = true;
    }
  };

  $scope.go = function (path) {
    $scope.surveyUploaded = false;
    goToService.goTo(path);
  };

  $scope.goToElement = function (eID) {
    // set the location.hash to the id of
    // the element you wish to scroll to.
    $location.hash(eID);

    // call $anchorScroll()
    anchorSmoothScroll.scrollTo(eID);
    $location.hash('');
  };

  $scope.sProgress = function () {  // progress from survey setup to question preview
    if ($scope.Setup.title && $scope.Setup.hypothesis && $scope.Setup.category) {
      $scope.missingTitle = false;
      $scope.missingHypothesis = false;
      $scope.missingCategory = false;
      $scope.missingStuff = false;
      $scope.go('/newsurvey/creating_qs');
    } else {  // provide error messages if things are missing
      $scope.missingStuff = true;
      if (!$scope.Setup.title) {
        $scope.missingTitle = true;
      }
      if (!$scope.Setup.hypothesis) {
        $scope.missingHypothesis = true;
      }
      if (!$scope.Setup.category) {
        $scope.missingCategory = true;
      }
    }
  };

  $scope.qRegress = function () {
    $scope.allq[$rootScope.questionNumber-1] = $scope.q;
    $rootScope.questionNumber -= 1;
    $scope.q = $scope.allq[$rootScope.questionNumber-1];
  };

  $scope.qProgress = function () {  // progress from question population to next
    // question and eventually survey preview
    if ($scope.q.type && $scope.q.content && $scope.q.responses) {
      $scope.missingType = false;
      $scope.missingContent = false;
      $scope.missingResponses = false;
      $scope.missingStuff = false;
      if ($rootScope.Setup.numOfQuestions > $rootScope.questionNumber) {
        

        $scope.q.id = $rootScope.questionNumber;
        $scope.allq[$rootScope.questionNumber-1] = $scope.q;
        $rootScope.questionNumber += 1;
        if ($scope.allq[$rootScope.questionNumber-1]) {
          $scope.q = $scope.allq[$rootScope.questionNumber-1];
        } else {
        $scope.q = {};
        }
        $location.path('/newsurvey/creating_qs');
      } else {
        $scope.q.id = $rootScope.questionNumber;
        $scope.allq[$rootScope.questionNumber-1] = $scope.q;
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
    } else {
      $scope.missingStuff = true;
      if (!$scope.q.type) {
        $scope.missingType = true;
      };

      if (!$scope.q.content) {
        $scope.missingContent = true;
      };

      if (!$scope.q.response) {
        $scope.missingResponses = true;
      };
    }
  };

  $scope.postNewSurvey = function () {
    if ($rootScope.newSurvey) {
      $http.post('/api/survey/new', $rootScope.newSurvey)
      .success(function (data) {
        $scope.surveyUploaded = true;
        $rootScope.newSurvey = {};
        $scope.allq = [];
      });
    }
  };

  // $scope.addOption = function () {
  //   numOfOptions += 1;
  //   $('#addOptionBtn').before("<div class='form-group label-floating'><br><label class='control-label' for='surveyTitle'>Option " + numOfOptions + "</label><input class='form-control' id='surveyTitle' type='text' ng-focus='typingTitle=true' ng-blur='typingTitle=false' ng-model='q.questionNumber.response." + numOfOptions + "'><small class='text-muted' ng-show='typingTitle'> </small></div>");
  //
  // };

  $scope.removeQ = function () {
    if ($rootScope.Setup.numOfQuestions > 2) {$rootScope.Setup.numOfQuestions -= 1;
    } else {
      $rootScope.Setup.numOfQuestions -= 1;
      $scope.canRemoveQ = false;
    }
  };
});

app.controller('headerController', function ($scope, $rootScope, $location, $http, $route, goToService) {
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

  $scope.goTo = function (path) {
    goToService.goTo(path);
  };
});
