angular.module("creativeApp")
    .constant('ApiConstant', {
        URL: {
            api: 'http://localhost:3001/api'
        },
        API_URL: {
            login: '/user/signin',
            me: '/user/me',
            signUp: '/user/signup',
            logout: '/user/logout'
        }
    });