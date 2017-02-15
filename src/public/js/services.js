//  Closure
(function() {
    'use strict';


    //  Services module
    angular
        .module('hs4b.services', [
            'hs4b.constants',
            'angular-storage'
        ])
        .factory('userService', userService)
        .factory('messageService', messageService)
        .factory('APIrequests', APIrequests)
        .factory('APIInterceptor', APIInterceptor);


    //  User Service
    userService.$inject = ['store', '$rootScope'];
    function userService(store, $rootScope) {

        var service = {
            getCurrentUser      :   getCurrentUser,
            setCurrentUser      :   setCurrentUser,
            removeCurrentUser   :   removeCurrentUser
        };
        return service;

        ////////
        //  Set user object (token)
        function setCurrentUser(user) {
            store.set('user', user);
        }
        //  Return user object (token)
        function getCurrentUser() {
            var _user;
            var _currentUser = store.get('user');
            if(_currentUser) {
                switch (_currentUser.sessionExpiration < Date.now()) {
                    //  Token expired
                    case true:
                    store.remove('user');
                    _user   =   null;
                    $rootScope.$broadcast('unauthorized');
                    break;
                    //  Token is valid
                    case false:
                    _user   =   _currentUser;
                    break;
                    default:
                    store.remove('user');
                    _user   =   null;
                    $rootScope.$broadcast('unauthorized');
                }
            }
            return _user;
        }
        //  Remove user (logout)
        function removeCurrentUser() {
            store.remove('user');
            $rootScope.$broadcast('unauthorized');
        }
    }

    //  Message service
    messageService.$inject  =   ['$rootScope'];
    function messageService($rootScope) {

        var service = {
            setSuccess_msg  :   setSuccess_msg,
            getSuccess_msg  :   getSuccess_msg,
            setError_msg    :   setError_msg,
            getError_msg    :   getError_msg
        };
        return service;

        ////////
        //  Success message setter
        function setSuccess_msg(message) {
            $rootScope.successMessage = message;
            setTimeout(function() {
                $rootScope.successMessage = null;
            }, 500);
        }
        //  Success message getter
        function getSuccess_msg() {
            return successMsg;
        }
        //  Error message setter
        function setError_msg(message) {
            $rootScope.errorMessage = message;
            setTimeout(function() {
                $rootScope.errorMessage = null;
            }, 500);
        }
        //  Success message getter
        function getError_msg() {
            return errorMessage;
        }
    }

    //  APIrequest service
    APIrequests.$inject =   ['$http', 'userService', 'LOGIN_API', 'TEST_LOGIN_API', 'SECRET_API', 'PUBLIC_API'];
    function APIrequests($http, userService, LOGIN_API, TEST_LOGIN_API, SECRET_API, PUBLIC_API) {

        var service = {
            login       :   login,
            getSecret   :   getSecret,
            getPublic   :   getPublic,
            testLogin   :   testLogin
        };
        return service;

        ////////
        //  Login request [POST] => Promise
        function login(user) {
            return $http.post(LOGIN_API, user);
        }
        //  Test if logged in
        function testLogin() {
            return $http.get(TEST_LOGIN_API);
        }
        //  Get public info [GET] => promise
        function getPublic() {
            return $http.get(PUBLIC_API);
        }
        //  Get secret (only logged in users) [GET] => promise
        function getSecret() {
            var req     =   {
                method: 'GET',
                url: SECRET_API,
                headers: {
                  'x-access-token': (userService.getCurrentUser()) ? userService.getCurrentUser().token : ''
                }
            };
            return $http(req);
        }
    }

    //  APIInterceptor service
    APIInterceptor.$inject  =   ['$rootScope', 'userService', 'messageService'];
    function APIInterceptor($rootScope, userService, messageService) {

        var service =   {
            request         :   request,
            responseError   :   responseError
        };
        return service;

        ////////
        //  Intercept request and add token auth
        function request (config) {
            var _currentUser = userService.getCurrentUser(),
                _access_token = _currentUser ? _currentUser.token : null;
            //  User logged in
            if (_access_token) {
                config.headers['x-access-token'] = access_token;
            //  User not logged in
            } else {
                config.headers['x-access-token'] = null;
            }
            return config;
        }

        //  response.code === 401 (unauthorized)
        function responseError(response) {
            if (response.status === 401) {
                userService.removeCurrentUser();
                messageService.setError_msg(response.data.errorMessage);
                $rootScope.$broadcast('displayMessage', 'error');
            }
            return response;
        }

    }

})();
