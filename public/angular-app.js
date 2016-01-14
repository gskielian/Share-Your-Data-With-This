
var app = angular.module('angular-app', ['nvd3']);


//custom filter for reversing ng-repeat order
app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});


//this makes it compat with handlebars
app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

app.controller('myChart',  function($scope, $http, $interval){

  $scope.config = {
    visible: true, // default: true
    extended: false, // default: false
    disabled: false, // default: false
    refreshDataOnly: true, // default: true
    deepWatchOptions: true, // default: true
    deepWatchData: true, // default: true
    deepWatchDataDepth: 2, // default: 2
    debounce: 10 // default: 10
  };


  $scope.options = {
    chart: {
      type: 'lineChart',
      height: 180,
      margin : {
        top: 20,
        right: 20,
        bottom: 40,
        left: 55
      },
      x: function(d){ return d.x; },
      y: function(d){ return d.y; },
      useInteractiveGuideline: true,
      duration: 500,    
      yAxis: {
        tickFormat: function(d){
          return d3.format('.01f')(d);
        }
      }
    }
  };

  $scope.options.chart.duration = 0;
  $scope.options.chart.yDomain = [-400,400];

  $scope.data = [{ values: [], key: 'Random Walk' }];

  $scope.run = true;
 

  var x = 0;

  var req = {
    method: 'GET',
    url: 'http://localhost:3000/items',
    headers: {
      'Accept': 'application/json, text/plain'
    }
  };

  $http(req).then(function(response) {
    if (!$scope.run) return;
    $scope.data[0].values.push({ x: x,  y: response.data[0].value});
    if ($scope.data[0].values.length > 100) $scope.data[0].values.shift();
    x++;
  });

  //note, this is how to create a function in Angular.js
  $scope.callAtInterval = function () {
    $http(req).then(function(response) {
      if (!$scope.run) return;
      $scope.data[0].values.push({ x: x,  y: response.data[0].value});
      if ($scope.data[0].values.length > 100) $scope.data[0].values.shift();
      x++;
    });
  };

  //poll for new data once a second
  setInterval( function(){
    $scope.callAtInterval();
      $scope.$apply(); // update both chart
  }, 1000);

});
