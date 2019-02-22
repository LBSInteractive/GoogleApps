/**
 * Modo estricto
 * @type {String}
 */
'use strict';

var app = angular.module('davLinkBackgroundApp', []);

app.controller('davLinkBackgroundCtrl', function($scope, $rootScope, $timeout) {

    /* ------------------------------------------------------------------------------------------
     | VAR
     -------------------------------------------------------------------------------------------- */
    /**
     * Historial Rest desde Background
     * @type {Array}
     */
    /**
     * restSize Cantidad en Rest Generados
     * @type {Number}
     */
    /**
     * Version de extension
     * @type {String}
     */
    /**
     * Filtros
     *
     * urls [String]
     * - webappletdes.davivienda.loc - Desarrollo
     * - webappletlab.davivienda.loc - Laboratorio
     * - 168.170.1.218 - Desarrollo
     * - 168.170.2.225 - Laboratorio
     * - 168.170.2.25  - Siebel Des
     * - 168.170.1.233 - Siebel Lab
     *
     * types [String]
     * - xmlhttprequest - XHR
     *
     * @type {Object}
     */
    var restStorage = [];
    var restLength = 0;
    var version = '2.0';
    const networkFilters = {
        urls: [
            "*://168.170.2.25/*", "*://168.170.1.233/*", "*://168.170.1.218/*", "*://168.170.2.225/*", "*://webappletdes.davivienda.loc/*", "*://webappletslab.davivienda.loc/*", "*://localhost/*",
        ],
        types: [
            "xmlhttprequest"
        ]
    };


    /* ------------------------------------------------------------------------------------------
     | SETUP
     -------------------------------------------------------------------------------------------- */

    $scope.$listeners = {
        onBeforeRequest: function() {}
    };

    $scope.$state = {
        onBeforeRequest: true,
        rulsNav: true
    };

    $scope.$CONFIG = {
        colorOnBeforeRequest: 'rgb(167, 241, 210)',
        colorRulsNav: 'rgb(167, 241, 210)'
    };

    /* ------------------------------------------------------------------------------------------
    | PROGRAM FUNCTIONS
    -------------------------------------------------------------------------------------------- */

    $scope.$function = {

        getVersion: function(callbackOnInstalled) {
            /**
             * Obtener version
             */
            if (callbackOnInstalled.OnInstalledReason == "update") {

                console.log("/** Extension actualizada correctamente");
                console.log("/** Version previa: [" + callbackOnInstalled.previousVersion + "]");
                console.log("/** Version actual: [" + version + "]");
                return true;

            } else if (callbackOnInstalled.OnInstalledReason != "update") {

                console.log("/** Extension instalada correctamente");
                console.log("/** Version instalada: [" + version + "]");
                return true;

            } else {

                return false;

            }
        },
        setStorage: function(obj) {
            /**
             * Guardar datos sincronizados
             */
            chrome.storage.sync.set(obj, function() {

                console.log('/** Storage Complete **/');

            });
        },
        addRules: function() {
            /**
             * Agregar reglas de activacion en extension
             */
            chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {

                chrome.declarativeContent.onPageChanged.addRules([{
                    conditions: [new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches: '(https|http)://(webappletdes\.davivienda\.loc|webappletslab\.davivienda\.loc|168\.170\.1\.218|168\.170\.2\.225|168\.170\.2\.25|168\.170\.1\.233|localhost)'
                        },
                    })],
                    actions: [new chrome.declarativeContent.ShowPageAction()]
                }], function(callBackDeclarativeContentenOnPageChaneged) {

                    if (callBackDeclarativeContentenOnPageChaneged.length == 0) {
                        console.log('/** Error Agregando Reglas **/');
                    }

                });

            });
        },
        reiniciarListener: function() {

            $scope.$CONFIG.colorOnBeforeRequest = 'rgb(242, 182, 182)';
            $scope.$state.onBeforeRequest = false;

            restStorage = [];
            restLength = 0;

            $scope.$function.setStorage({
                restStorage: restStorage,
                restLength: restLength
            });

            $scope.$function.runOnBeforeRequest();


        },
        reiniciarRulsNav: function() {

            $scope.$CONFIG.colorRulsNav = 'rgb(242, 182, 182)';
            $scope.$state.rulsNav = false;
            $scope.$function.addRules();
            $timeout(function() {
                $scope.$CONFIG.colorRulsNav = 'rgb(167, 241, 210)';
                $scope.$state.rulsNav = true;
            }, 1000);

        },
        runOnBeforeRequest: function() {

            /**
             * Referencia a funcion, para addListener y removeListener
             */
            $scope.$listeners.onBeforeRequest = function listenerOnBeforeRequest(callBackWebRequestOnBeforeRequest) {
                // Filtrar tipos Api y GetCombos
                if (callBackWebRequestOnBeforeRequest && callBackWebRequestOnBeforeRequest.url) {

                    // Eliminamos el esquema tipo Http, Https o algun otro
                    if (callBackWebRequestOnBeforeRequest.url.split("//")[1]) {

                        // Arrancamos a separar de derecha a izquierda para evitar el AccessController
                        let tempSizeRestUrl = callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/").length || -1;
                        var urlRest = null;
                        if (tempSizeRestUrl != -1) {
                            // Separamos todos los esquemas obteniendo solo el segmento luego del esquema Http, Https o otros
                            urlRest = callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl - 3] || null;
                        }

                        // Solo dejamos pasar tipos 'api'
                        if (urlRest == "api") {

                            if (callBackWebRequestOnBeforeRequest.method == "GET") {

                                let parseGetter = '';

                                if (callBackWebRequestOnBeforeRequest.url) {

                                    parseGetter = callBackWebRequestOnBeforeRequest.url.split("?")[1];

                                    // Push en arreglo
                                    restStorage.push({
                                        method: callBackWebRequestOnBeforeRequest.method,
                                        requestBody: parseGetter || '',
                                        type: 'XHR',
                                        url: callBackWebRequestOnBeforeRequest.url,
                                        nameService: (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl - 2].split("?")[0]) + " / " + (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl - 1].split("?")[0]),
                                        time: new Date(callBackWebRequestOnBeforeRequest.timeStamp)
                                    });

                                    restLength = restStorage.length;

                                    $scope.$function.setStorage({
                                        restLength: restLength,
                                        restStorage: restStorage
                                    });

                                } else {

                                    console.log("/** Error Obteniendo URL del servicio **/");

                                }

                            } else if (callBackWebRequestOnBeforeRequest.method == "POST") {

                                let parseJson = '';
                                // Verificamos que tenga un RequestBody en su XHR
                                if (callBackWebRequestOnBeforeRequest.requestBody) {

                                    if (restStorage.length == 15) {
                                        restStorage = [];
                                    }

                                    let tokenParse = false;
                                    try {
                                        JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnBeforeRequest.requestBody.raw[0].bytes))));
                                    } catch (e) {
                                        tokenParse = true;
                                        parseJson = decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnBeforeRequest.requestBody.raw[0].bytes)));
                                    }

                                    if (!tokenParse) {
                                        parseJson = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnBeforeRequest.requestBody.raw[0].bytes))));
                                    }


                                    // Push en arreglo
                                    restStorage.push({
                                        method: callBackWebRequestOnBeforeRequest.method,
                                        requestBody: parseJson || '',
                                        type: 'XHR',
                                        url: callBackWebRequestOnBeforeRequest.url,
                                        nameService: "[" + (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl - 2]) + "] / [" + (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl - 1]) + "]",
                                        time: new Date(callBackWebRequestOnBeforeRequest.timeStamp)
                                    });

                                    restLength = restStorage.length;

                                    $scope.$function.setStorage({
                                        restLength: restLength,
                                        restStorage: restStorage
                                    });

                                } else {
                                    console.log('/** Error en el RequestBody [requestBody] para el Servicio [' + callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[2] + '] **/');
                                }

                            } else {

                                console.log("/** Error identificando metodo XHR **/");

                            }

                        }

                    } else {

                        console.log('/** Error en el esquema ["*//*"] **/');

                    }

                } else {

                    console.log('/** Error validando URL del Rest**/');

                }

                let format = JSON.stringify(restStorage);
                chrome.storage.sync.set({
                    restStorage: format
                });
            }

            /**
             * Listener onBeforeRequest
             */
            chrome.webRequest.onBeforeRequest.addListener($scope.$listeners.onBeforeRequest, networkFilters, ["requestBody"]);
            $timeout(function() {
                $scope.$CONFIG.colorOnBeforeRequest = 'rgb(167, 241, 210)';
                $scope.$state.onBeforeRequest = true;
            }, 1000);

        },
        //aqui
        runOnCompleted: function() {

            /**
             * Referencia a funcion, para addListener y removeListener
             */
            $scope.$listeners.onCompleted = function listenerOnCompleted(callBackWebRequestOnCompleted) {
                // Filtrar tipos Api y GetCombos
                if (callBackWebRequestOnCompleted && callBackWebRequestOnCompleted.url) {

                    // Eliminamos el esquema tipo Http, Https o algun otro
                    if (callBackWebRequestOnCompleted.url.split("//")[1]) {

                        // Arrancamos a separar de derecha a izquierda para evitar el AccessController
                        let tempSizeRestUrl = callBackWebRequestOnCompleted.url.split("//")[1].split("/").length || -1;
                        var urlRest = null;
                        if (tempSizeRestUrl != -1) {
                            // Separamos todos los esquemas obteniendo solo el segmento luego del esquema Http, Https o otros
                            urlRest = callBackWebRequestOnCompleted.url.split("//")[1].split("/")[tempSizeRestUrl - 3] || null;
                        }

                        // Solo dejamos pasar tipos 'api'
                        if (urlRest == "api") {

                            if (callBackWebRequestOnCompleted.method == "GET") {

                                let parseGetter = '';

                                if (callBackWebRequestOnCompleted.url) {

                                    parseGetter = callBackWebRequestOnCompleted.url.split("?")[1];

                                    // Push en arreglo
                                    restStorage.push({
                                        method: callBackWebRequestOnCompleted.method,
                                        requestBody: parseGetter || '',
                                        type: 'XHR',
                                        url: callBackWebRequestOnCompleted.url,
                                        nameService: (callBackWebRequestOnCompleted.url.split("//")[1].split("/")[tempSizeRestUrl - 2].split("?")[0]) + " / " + (callBackWebRequestOnCompleted.url.split("//")[1].split("/")[tempSizeRestUrl - 1].split("?")[0]),
                                        time: new Date(callBackWebRequestOnCompleted.timeStamp)
                                    });

                                    restLength = restStorage.length;

                                    $scope.$function.setStorage({
                                        restLength: restLength,
                                        restStorage: restStorage
                                    });

                                } else {

                                    console.log("/** Error Obteniendo URL del servicio **/");

                                }

                            } else if (callBackWebRequestOnCompleted.method == "POST") {

                                let parseJson = '';
                                // Verificamos que tenga un RequestBody en su XHR
                                if (callBackWebRequestOnCompleted.requestBody) {

                                    if (restStorage.length == 15) {
                                        restStorage = [];
                                    }

                                    let tokenParse = false;
                                    try {
                                        JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnCompleted.requestBody.raw[0].bytes))));
                                    } catch (e) {
                                        tokenParse = true;
                                        parseJson = decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnCompleted.requestBody.raw[0].bytes)));
                                    }

                                    if (!tokenParse) {
                                        parseJson = JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
                                            new Uint8Array(callBackWebRequestOnCompleted.requestBody.raw[0].bytes))));
                                    }


                                    // Push en arreglo
                                    restStorage.push({
                                        method: callBackWebRequestOnCompleted.method,
                                        requestBody: parseJson || '',
                                        type: 'XHR',
                                        url: callBackWebRequestOnCompleted.url,
                                        nameService: "[" + (callBackWebRequestOnCompleted.url.split("//")[1].split("/")[tempSizeRestUrl - 2]) + "] / [" + (callBackWebRequestOnCompleted.url.split("//")[1].split("/")[tempSizeRestUrl - 1]) + "]",
                                        time: new Date(callBackWebRequestOnCompleted.timeStamp)
                                    });

                                    restLength = restStorage.length;

                                    $scope.$function.setStorage({
                                        restLength: restLength,
                                        restStorage: restStorage
                                    });

                                } else {
                                    console.log('/** Error en el RequestBody [requestBody] para el Servicio [' + callBackWebRequestOnCompleted.url.split("//")[1].split("/")[2] + '] **/');
                                }

                            } else {

                                console.log("/** Error identificando metodo XHR **/");

                            }

                        }

                    } else {

                        console.log('/** Error en el esquema ["*//*"] **/');

                    }

                } else {

                    console.log('/** Error validando URL del Rest**/');

                }

                let format = JSON.stringify(restStorage);
                chrome.storage.sync.set({
                    restStorage: format
                });
            }

            /**
             * Listener onBeforeRequest
             */
            chrome.webRequest.onCompleted.addListener($scope.$listeners.onCompleted, networkFilters, ["responseHeaders"]);
            $timeout(function() {
                $scope.$CONFIG.colorOnBeforeRequest = 'rgb(167, 241, 210)';
                $scope.$state.onBeforeRequest = true;
            }, 1000);

        }
        //aqui

    };



    /* ------------------------------------------------------------------------------------------
    | INIT
    -------------------------------------------------------------------------------------------- */

    /**
     * Init (Se Ejecuta al instalar la extension)
     * @param  {obj} destails Informacion de version y actualizacion
     */
    chrome.runtime.onInstalled.addListener(function(callbackOnInstalled) {

        /**
         * @param  {function} getVersion Si (true) - carga version, si (false) - carga version por defecto
         */
        if ($scope.$function.getVersion(callbackOnInstalled)) {

            $scope.$function.setStorage({
                version: version || '',
                restStorage: restStorage,
                restLength: restLength
            });

            $scope.$function.addRules();

            /** Inicio Sniffer **/
            $scope.$function.runOnBeforeRequest();
            $scope.$function.runOnCompleted();

        } else {

            console.log('/** Error obteniendo version **/');

        }


    });

});
