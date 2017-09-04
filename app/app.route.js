angular.module('creativeApp')
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: './partials/auth/auth-template.html',
                controller: 'AuthController',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                './partials/auth/auth.style.css',
                                './partials/auth/auth.controller.js'
                            ]
                        });
                    }]
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: './partials/dashboard/dashboard-template.html',
                controller: 'DashboardController',
                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            insertBefore: '#ng_load_plugins_before',
                            files: [
                                './partials/dashboard/dashboard.controller.js'
                            ]
                        });
                    }]
                }
            });
        $locationProvider.html5Mode(true);
    })
    .run(['$rootScope', '$state', '$transitions','AuthService', 'AppService', 'socket',
        function ($rootScope, $state, $transitions, AuthService, AppService, socket) {
        //get user details from server on page load
        $transitions.onStart({}, function ($transition$) {
            $rootScope.loadingImage = true;
            AuthService.getUserDetail().then(function (res) {
                $rootScope.loadingImage = false;
                var toState = $transition$.$to().name;
                AppService.setUsername(res.data.display);
                AppService.setEmail(res.data.username);
                //prevent login view once the user is logged in
                if(toState === 'login' && angular.isDefined(res.data.username)){
                    $transition$.router.stateService.transitionTo('dashboard');
                    return false;
                }
                //user is logged in
                if(angular.isDefined(res.data.username)){
                    //todo
                }
               else{
                    $transition$.router.stateService.transitionTo('login');
                    return false;
                }
            })
        });
    }]);
