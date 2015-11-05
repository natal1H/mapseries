var mapseries = {};
mapseries.config = {
  formatFunctionsTemplate: {
    addDegrees: function(stringValue, sheet) {
      stringValue += '';
      if(stringValue.length==4) {
        stringValue = stringValue.substr(0,2)+'°'+stringValue.substr(2)+'°';
      }
      return stringValue;
    }
  },
  series: [
    {
      title: "Austria-Hungary: 3rd Military Survey, 1:200 K",
      layer: "austria-hungary-3rd-military-survey-1200-k",
      template: "austria-hungary-3rd-military-survey-1200-k.txt",
      formatFunctions: {
        addDegrees: function (stringValue, sheet) {
          stringValue += '';
          if(stringValue.length==4) {
            stringValue = stringValue.substr(0,2)+'°'+stringValue.substr(2)+'°';
          }
          return stringValue;
        }
      }
    }
  ]
}
