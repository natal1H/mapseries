module.exports = function(gjson) {
  gjson.features.forEach(function(feature) {
    for (var key in feature.properties) {
      var value = feature.properties[key];
      if (key.toUpperCase() === 'ID') {
        delete feature.properties[key];
      } else if (typeof value === 'number') {
        feature.properties[key] = feature.properties[key].toString();
      } else if (value === null) {
        feature.properties[key] = '';
      }
    }
  });
};
