angular.module('creativeApp')
    .service('AppService', AppService);

AppService.$inject = ['$rootScope'];

function AppService($rootScope) {
    this.appData = {};

    this.setPageTitle = function (title) {
        this.appData.pageTitle = title;
        $rootScope.$broadcast('title:updated', this.appData);
    };
    this.getPageTitle = function () {
        return this.appData.pageTitle;
    };

    this.setEmail = function (email) {
        this.appData.email = email;
    };
    this.getEmail = function () {
        return this.appData.email;
    };

    this.setUsername = function (username) {
        this.appData.username = username;
    };
    this.getUsername = function () {
        return this.appData.username;
    };
}