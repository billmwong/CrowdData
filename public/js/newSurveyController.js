var app = angular.module('crowddata')
.controller('newSurveyController', function ($scope, $rootScope, $http, $location, goToService, anchorSmoothScroll) {
  $scope.canRemoveQ = false;
  $scope.tooManyQ = false;
  $scope.surveyUploaded = false;
  $scope.q = {};
  $scope.allq = [];

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

  // Increases the number of questions to populate, but not above 5.
  $scope.addQ = function () {
    $rootScope.Setup.numOfQuestions += 1;
    $scope.canRemoveQ = true;
    if ($rootScope.Setup.numOfQuestions > 5) {
      $rootScope.Setup.numOfQuestions = 5;
      $scope.tooManyQ = true;
    }
  };

  // Decreases the number of questions to populate, but not below 1
  $scope.removeQ = function () {
    if ($rootScope.Setup.numOfQuestions > 2) {$rootScope.Setup.numOfQuestions -= 1;
    } else {
      $rootScope.Setup.numOfQuestions -= 1;
      $scope.canRemoveQ = false;
    }
  };

  $scope.go = function (path) {
    $scope.surveyUploaded = false;
    goToService.goTo(path);
  };

  // Uses anchorSmoothScroll to transition to new locations
  $scope.goToElement = function (eID) {
    // set the location.hash to the id of the element you wish to scroll to.
    $location.hash(eID);

    // call $anchorScroll()
    anchorSmoothScroll.scrollTo(eID);
    $location.hash('');
  };

  // progress from survey setup to question preview
  $scope.sProgress = function () {
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

  // regress to previous question, populate the fields
  $scope.qRegress = function () {
    if ($rootScope.Setup.numOfQuestions >= $rootScope.questionNumber) {
      $scope.allq[$rootScope.questionNumber - 1] = $scope.q;
    }

    $rootScope.questionNumber -= 1;
    $scope.q = $scope.allq[$rootScope.questionNumber - 1];
  };

  // progress from question population to next question or survey preview
  $scope.qProgress = function () {
    if ($scope.q.type && $scope.q.content && $scope.q.responses) {
      // check if all fields are filled
      $scope.missingType = false;
      $scope.missingContent = false;
      $scope.missingResponses = false;
      $scope.missingStuff = false;
      if ($rootScope.Setup.numOfQuestions > $rootScope.questionNumber) {
        // check for next question and progress
        $scope.q.id = $rootScope.questionNumber;
        $scope.allq[$rootScope.questionNumber - 1] = $scope.q;
        $rootScope.questionNumber += 1;
        if ($scope.allq[$rootScope.questionNumber - 1]) {
          // check if question has been populated, fill in fields
          $scope.q = $scope.allq[$rootScope.questionNumber - 1];
        } else {
          // leave fields empty
          $scope.q = {};
        }
        $location.path('/newsurvey/creating_qs');
      } else {
        // progress to survey preview
        $scope.q.id = $rootScope.questionNumber;
        $scope.allq[$rootScope.questionNumber - 1] = $scope.q;
        $rootScope.questionNumber += 1;
        $rootScope.newSurvey = {
          author: $rootScope.user._id,
          timeCreated: Date(),
          category: $scope.Setup.category,
          demographics: $scope.Setup.demographics,
          title: $scope.Setup.title,
          hypothesis: $scope.Setup.hypothesis,
          questions: $scope.allq,
          options: {},
          usersTaken: [],
        };
        $location.path('/newsurvey/preview');
      }
    } else {
      // display error message if empty field/s
      $scope.missingStuff = true;
      if (!$scope.q.type) {
        $scope.missingType = true;
      }

      if (!$scope.q.content) {
        $scope.missingContent = true;
      }

      if (!$scope.q.response) {
        $scope.missingResponses = true;
      }
    }
  };

  $scope.postNewSurvey = function () {
    // upload newly-created survey to database
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
});
