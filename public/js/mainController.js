var app = angular.module('crowddata');
app.controller('mainController', function ($scope, $http, $location, $route, $rootScope, $window, goToService) {
  // don't allow typing in number inputs
  $("[type='number']").keypress(function (evt) {
    evt.preventDefault();
  });

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
    country: '',
    nationality: '',
    DOB_year: '',
    DOB_month: '',
    DOB_day: '',
  };
  $scope.DVquestions = [];
  $scope.readyForSurvey = false;
  $scope.DVSurveyIndex = 0;

  if (typeof chartsLoaded === 'undefined') {
    chartsLoaded = false;
  }

  // var chartsLoadedCallback = function () {
  //   chartsLoaded = true;
  // };

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

  $scope.DVnextSurvey = function() {

    if (parseInt($scope.DVcurrentSurvey) === ($scope.thisUsersSurveys.length-1)) {
      // Loop back to the first survey
      var nextSurveyIndex = 0;
    } else {
      var nextSurveyIndex = parseInt($scope.DVcurrentSurvey) + 1;
    }
    $location.path('/myData').search({survey: nextSurveyIndex});
    $window.location.reload();
  };

  var getUsersSurveysResponses = function () {
    if ($location.path() === '/myData') {
      $scope.DVcurrentSurvey = $location.search().survey;
      $rootScope.loadingText = "Getting Data";
      $rootScope.loading = true;
      $http.get('/api/getUsersSurveysResponses')
        .success(function (data) {
          $rootScope.loading = false;
          $scope.thisUsersSurveys = data['thisUsersSurveys'];

          // Parse through the responses
          var firstSurvey = data['thisUsersSurveys'][$scope.DVcurrentSurvey];
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
             * FR: {"_answers":[]}
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

          // Make the pie chart
          // Load google charts if we haven't already
          if (!chartsLoaded) {
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(startDrawing);
            chartsLoaded = true;
          } else {
            google.charts.setOnLoadCallback(startDrawing);
          }
          // Draw the chart for the first question of the first survey
          function startDrawing() {
            makeDataVis(0,0);
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

            // Build chartData array
            var chartData = [['Response', 'Number']];
            for (var i=0;i<possibleOptions.length;i++) {
              chartData.push([possibleOptions[i],firstSurveyRespsParsed[quesNum][possibleOptions[i]]]);
            }

            var data = google.visualization.arrayToDataTable(chartData);

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
    // Show the loading screen
    $rootScope.loading = true;
    // We need to get the user
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

  // Give me a different survey function
  $scope.getDiffSurvey = function () {
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
      return { questionid: question.id, response: question.selectedResponse };
    });

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
        $location.path('/');
        $route.reload();
      });
  };
});
