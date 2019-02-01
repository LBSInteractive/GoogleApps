'use strict';


var app = angular.module('davLinkBackgroundApp', []);

app.controller('davLinkBackgroundCtrl', function($scope, $rootScope) {

});

/*************************************************Variables*/
var restStorage = [];
var cookies = '';
var restSize = 0;
const networkFilters = {
  urls: [
    "*://localhost/*"
  ],
  types: [
    "xmlhttprequest"
  ]
};

/**********************************************************/

/**
 * Arranque de instalación
 * @param  {obj} destails Retorna versión previa ext
 */
chrome.runtime.onInstalled.addListener(function(destails) {

  chrome.cookies.getAll({
    name: 'io'
  }, function(callback) {
    if (callback) {
      cookies = callback[0].value;
    } else {
      console.log('Error Obteniendo [cookies]');
    }
  });

  /**
   * Variables Locales (Bind)
   * @type {obj}
   */
  chrome.storage.local.set({
    version: destails.previousVersion,
    restStorage: restStorage,
    cookies: cookies,
    restSize: restSize
  }, function() {
    console.log('Storage Complete')
  });

  /**
   * Reglas para activacion de extension
   * @return {[type]} [description]
   */
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlMatches: '(https|http)://(localhost|127\.0\.0\.1|webappletdes\.davivienda\.loc|webappletlab\.davivienda\.loc|168\.170\.1\.218|168\.170\.2\.225)'
        },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }], function(details) {

      /**
       * En el callback podemos evidenciar el correcto cargue de reglas
       * @type {[type]}
       */
      let log = details.length == 0 ? true : false;
      // Informar si tenemos problemas al cargar la extension
      if (log) {
        console.log('Error agregando reglas');
      }
    });
  });

  /**
   * Listener onBeforeRequest
   * @type {obj}
   */
  chrome.webRequest.onBeforeRequest.addListener((details) => {

    chrome.storage.local.set({
      restSize: restStorage.length
    });

    // Filter service API and getCombos
    if (details && details.url) {

      if (details.url.split("//")[1]) {
        let urlRest = details.url.split("//")[1].split("/")[1] || null;

        if (urlRest == "api") {

          if (details.requestBody) {
            restStorage.push({
              method: details.method,
              requestBody: JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
                new Uint8Array(details.requestBody.raw[0].bytes)))) || '',
              type: 'xhr',
              url: details.url
            });
          }
        }

      } else {
        console.log('Error en el esquema HTTP://');
      }

    } else {
      console.log('Error validando URL del servicio');
    }

    let format = JSON.stringify(restStorage);
    chrome.storage.local.set({
      restStorage: format
    });

  }, networkFilters, ["requestBody", "blocking"]);

});
