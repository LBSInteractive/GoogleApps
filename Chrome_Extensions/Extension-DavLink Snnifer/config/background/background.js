    /**
     * Modo estricto
     * @type {String}
     */
    'use strict';


    /* ------------------------------------------------------------------------------------------
     | Variables
     -------------------------------------------------------------------------------------------- */

    /**
     * Historial Rest desde Background
     * @type {Array}
     */
    var restStorage = [];

    /**
     * Galleta
     * @type {String}
     */
    var cookie = '';

    /**
     * restSize Cantidad en Rest Generados
     * @type {Number}
     */
    var restLength = 0;

    /**
     * Version de extension
     * @type {String}
     */
    var version = '0.0';

    /**
     * Filtros
     *
     * urls [String]
     * - webappletdes.davivienda.loc - Desarrollo
     * - webappletlab.davivienda.loc - Laboratorio
     * - 168.170.1.218 - Desarrollo
     * - 168.170.2.225 - Laboratorio
     *
     * types [String]
     * - xmlhttprequest - XHR
     *
     * @type {Object}
     */
    const networkFilters = {
        urls: [
            "*://168.170.2.25/*","*://168.170.1.233/*","*://168.170.1.218/*", "*://168.170.2.225/*", "*://webappletdes.davivienda.loc/*", "*://webappletlab.davivienda.loc/*", "*://localhost/*",
        ],
        types: [
            "xmlhttprequest"
        ]
    };


    /* ------------------------------------------------------------------------------------------
     | Funciones
     -------------------------------------------------------------------------------------------- */

    function getVersion(callbackOnInstalled) {
        /**
         * Obtener version
         */
        if (callbackOnInstalled.previousVersion) {

            version = callbackOnInstalled.previousVersion;
            return true;

        } else {

            return false;

        }
    }

    function setStorage(obj) {
        /**
         * Guardar datos sincronizados
         */
        chrome.storage.sync.set(obj, function() {

            console.log('/** Storage Complete **/');

        });
    }


    function addRules() {
        /**
         * Agregar reglas de activacion en extension
         */
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {

            chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: '(https|http)://(webappletdes\.davivienda\.loc|webappletlab\.davivienda\.loc|168\.170\.1\.218|168\.170\.2\.225|168\.170\.2\.25|168\.170\.1\.233|localhost)'
                    },
                })],
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }], function(callBackDeclarativeContentenOnPageChaneged) {

                if (callBackDeclarativeContentenOnPageChaneged.length == 0) {
                    console.log('/** Error Agregando Reglas **/');
                }

            });

        });
    }

    function runSniffer() {

        /**
         * Listener onBeforeRequest
         */
        chrome.webRequest.onBeforeRequest.addListener((callBackWebRequestOnBeforeRequest) => {

            // Filtrar tipos Api y GetCombos
            if (callBackWebRequestOnBeforeRequest && callBackWebRequestOnBeforeRequest.url) {

                // Eliminamos el esquema tipo Http, Https o algun otro
                if (callBackWebRequestOnBeforeRequest.url.split("//")[1]) {

                    // Arrancamos a separar de derecha a izquierda para evitar el AccessController
                    let tempSizeRestUrl = callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/").length || -1;
                    var urlRest = null;
                    if (tempSizeRestUrl != -1) {
                        // Separamos todos los esquemas obteniendo solo el segmento luego del esquema Http, Https o otros
                        urlRest = callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl-3] || null;
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
                                    nameService: (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl-2].split("?")[0]) + " / " + (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl-1].split("?")[0]),
                                    time: new Date(callBackWebRequestOnBeforeRequest.timeStamp)
                                });

                                restLength = restStorage.length;

                                setStorage({
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

                                if (restStorage.length == 10) {
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
                                    nameService: (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl-2]) + " / " + (callBackWebRequestOnBeforeRequest.url.split("//")[1].split("/")[tempSizeRestUrl-1]),
                                    time: new Date(callBackWebRequestOnBeforeRequest.timeStamp)
                                });

                                restLength = restStorage.length;

                                setStorage({
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
            chrome.storage.local.set({
                restStorage: format
            });

        }, networkFilters, ["requestBody", "blocking"]);
    }

    /* ------------------------------------------------------------------------------------------
     | Listener
     -------------------------------------------------------------------------------------------- */

    /**
     * Init (Se Ejecuta al instalar la extension)
     * @param  {obj} destails Informacion de version y actualizacion
     */
    chrome.runtime.onInstalled.addListener(function(callbackOnInstalled) {


        /**
         * @param  {function} getVersion Si (true) - carga version, si (false) - carga version por defecto
         */
        if (getVersion(callbackOnInstalled)) {

            setStorage({
                version: version || '',
                restStorage: restStorage,
                cookie: cookie,
                restLength: restLength
            });

            addRules();

            /** Inicio Sniffer **/
            runSniffer();

        } else {

            console.log('/** Error obteniendo version **/');

        }


    });
