/**
 * Modo estricto
 * @type {String}
 */
'use strict';

// * - webappletdes.davivienda.loc - Desarrollo
// * - webappletlab.davivienda.loc - Laboratorio
// * - 168.170.1.218 - Desarrollo
// * - 168.170.2.225 - Laboratorio
// * - 168.170.2.25  - Siebel Des
// * - 168.170.1.233 - Siebel Lab

/* ------------------------------------------------------------------------------------------
| INIT
-------------------------------------------------------------------------------------------- */

/**
 * Init (Se Ejecuta al instalar la extension)
 * @param  {obj} destails Informacion de version y actualizacion
 */
chrome.runtime.onInstalled.addListener(function(callbackOnInstalled) {
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

});
