var app = angular.module('davLinkHomeApp', []);

app.controller('davLinkHomeCtrl', function($scope, $rootScope, $timeout) {

    /* ------------------------------------------------------------------------------------------
     | SETUP
     -------------------------------------------------------------------------------------------- */
    $scope.$view = {
        restLength: 0
    };

    $scope.$CONFIG = {
        width: '360',
        height: '418',
        viewTabRest: false,
        viewInit: true,
        viewJsonRest: false
    };

    $scope.$list = {
        restList: []
    };

    $scope.$temp = {
        dataJsonRest: ''
    };

    $scope.$state = {
        dataJsonRest: 'Copiar Json'
    };

    /* ------------------------------------------------------------------------------------------
    | PROGRAM FUNCTIONS
    -------------------------------------------------------------------------------------------- */
    $scope.$program = {
        Listener: function() {
            chrome.storage.onChanged.addListener(function() {
                chrome.storage.sync.get(['restLength'], function(callBackStorageOnChanged) {
                    $timeout(function() {
                        $scope.$view.restLength = callBackStorageOnChanged.restLength;
                    });
                });
            });
        }
    };

    $scope.$execute = {
        windowRestList: function() {
            $scope.$CONFIG.viewJsonRest = false;
            $scope.$CONFIG.viewInit = false;
            $scope.$CONFIG.viewTabRest = true;
            $scope.$CONFIG.width = '728';
        },
        windowInit: function() {
            $scope.$CONFIG.viewJsonRest = false;
            $scope.$CONFIG.viewInit = true;
            $scope.$CONFIG.viewTabRest = false;
            $scope.$CONFIG.width = '360';
        },
        getRest: function() {
            chrome.storage.local.get(['restStorage'], function(callBackStorageLocalGet) {
                $timeout(function() {
                    if (callBackStorageLocalGet.restStorage != '') {
                        $scope.$list.restList = JSON.parse(callBackStorageLocalGet.restStorage);
                    }
                }, 1000);
            });
        },
        copyJsonRestList: function() {

            document.getElementById("dataJsonRest").select();
            document.execCommand("copy");
            $scope.$state.dataJsonRest = "Copiado!";

        },
        windowJsonRest: function(callBackwindowsJsonRest) {

            $scope.$state.dataJsonRest = "Copiar Json";
            $scope.$temp.dataJsonRest = "";
            $scope.$CONFIG.viewInit = false;
            $scope.$CONFIG.viewTabRest = false;
            $scope.$temp.dataJsonRest = JSON.stringify(callBackwindowsJsonRest.requestBody, undefined, 2);
            $scope.$CONFIG.viewJsonRest = true;

        }
    };

    /* ------------------------------------------------------------------------------------------
    | INIT
    -------------------------------------------------------------------------------------------- */
    chrome.storage.sync.get(['restLength'], function(callBackStorageOnChanged) {
        $timeout(function() {
            $scope.$view.restLength = callBackStorageOnChanged.restLength;
        });
    });

    $scope.$program.Listener();

});
