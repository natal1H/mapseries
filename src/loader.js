goog.provide('ms.Loader');

goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('ms.Series');



/**
 * Loader.
 * @constructor
 */
ms.Loader = function() {

};


/**
 * Load one map series from object.
 * @param {Object} series object.
 * @return {ms.Series} one map series.
 */
ms.Loader.prototype.loadSeries = function(series) {
  var ser = new ms.Series();
  ser.title = series['title'];

  ser.overlay = new OpenLayers.Layer.OSM(ser.title,
      'http://mapseries.georeferencer.org/geoserver/gwc/service/gmaps?' +
      'layers=mapseries:' + series['layer'] +
      '&zoom=${z}&x=${x}&y=${y}&format=image/png',
      {
        'attribution': '',
        'isBaseLayer': false,
        'visibility': false
      });

  ser.formatFunctions = series['formatFunctions'] || [];

  //read template
  var tempreq = new goog.net.XhrIo();
  goog.events.listen(tempreq, 'complete', function() {
    //request complete
    if (tempreq.isSuccess()) {
      ser.template = tempreq.getResponseText();
    }
  });
  tempreq.send((goog.DEBUG ? '../deploy/' : '') + 'templates/' +
      series['template'], 'GET');

  return ser;
};


/**
 * Load array of map series from object.
 * @param {Array.<Object>} series object.
 * @return {Array.<ms.Series>} array of map series.
 */
ms.Loader.prototype.loadSeriess = function(series) {
  return goog.array.map(series, this.loadSeries, this);
};
