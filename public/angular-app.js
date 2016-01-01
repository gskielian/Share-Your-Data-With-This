angular.module('angular-app', ['nvd3'])
.controller('myCtrl', function($scope){

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

  /* Chart data */
  $scope.data = [{
    key: "Cumulative Return",
    values: [
      { "label" : "A" , "value" : -29.765957771107 },
      { "label" : "B" , "value" : 0 },
      { "label" : "C" , "value" : 32.807804682612 },
      { "label" : "D" , "value" : 196.45946739256 },
      { "label" : "E" , "value" : 0.19434030906893 },
      { "label" : "F" , "value" : -98.079782601442 },
      { "label" : "G" , "value" : -13.925743130903 },
      { "label" : "H" , "value" : -5.1387322875705 }
    ]
  }];

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
