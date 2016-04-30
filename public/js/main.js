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
  $scope.DVquestions = [];
  $scope.readyForSurvey = false;

  var getASurvey = function () {
    // Only need to get a survey if we're on the page where it exists
    if ($location.path() === '/') {
      $http.get('/api/getSurvey')
        .success(function (data) {
          $scope.survey = data.survey;
        })
        .error(handleError);
    }
  };

  var getUsersSurveysResponses = function () {
    if ($location.path() === '/myData') {
      $scope.loadingText = "Getting Data";
      $scope.loading = true;
      $http.get('/api/getUsersSurveysResponses')
        .success(function (data) {
          $scope.loading = false;
          console.log('users surveys: ',data);

          // TODO: right now this assumes the user only created one survey

          // Parse through the responses
          var firstSurvey = data['thisUsersSurveys'][0];
          var rawResponses = data['responses'];
          $scope.DVsurvey = firstSurvey;
          $scope.DVquestions = firstSurvey['questions'];

          // Build the parsed responses array
          var firstSurveyRespsParsed = [];
          // Loop through all the questions in this survey
          for (var i=0;i<$scope.DVquestions.length;i++) {
            var thisQuestion = $scope.DVquestions[i];

            // Make a possible options array out of the object
            var optionsObj = thisQuestion['responses'];
            var possibleOptions = Object.keys(optionsObj).map(function (key) {
                return optionsObj[key];
            });

            /**
             * Build the object that represents this question according to the
             * syntax:
             * MC/IO: {"Yes":0, "No":0, "Maybe":0}
             * FR: {"answers":[]}
             */
            var thisRespObj = {};
            if (thisQuestion['type'] === "FR") {
              // This is a FR question
              thisRespObj['_answers'] = [];
            } else {
              // This is a MC or IO question (both formatted the same)
              // Loop through all the possible options
              for (var j=0;j<possibleOptions.length;j++) {
                // Initialize this option with "zero people said this"
                thisRespObj[possibleOptions[j]] = 0;
              }
            }
            // Add the object to the parsed responses array
            firstSurveyRespsParsed.push(thisRespObj);
          }

          // Add the data to the parsed responses array
          for (var i=0;i<rawResponses.length;i++) {
            var thisResponse = rawResponses[i];
            if (thisResponse.survey === firstSurvey._id) {
              // This response is for the relevant survey

              // Loop through the questions that were answered
              var questions = thisResponse['data'];
              for (var j=0;j<questions.length;j++) {
                var thisQuestion = questions[j];
                // Get the option that this user chose
                var thisAnswer = thisQuestion.response;

                // Check the question type
                if ('_answers' in firstSurveyRespsParsed[j]) {
                  // This is a FR question
                  firstSurveyRespsParsed[j]['_answers'].push(thisAnswer);
                } else {
                  // This is MR/IO question
                  // Add one person that said this option
                  firstSurveyRespsParsed[j][thisAnswer]++;
                }
              }
            }
          }
          console.log('firstSurveyRespsParsed after',firstSurveyRespsParsed);

          // Make the pie chart
          google.charts.load('current', {'packages':['corechart']});
          google.charts.setOnLoadCallback(startDrawing);
          function startDrawing() {
            // Draw the chart for the first question of the first survey
            drawPie(0,0);
          }

          function makeDataVis(surveyNum, quesNum) {
            // Check the type of question
            if ($scope.DVquestions[quesNum]['type'] === 'FR') {
              // This is a FR question
              // Display all answers
              // TODO make this prettier
              var answersText = firstSurveyRespsParsed[quesNum]['_answers'];
              $('#datavis-'+(quesNum+1)).text(answersText);
            } else {
              // This is a MC/IO question
              drawPie(surveyNum, quesNum);
            }
          }

          function drawPie(surveyNum, quesNum) {
            var thisQuestion = $scope.DVquestions[quesNum];
            // Make a possible options array out of the object
            var optionsObj = thisQuestion['responses'];
            var possibleOptions = Object.keys(optionsObj).map(function (key) {
                return optionsObj[key];
            });

            // TODO this assumes there's only two options
            var data = google.visualization.arrayToDataTable([
              ['Reponse', 'Number'],
              [possibleOptions[0],firstSurveyRespsParsed[quesNum][possibleOptions[0]]],
              [possibleOptions[1],firstSurveyRespsParsed[quesNum][possibleOptions[1]]]
            ]);

            var chart = new google.visualization.PieChart(document.getElementById('datavis-'+(quesNum+1)));

            chart.draw(data);

            // Recursively draw another pie chart for the next question
            if (quesNum < $scope.DVquestions.length-1) {
              makeDataVis(0,quesNum+1);
            }
          }
        });
    }
  };

  if ($rootScope.loggedIn) {
    // We loaded this controller by clicking a header button
    // Don't need to get the user again
    getASurvey();
    getUsersSurveysResponses();
  }

  if ( !("loggedIn" in $rootScope) ) {
    // User manually loaded page in browser
    // We do need to get the user
    // Show the loading screen until we've figured out if they're logged in
    $rootScope.loading = true;
    $http.get('/api/getUser')
      .success(function (data) {
        if (data.user) {
          // The user is logged in
          $rootScope.user = data.user;
          $rootScope.loggedIn = true;
          $rootScope.loading = false;
          getASurvey();
          getUsersSurveysResponses();
        } else {
          // The user is not logged in
          $rootScope.loggedIn = false;
          $rootScope.loading = false;
        }
      });
  }

  $scope.newSurvey = function () {
  console.log("Requesting new survey");
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
  };

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
          $rootScope.loggedIn = true;
          $rootScope.user = resp.user;
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
      user_id:$rootScope.user._id,
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
