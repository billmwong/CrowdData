var app = angular.module('crowddata')
.controller('newSurveyController', function ($scope, $rootScope, $http, $location, goToService, anchorSmoothScroll) {
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
    $scope.allq[$rootScope.questionNumber - 1] = $scope.q;
    $rootScope.questionNumber -= 1;
    $scope.q = $scope.allq[$rootScope.questionNumber - 1];
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
        $scope.surveyUploading = false;

        $scope.Setup.title = false;
        $scope.Setup.hypothesis = false;
        $scope.Setup.category = false;
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
