var app = angular.module('crowddata')
  .controller('mainController', function ($scope, $http, $location, $route, $rootScope, goToService) {
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
    $scope.readyForSurvey = false;

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

    $scope.newSurvey = function () {
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
        user_id:$scope.user._id,
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
