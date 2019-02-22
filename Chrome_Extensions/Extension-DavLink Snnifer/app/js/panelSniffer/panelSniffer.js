var app = angular.module('davLinkPanelSniffer', []);

app.controller('davLinkPanelSnifferCtrl', function($scope, $rootScope, $timeout) {

    /* ------------------------------------------------------------------------------------------
     | SETUP
     -------------------------------------------------------------------------------------------- */
     $scope.$VIEW = {};

     $scope.$CONFIG = {
         hover:{
             hoverReset:false
         }
     };

     $scope.$LIST = {};

     $scope.$TEMP = {};

     $scope.$STATE = {};


     /* ------------------------------------------------------------------------------------------
     | PROGRAM FUNCTIONS
     -------------------------------------------------------------------------------------------- */

     $scope.$EXECUTE = {};


     /* ------------------------------------------------------------------------------------------
     | INIT
     -------------------------------------------------------------------------------------------- */


});







chrome.devtools.panels.elements.createSidebarPane("Dav Status Bar", function(sidebar) {
    sidebar.setObject({});
});

chrome.devtools.network.onRequestFinished.addListener(function(req) {
    // Displayed sample TCP connection time here
    console.log(req.timings.connect);
});


chrome.devtools.network.onRequestFinished.addListener(request => {
    request.getContent((body) => {
        if (request.request && request.request.url) {
            if (request.request.url.includes('<url-to-intercept>')) {
                chrome.runtime.sendMessage({
                    response: body
                });
            }
        }
    });
});
