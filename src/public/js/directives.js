//  Closure
(function() {
    'use strict';


    //  Directives Module
    angular
        .module('hs4b.directives', [])
        .directive('hsfbHeader', hsfbHeader)
        .directive('hsfbLoggedinHeader', hsfbLoggedinHeader)
        .directive('hsfbLoginForm', hsfbLoginForm)
        .directive('hsfbDashboardContent', hsfbDashboardContent)
        .directive('hsfbFakeDashboardContent', hsfbFakeDashboardContent)
        .directive('showMessage', showMessage);


    //  Header directive
    function hsfbHeader() {
        var directive   =   {
            restrict        :   'E',
            templateUrl     :   '../templates/partials/header.default.html'
        };
        return directive;
    }
    //  Logged in header directive
    function hsfbLoggedinHeader() {
        var directive   =   {
           restrict    :   'E',
           templateUrl :   '../templates/partials/header.logged.html'
       };
        return directive;
    }
    //  Messages directive
    function showMessage() {
        var directive   =   {
            restrict    :   "E",
            templateUrl :   "../templates/partials/header.messages.html"
        };
        return directive;
    }
    //  Messages directive
    function hsfbLoginForm() {
        var directive   =   {
            restrict    :   "E",
            templateUrl :   "../templates/partials/login.form.html"
        };
        return directive;
    }
    function hsfbDashboardContent() {
        var directive   =   {
            restrict    :   "E",
            templateUrl :   '../templates/partials/content.dashboard.html'
        };
        return directive;
    }
    function hsfbFakeDashboardContent() {
        var directive   =   {
            restrict    :   "E",
            templateUrl :   '../templates/partials/content.fakeDashboard.html'
        };
        return directive;
    }

})();
