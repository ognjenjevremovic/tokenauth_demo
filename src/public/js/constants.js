//  Closure
(function() {
    'use strict';


    //  Constants Module
    angular
        .module('hs4b.constants', [])
        .constant('LOGIN_API', 'http://localhost:3000/api/user/login')
        .constant('TEST_LOGIN_API', 'http://localhost:3000/api/users/testLogin')
        .constant('SECRET_API', 'http://localhost:3000/api/content/locked')
        .constant('PUBLIC_API', 'http://localhost:3000/api/content/public');

})();
