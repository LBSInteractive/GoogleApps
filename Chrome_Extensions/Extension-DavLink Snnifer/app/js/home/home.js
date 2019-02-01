// let changeColor = document.getElementById('changeColor');
// chrome.storage.sync.get('color', function(data) {
//  changeColor.style.backgroundColor = data.color;
//  changeColor.setAttribute('value', data.color);
// });
//
// changeColor.onclick = function(element) {
//   let color = element.target.value;
//   chrome.tabs.query({
//     active: true,
//     currentWindow: true
//   }, function(tabs) {
//     chrome.tabs.executeScript(
//       tabs[0].id, {
//         code: 'document.body.style.backgroundColor = "' + color + '";'
//       });
//   });
// };

var app = angular.module('davLinkHomeApp', []);

app.controller('davLinkHomeCtrl', function($scope, $rootScope, $timeout) {
  $scope.rest = '';
  $scope.restList = [];
  $scope.height = '150';
  $scope.width = '180';
  $scope.viewSize = true;
  $scope.viewTab = false;
  chrome.storage.local.get(['restSize'], function(callback) {
    $timeout(function() {
      $scope.restSize = callback.restSize;
    }, 0);
  });

  $scope.program = {
    getRest: function() {
      $scope.rest = '';
      chrome.storage.local.get(['restStorage'], function(callback) {
        $timeout(function() {
          if (callback.restStorage != '') {
            $scope.rest = callback.restStorage;
            $scope.restList = JSON.parse($scope.rest);
            console.log($scope.restList);
          }
        }, 1000);





      });


    },
    volver: function() {
      chrome.storage.local.get(['restSize'], function(callback) {
        $timeout(function() {
          $scope.restSize = callback.restSize;
        }, 0);
      });
      $scope.viewTab = false;
      $scope.viewSize = true;
      $scope.width = '150';
    }
  };

  $scope.execute = {
    restOn: function() {
      $scope.viewSize = false;
      $scope.width = '720';
      $scope.viewTab = true;
    }
  };
});
