angular.module('creativeApp')
    .controller('AuthController', AuthController);

AuthController.$inject = ['$scope', '$rootScope', 'AuthService', '$state', 'AppService'];

function AuthController($scope, $rootScope, AuthService, $state, AppService) {
    //variables
    $scope.user = {
        username: null,
        password: null,
        email: null
    };
    $scope.passwordMismatch = false;
    $scope.isResetSuccess = false;
    $scope.resetSuccessMsg = null;
    $scope.isResetFailed = false;
    $scope.resetFailedsMsg = null;
    $scope.loginErrorMsg = null;
    $scope.signupErrorMsg = null;

    //methods declaration
    $scope.resetUserModel = resetUserModel;
    $scope.signIn = signIn;
    $scope.signUp = signUp;
    $scope.resetPassword = resetPassword;
    $scope.clickSignInLink = clickSignInLink;
    $scope.clickSignUpLink = clickSignUpLink;
    $scope.clickForgetPasswordLink = clickForgetPasswordLink;
    //set page title
    AppService.setPageTitle('Xcel Media Group | Login');

    //method definition
    function resetUserModel() {
        $scope.user = {
            username: null,
            password: null
        };
    }

    function signIn() {
        $rootScope.loadingImage = true;
        $scope.loginErrorMsg = null;

        var postData = {
            username: $scope.user.username,
            password: $scope.user.password
        };
        AuthService.loginApi(postData).then(function (response) {
                AppService.setUsername(response.data.username);
                $state.go('dashboard');
            })
            .catch(function (err) {
                $scope.loginErrorMsg = err.data.message;
            })
            .finally(function () {
                $rootScope.loadingImage = false;
            });
    }

    function signUp() {
        if ($scope.user.password !== $scope.confirmPassword) {
            $scope.passwordMismatch = true;
            return;
        }
        $scope.signupErrorMsg = null;
        $scope.passwordMismatch = false;
        $rootScope.loadingImage = true;

        var postData = {
            username: $scope.user.username,
            password: $scope.user.password,
            email : $scope.user.email
        };
        AuthService.signupApi(postData).then(function (response) {
                $state.go('dashboard');
            })
            .catch(function (err) {
                $scope.signupErrorMsg = err.data.message;
            })
            .finally(function () {
                $rootScope.loadingImage = false;
         });
    }

    function resetPassword() {
        //todo: show the reset message on password reset
        alert('Todo reset password');
    }

    //show sign in form
    function clickSignInLink() {
        $scope.resetUserModel();
        $scope.loginErrorMsg = null;
        $scope.signInForm.$setPristine();
        $scope.signInForm.$setUntouched();
    }

    //show register form
    function clickSignUpLink() {
        $scope.resetUserModel();
        $scope.signupErrorMsg = null;
        $scope.confirmPassword = '';
        $scope.passwordMismatch = false;
        $scope.signUpForm.$setPristine();
        $scope.signUpForm.$setUntouched();
    }

    //show reset password form
    function clickForgetPasswordLink() {
        $scope.resetUserModel();
        $scope.resetForm.$setPristine();
        $scope.resetForm.$setUntouched();
    }

}