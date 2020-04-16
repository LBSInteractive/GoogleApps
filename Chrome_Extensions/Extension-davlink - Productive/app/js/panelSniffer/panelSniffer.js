var app = angular.module('davLinkPanelSniffer', []);


app.directive('gnModal', function() {
    return {
        restrict: 'E',
        priority: 100,
        terminal: true,
        templateUrl: '/config/directive/template/modal.html',
        replace: true,
        scope: {
            data: '=',
            ngIf: '=',
            power: '='
        },
        transclude: false,
        controller: function($scope, $element, $attrs, $transclude, $timeout) {

            $scope.$CONFIG = {
                copy: {
                    color: ''
                }
            };

            $scope.$STATE = {
                oprimir: false
            };

            $scope.$EXECUTE = {
                select: function() {
                    $scope.$STATE.oprimir = true;
                    let copyText = document.querySelector("#jsonArea");
                    copyText.select();
                    document.execCommand("copy");
                    $scope.$CONFIG.copy.color = 'rgb(106, 230, 152)';
                },
                carga: function() {
                    $scope.$TEMP = {
                        restData: $scope.data
                    };
                    $scope.power = false;
                }
            };

            $scope.$EXECUTE.carga();
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
        carga: false,
        popup: false
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

                        status = callBackOnRequestFinished.response.status || '';

                        request = callBackOnRequestFinished.request && callBackOnRequestFinished.request.queryString ? (function() {
                            var toJson = null;
                            toJson = '';
                            try {
                                toJson = JSON.parse(callBackOnRequestFinished.request.queryString);
                            } catch (e) {
                                try {
                                    let preDatos = CryptoJS.enc.Base64.parse(callBackOnRequestFinished.request.queryString),
                                        datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                    if (datos != null && datos[0] && datos[1] && datos[2]) {
                                        let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                            mode: CryptoJS.mode.CTR,
                                            padding: CryptoJS.pad.NoPadding,
                                            iv: CryptoJS.enc.Base64.parse(datos[2])
                                        });
                                        let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                        toJson = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                    }
                                } catch (e) {
                                    toJson = callBackOnRequestFinished.request.queryString;
                                }
                            }
                            return toJson;
                        }()) : '';

                        callBackOnRequestFinished.getContent((body) => {
                            if (callBackOnRequestFinished.response) {
                                try {
                                    response = JSON.parse(body);
                                } catch (err) {
                                    try {
                                        let preDatos = CryptoJS.enc.Base64.parse(body),
                                            datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                        if (datos != null && datos[0] && datos[1] && datos[2]) {
                                            let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                                mode: CryptoJS.mode.CTR,
                                                padding: CryptoJS.pad.NoPadding,
                                                iv: CryptoJS.enc.Base64.parse(datos[2])
                                            });
                                            let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                            response = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                        }
                                    } catch (e) {
                                        response = body;
                                    }
                                }
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

                    request = callBackOnRequestFinished.request.postData && callBackOnRequestFinished.request.postData.text ? (function() {
                        var toJson = null;
                        toJson = '';
                        try {
                            toJson = JSON.parse(callBackOnRequestFinished.request.postData.text);
                        } catch (e) {
                            try {
                                let preDatos = CryptoJS.enc.Base64.parse(callBackOnRequestFinished.request.postData.text),
                                    datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                if (datos != null && datos[0] && datos[1] && datos[2]) {
                                    let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                        mode: CryptoJS.mode.CTR,
                                        padding: CryptoJS.pad.NoPadding,
                                        iv: CryptoJS.enc.Base64.parse(datos[2])
                                    });
                                    let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                    toJson = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                }
                            } catch (e) {
                                toJson = callBackOnRequestFinished.request.postData.text;
                            }
                        }
                        return toJson;

                    }()) : '';

                    callBackOnRequestFinished.getContent((body) => {
                        if (callBackOnRequestFinished.response) {
                            try {
                                response = JSON.parse(body);
                            } catch (err) {
                                try {
                                    let preDatos = CryptoJS.enc.Base64.parse(body),
                                        datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                    if (datos != null && datos[0] && datos[1] && datos[2]) {
                                        let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                            mode: CryptoJS.mode.CTR,
                                            padding: CryptoJS.pad.NoPadding,
                                            iv: CryptoJS.enc.Base64.parse(datos[2])
                                        });
                                        let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                        response = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                    }
                                } catch (e) {
                                    response = body;
                                }
                            }
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

                } else if (callBackOnRequestFinished.request.url.includes("actualizaSiebel")) {

                    let api = '',
                        servicio = '',
                        metodo = '',
                        responseHeader = '',
                        request = {},
                        response = {},
                        status = '',
                        time = '';

                    time = $filter('date')(callBackOnRequestFinished.startedDateTime, 'short');

                    api = 'actualizaSiebel';

                    servicio = 'Siebel';

                    metodo = callBackOnRequestFinished.request.method || '';

                    status = callBackOnRequestFinished.response.status || '';

                    responseHeader = $filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    }).length != 0 ? ($filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    })[0].value) : "";

                    request = callBackOnRequestFinished.request.postData && callBackOnRequestFinished.request.postData.text ? (function() {
                        var toJson = null;
                        toJson = '';
                        try {
                            toJson = JSON.parse(callBackOnRequestFinished.request.postData.text);
                        } catch (e) {
                            try {
                                let preDatos = CryptoJS.enc.Base64.parse(callBackOnRequestFinished.request.postData.text),
                                    datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                if (datos != null && datos[0] && datos[1] && datos[2]) {
                                    let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                        mode: CryptoJS.mode.CTR,
                                        padding: CryptoJS.pad.NoPadding,
                                        iv: CryptoJS.enc.Base64.parse(datos[2])
                                    });
                                    let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                    toJson = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                }
                            } catch (e) {
                                toJson = callBackOnRequestFinished.request.postData.text;
                            }
                        }
                        return toJson;
                    }()) : '';

                    callBackOnRequestFinished.getContent((body) => {
                        if (callBackOnRequestFinished.response) {
                            try {
                                response = JSON.parse(body);
                            } catch (err) {
                                try {
                                    let preDatos = CryptoJS.enc.Base64.parse(body),
                                        datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                    if (datos != null && datos[0] && datos[1] && datos[2]) {
                                        let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                            mode: CryptoJS.mode.CTR,
                                            padding: CryptoJS.pad.NoPadding,
                                            iv: CryptoJS.enc.Base64.parse(datos[2])
                                        });
                                        let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                        response = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                    }
                                } catch (e) {
                                    response = body;
                                }
                            }
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

                } else if (callBackOnRequestFinished.request.url.includes("ReportesPDF-api")) {

                    let api = '',
                        servicio = '',
                        metodo = '',
                        responseHeader = '',
                        request = {},
                        response = {},
                        status = '',
                        time = '';

                    time = $filter('date')(callBackOnRequestFinished.startedDateTime, 'short');

                    api = callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1] && callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1].split("/")[0] ? callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1].split("/")[0] : '';

                    servicio = callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1] && callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1].split("/")[0] ? callBackOnRequestFinished.request.url.split("/ReportesPDF-api/")[1].split("/")[1] : '';

                    metodo = callBackOnRequestFinished.request.method || '';

                    status = callBackOnRequestFinished.response.status || '';

                    responseHeader = $filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    }).length != 0 ? ($filter('filter')(callBackOnRequestFinished.response.headers, {
                        name: "Respuesta"
                    })[0].value) : "";

                    request = callBackOnRequestFinished.request.postData && callBackOnRequestFinished.request.postData.text ? (function() {
                        var toJson = null;
                        toJson = '';
                        try {
                            toJson = JSON.parse(callBackOnRequestFinished.request.postData.text);
                        } catch (e) {
                            try {
                                let preDatos = CryptoJS.enc.Base64.parse(callBackOnRequestFinished.request.postData.text),
                                    datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                if (datos != null && datos[0] && datos[1] && datos[2]) {
                                    let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                        mode: CryptoJS.mode.CTR,
                                        padding: CryptoJS.pad.NoPadding,
                                        iv: CryptoJS.enc.Base64.parse(datos[2])
                                    });
                                    let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                    toJson = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                }
                            } catch (e) {
                                toJson = callBackOnRequestFinished.request.postData.text;
                            }
                        }
                        return toJson;

                    }()) : '';

                    callBackOnRequestFinished.getContent((body) => {
                        if (callBackOnRequestFinished.response) {
                            try {
                                response = JSON.parse(body);
                            } catch (err) {
                                try {
                                    let preDatos = CryptoJS.enc.Base64.parse(body),
                                        datos = preDatos.toString(CryptoJS.enc.Utf8).split("::");
                                    if (datos != null && datos[0] && datos[1] && datos[2]) {
                                        let bytes = CryptoJS.AES.decrypt(datos[0], CryptoJS.enc.Base64.parse(datos[1]), {
                                            mode: CryptoJS.mode.CTR,
                                            padding: CryptoJS.pad.NoPadding,
                                            iv: CryptoJS.enc.Base64.parse(datos[2])
                                        });
                                        let decryptedData = bytes.toString(CryptoJS.enc.Utf8);
                                        response = decryptedData != '' ? JSON.parse(decryptedData) : '';
                                    }
                                } catch (e) {
                                    response = body;
                                }
                            }
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
                }
            } else {
                console.log('/** Error en URL del servicio **/');
            }
        },
        resetReg: function() {
            $scope.$LIST.servicios = [];
        },
        dataRestConfig: function(sender) {
            $scope.$STATE.carga = true;
            $timeout(function() {
                $scope.$STATE.popup = true;
                $scope.$TEMP.restData = '';
                $scope.$TEMP.restData = sender;
            }, 500);
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
