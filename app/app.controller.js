angular.module('creativeApp')
    .controller('AppController', AppController);

AppController.$inject = ['$scope'];

function AppController($scope) {
    $scope.$on('title:updated',function (event, data) {
        $scope.pageTitle = data.pageTitle;
    });
}