//  Closure
(function() {
    'use strict';


    //  Application Module
    angular
        .module('hs4b', [
            //  Angular dependancies
            'ui.router',
            'angular-storage',
            //  Custom dependancies
            'hs4b.constants',
            'hs4b.services',
            'hs4b.controllers',
            'hs4b.directives'
        ])
        .config(moduleConfiguration)
        .run(moduleRun);


    //  Configuration Block
    moduleConfiguration.$inject =   ["$stateProvider", "$urlRouterProvider"];
    function moduleConfiguration($stateProvider, $urlRouterProvider) {

        $stateProvider
            // Define the home state (view)
            .state('login', {
                url             :   '/login',
                templateUrl     :   'templates/login.html',
                controller      :   'LoginController',
                controllerAs    :   'login',
                data: {
                    requiresLogin   :   false
                }
            })
            // Define the dashboard state (view)
            .state('dashboard', {
                url             :   '/dashboard',
                templateUrl     :   'templates/dashboard.html',
                controller      :   'DashboardController',
                controllerAs    :   'dashboard',
                data    : {
                    requiresLogin   :   true
                }
            })
            // Define the not logged state (view)
            .state('notlogged', {
                url             :   '/notlogged',
                templateUrl     :   'templates/notLogged.html',
                controller      :   'FakeDashboardController',
                controllerAs    :   'dashboard',
                data    : {
                    requiresLogin   :   false
                }
            });

            // Default state
            $urlRouterProvider.otherwise('/login');

    }

    //  Run Block
    moduleRun.$inject   =   ["$state", "$rootScope", "userService", "messageService", "APIrequests"];
    function moduleRun($state, $rootScope, userService, messageService, APIrequests) {

        // Check if the state is login protected (requires login)
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            var requiresLogin = toState.data.requiresLogin;
            //  User is not logged in (forbid dahsboard)
            if (requiresLogin && !userService.getCurrentUser()) {
                messageService.setError_msg('Molimo Vas prvo pristupite Vasem nalogu, kako biste nastavili');
                event.preventDefault();
                $state.go('login');
            }
            //  User is logged in (forbid login)
            if(!requiresLogin && userService.getCurrentUser()) {
                event.preventDefault();
                $state.go('dashboard');
            }
        });

        //  'unauthorized' event
        $rootScope.$on('unauthorized', function (event, toState) {
            event.preventDefault();
            if(userService.getCurrentUser()) {
                userService.removeCurrentUser();
            }
            $state.go('login');
        });

    }

})();
