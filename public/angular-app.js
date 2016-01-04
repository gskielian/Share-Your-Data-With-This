angular.module('angular-app', ['nvd3'])
.controller('myCtrl', function($scope, $http, $interval){

  /* Chart options */
  $scope.options = {
    chart: {
      type: 'discreteBarChart',
      height: 450,
      margin : {
        top: 20,
        right: 20,
        bottom: 60,
        left: 55
      },
      x: function(d){ return d.label; },
      y: function(d){ return d.value; },
      showValues: true,
      valueFormat: function(d){
        return d3.format(',.4f')(d);
      },
      transitionDuration: 500,
      xAxis: {
        axisLabel: 'X Axis'
      },
      yAxis: {
        axisLabel: 'Y Axis',
        axisLabelDistance: 30
      }
    }
  };

  //do once before polling
  var req = {
    method: 'GET',
    url: 'http://localhost:3000/items',
    headers: {
      'Accept': 'application/json, text/plain'
    }
  };

  $http(req).then(function(response) {
    console.log("hello");
    console.log(response.data);
    $scope.data = [{
      key: "Cumulative Return",
      values: response.data
    }];
  });

  //note, this is how to create a function in Angular.js
  $scope.callAtInterval = function () {
    $http(req).then(function(response) {
      console.log("hello");
      console.log(response.data);
      $scope.data = [{
        key: "Cumulative Return",
        values: response.data
      }];
    });

  };

  //poll for new data once a second
  $interval( function(){ $scope.callAtInterval(); }, 1000);

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

});
