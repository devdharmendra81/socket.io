angular.module('creativeApp')
    .factory('AuthService', AuthService);

AuthService.$inject = ['$http', 'ApiConstant'];

function AuthService($http, ApiConstant) {
    var authService = {};

    authService.loginApi = loginApi;
    authService.signupApi = signupApi;
    authService.getUserDetail = getUserDetail;
    authService.logout = logout;

    // api for login
    function loginApi(postData) {
        return $http({
            method: 'POST',
            url: ApiConstant.URL.api + ApiConstant.API_URL.login,
            data: JSON.stringify(postData)
        });
    }

    // api for signup
    function signupApi(postData) {
        return $http({
            method: 'POST',
            data: JSON.stringify(postData),
            url: ApiConstant.URL.api + ApiConstant.API_URL.signUp
        });
    }

    // api for signup
    function getUserDetail() {
        return $http({
            method: 'GET',
            url: ApiConstant.URL.api + ApiConstant.API_URL.me
        });
    }

    //api for logout
    function logout() {
        return $http({
            method: 'GET',
            url: ApiConstant.URL.api + ApiConstant.API_URL.logout
        });
    }

    return authService;
}