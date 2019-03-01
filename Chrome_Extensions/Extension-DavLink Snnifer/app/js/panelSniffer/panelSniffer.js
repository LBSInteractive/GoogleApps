var app = angular.module('davLinkPanelSniffer', []);


app.directive('gnModal', function() {
    return {
        restrict: 'E',
        priority: 100,
        terminal: true,
        templateUrl: '/config/directive/template/modal.html',
        replace: false,
        scope: {
            power: '=?',
            data: '=?'
        },
        transclude: false,
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.$TEMP = {
                restData: $scope.data
            };
        }
    }
});

app.controller('davLinkPanelSnifferCtrl', function($scope, $rootScope, $timeout, $filter) {

    /* ------------------------------------------------------------------------------------------
     | SETUP
     -------------------------------------------------------------------------------------------- */
    $scope.$VIEW = {};

    $scope.$CONFIG = {
        hover: {
            hoverReset: false
        }
    };

    $scope.$LIST = {
        servicios: []
    };

    $scope.$TEMP = {
        restData: ''
    };

    $scope.$STATE = {
        modalRest: 'none'
    };


    /* ------------------------------------------------------------------------------------------
    | PROGRAM FUNCTIONS
    -------------------------------------------------------------------------------------------- */

    $scope.$EXECUTE = {
        requestGetType: function(callBackOnRequestFinished) {
            // Ruta GET
            if (callBackOnRequestFinished.request.url) {
                if (callBackOnRequestFinished.request.url.split("/api/").length > 1) {
                    if (callBackOnRequestFinished.request.url.split("/api/")[1].split("?").length == 2) {
                        // Obtenemos el trozo de describe el api
                        let api = '',
                            servicio = '',
                            metodo = '',
                            responseHeader = '',
                            request = {},
                            response = {},
                            status = '',
                            time = '';

                        time = $filter('date')(callBackOnRequestFinished.startedDateTime, 'short');

                        api = callBackOnRequestFinished.request.url.split("/api/")[1].split("?")[0].split("/")[callBackOnRequestFinished.request.url.split("/api/")[1].split("?")[0].split("/").length - 2] || '';

                        servicio = callBackOnRequestFinished.request.url.split("/api/")[1].split("?")[0].split("/")[callBackOnRequestFinished.request.url.split("/api/")[1].split("?")[0].split("/").length - 1] || '';

                        metodo = callBackOnRequestFinished.request.method || '';

                        responseHeader = $filter('filter')(callBackOnRequestFinished.response.headers, {
                            name: "Respuesta"
                        }).length != 0 ? ($filter('filter')(callBackOnRequestFinished.response.headers, {
                            name: "Respuesta"
                        })[0].value) : "";

                        request = callBackOnRequestFinished.request.queryString ? JSON.stringify(callBackOnRequestFinished.request.queryString, 0, 2) : '';

                        status = callBackOnRequestFinished.response.status || '';

                        callBackOnRequestFinished.getContent((body) => {

                            if (callBackOnRequestFinished.request) {
                                response = body;
                            }

                            $timeout(function() {
                                $scope.$LIST.servicios.push({
                                    status: status,
                                    metodo: metodo,
                                    responseHeader: responseHeader,
                                    api: api,
                                    servicio: servicio,
                                    request: request,
                                    response: response,
                                    time: time
                                });
                            }, 0);

                        });

                    } else {
                        console.log('/** La API no está bajo control del Sniffer **/');
                    }
                }
            } else {
                console.log('/** Error en URL del servicio **/');
            }
        },
        requestPostType: function(callBackOnRequestFinished) {
            // Ruta por POST
            if (callBackOnRequestFinished.request.url) {
                if (callBackOnRequestFinished.request.url.split("/api/").length > 1) {

                    let api = '',
                        servicio = '',
                        metodo = '',
                        responseHeader = '',
                        request = {},
                        response = {},
                        status = '',
                        time = '';

                    time = $filter('date')(callBackOnRequestFinished.startedDateTime, 'short');

                    api = callBackOnRequestFinished.request.url.split("/api/")[1] && callBackOnRequestFinished.request.url.split("/api/")[1].split("/")[0] ? callBackOnRequestFinished.request.url.split("/api/")[1].split("/")[0] : '';

                    servicio = callBackOnRequestFinished.request.url.split("/api/")[1] && callBackOnRequestFinished.request.url.split("/api/")[1].split("/")[0] ? callBackOnRequestFinished.request.url.split("/api/")[1].split("/")[1] : '';

                    metodo = callBackOnRequestFinished.request.method || '';

                    status = callBackOnRequestFinished.response.status || '';

                    responseHeader = $filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    }).length != 0 ? ($filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    })[0].value) : "";

                    request = callBackOnRequestFinished.request.postData && callBackOnRequestFinished.request.postData.text ?  JSON.stringify(JSON.parse(callBackOnRequestFinished.request.postData.text),0,2) : '';

                    callBackOnRequestFinished.getContent((body) => {

                        if (callBackOnRequestFinished.request) {
                            response = body;
                        }

                        $timeout(function() {
                            $scope.$LIST.servicios.push({
                                status: status,
                                metodo: metodo,
                                responseHeader: responseHeader,
                                api: api,
                                servicio: servicio,
                                request: request,
                                response: response,
                                time: time
                            });
                        }, 0);

                    });


                } else if (callBackOnRequestFinished.request.url.split("/api/").length == 1) {
                    if (callBackOnRequestFinished.request.url.split("/api/")[0].split("//")[1] && callBackOnRequestFinished.request.url.split("/api/")[0].split("//")[1].split("/")[1] && callBackOnRequestFinished.request.url.split("/api/")[0].split("//")[1].split("/")[1] == 'actualizaSiebel') {
                        let api = '',
                            servicio = '',
                            metodo = '',
                            responseHeader = '',
                            request = {},
                            response = {},
                            status = '',
                            time = '';

                        time = $filter('date')(callBackOnRequestFinished.startedDateTime, 'short');

                        api = callBackOnRequestFinished.request.url.split("/api/")[0].split("//")[1].split("/")[1] || '';

                        servicio = 'Siebel';

                        metodo = callBackOnRequestFinished.request.method || '';

                        status = callBackOnRequestFinished.response.status || '';

                        request = callBackOnRequestFinished.request.postData && callBackOnRequestFinished.request.postData.text && JSON.parse(callBackOnRequestFinished.request.postData.text).request[0] && JSON.parse(callBackOnRequestFinished.request.postData.text).request[0].comments && JSON.parse(callBackOnRequestFinished.request.postData.text).request[0].srNumber ? (JSON.parse(callBackOnRequestFinished.request.postData.text).request[0].comments + ' [' + JSON.parse(callBackOnRequestFinished.request.postData.text).request[0].srNumber + ']') : '';

                        $timeout(function() {
                            $scope.$LIST.servicios.push({
                                status: status,
                                metodo: metodo,
                                responseHeader: responseHeader,
                                api: api,
                                servicio: servicio,
                                request: request,
                                response: '',
                                time: time
                            });
                        }, 0);

                    }
                }
            } else {
                console.log('/** Error en URL del servicio **/');
            }
        },
        resetReg: function() {
            $scope.$LIST.servicios = [];
        },
        dataRestConfig: function(sender) {
            $scope.$STATE.modalRest = 'block';
            $scope.$TEMP.restData = '';
            $scope.$TEMP.restData = sender;
        }
    };


    /* ------------------------------------------------------------------------------------------
    | INIT
    -------------------------------------------------------------------------------------------- */

    // Notificamos arranque de panelSniffer
    chrome.devtools.panels.elements.createSidebarPane("Dav Status Bar", function(sidebar) {
        sidebar.setObject({
            'Status': 'On'
        }, 'Estado del Sniffer');
    });

    // Inicio de panelSniffer
    chrome.devtools.network.onRequestFinished.addListener(callBackOnRequestFinished => {

        if (callBackOnRequestFinished.request && callBackOnRequestFinished.request.method && callBackOnRequestFinished.request.method == 'POST') {

            $scope.$EXECUTE.requestPostType(callBackOnRequestFinished);


        } else if (callBackOnRequestFinished.request && callBackOnRequestFinished.request.method && callBackOnRequestFinished.request.method == 'GET') {

            $scope.$EXECUTE.requestGetType(callBackOnRequestFinished);

        }

    });

});
