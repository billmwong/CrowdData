var app = angular.module('crowddata')
  .controller('headerController', function ($scope, $rootScope, $location, $http, $route, goToService) {
    $scope.logout = function () {
      // $rootScope.loading is used to show/hide circular loading animation
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
