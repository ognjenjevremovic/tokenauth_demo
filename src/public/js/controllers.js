//  Closure
(function() {
    'use strict';


    //  Controllers module
    angular
        .module('hs4b.controllers', [
            'hs4b.services'
        ])
        .controller('LoginController', LoginController)
        .controller('DashboardController', DashboardController)
        .controller('FakeDashboardController', FakeDashboardController);


    //  Login Controller
    LoginController.$inject = ['$state', 'store', 'APIrequests', 'userService', 'messageService'];
    function LoginController($state, store, APIrequests, userService, messageService) {
        var vm  =   this;

        vm.user     =   userService.getCurrentUser();
        vm.login    =   login;

        ////////
        //  Login request
        function login() {
            APIrequests.login(vm.user)
            .then(
                //  Success
                function(response) {
                    //  Login the user
                    userService.setCurrentUser(response.data.user);
                    messageService.setSuccess_msg('Dobrodosli ' + userService.getCurrentUser().username_id);
                    $state.go('dashboard');
                },
                //  Error
                function(error) {
                    //  Display the error
                    messageService.setError_msg(error.data.errorMessage);
                });
        }
    }

    //  Dashboard Controller
    DashboardController.$inject =   ['$rootScope', 'APIrequests', 'userService', 'messageService'];
    function DashboardController($rootScope, APIrequests, userService, messageService) {
        var vm  =   this;

        vm.user         =   userService.getCurrentUser();
        vm.secret       =   null;
        vm.public       =   null;
        vm.getSecret    =   getSecret;
        vm.getPublic    =   getPublic;

        ////////
        //  Check if user is logged
        function getSecret() {
            //  Auth && Oath check
            switch (typeof userService.getCurrentUser()) {
                //  User logged in
                case 'object':
                    requestSecret();
                    break;
                //  User not logged in
                case 'undefined':
                    userService.removeCurrentUser();
                    $rootScope.$broadcast('unauthorized');
                    break;
                case 'null':
                    userService.removeCurrentUser();
                    $rootScope.$broadcast('unauthorized');
                    break;
                default:
                    userService.removeCurrentUser();
                    $rootScope.$broadcast('unauthorized');
            }
        }
        //  API request (logged in users only)
        function requestSecret() {
            return APIrequests.getSecret()
            .then(
                //  Success
                function(response) {
                    //  Login the user
                    messageService.setSuccess_msg('Zahtev prihvaćen');
                    vm.secret   =   response.data.content;
                },
                //  Error
                function(error) {
                    console.log(error);
                    //  Display the error
                    messageService.setError_msg(error.data.errorMessage);
                    if(error.status === 401) {
                        $rootScope.$broadcast('unauthorized');
                    }
                });
        }
        //  API request (everyone)
        function getPublic() {
            return APIrequests.getPublic()
            .then(
                //  Success
                function(response) {
                    console.dir(response);
                    //  Login the user
                    messageService.setSuccess_msg('Zahtev prihvaćen');
                    vm.public   =   response.data.content;
                },
                //  Error
                function(error) {
                    //  Display the error
                    messageService.setError_msg(error.data.errorMessage);
                });
        }
    }

    //  Fake dashboard Controller
    FakeDashboardController.$inject =   ['$rootScope', 'APIrequests', 'userService', 'messageService'];
    function FakeDashboardController($rootScope, APIrequests, userService, messageService) {
        var vm  =   this;

        vm.secret       =   null;
        vm.public       =   null;
        vm.getSecret    =   getSecret;
        vm.getPublic    =   getPublic;

        ////////
        //  Just for consistancy
        function getSecret() {
                requestSecret();
        }
        //  API request (logged in users only)
        function requestSecret() {
            return APIrequests.getSecret()
            .then(
                //  Success
                function(response) {
                    //  Login the user
                    messageService.setSuccess_msg('Zahtev prihvaćen');
                    vm.secret   =   response.data.content;
                },
                //  Error
                function(error) {
                    //  Display the error
                    messageService.setError_msg(error.data.errorMessage);
                });
        }
        //  API request (everyone)
        function getPublic() {
            return APIrequests.getPublic()
            .then(
                //  Success
                function(response) {
                    //  Login the user
                    messageService.setSuccess_msg('Zahtev prihvaćen');
                    vm.public   =   response.data.content;
                },
                //  Error
                function(error) {
                    //  Display the error
                    messageService.setError_msg(error.data.errorMessage);
                });
        }
    }

})();
