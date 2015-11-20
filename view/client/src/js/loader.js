goog.provide('ms.Loader');

goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('ms.Grid');
goog.require('ms.Series');



/**
 * Loader.
 * @constructor
 */
ms.Loader = function() {

};


/**
 * Load one map series from object.
 * @param {Object} objSeries object.
 * @return {ms.Series} one map series.
 */
ms.Loader.prototype.loadSeries = function(objSeries) {
  var ser = new ms.Series();
  ser.title = objSeries['title'];
  ser.grid = objSeries['baseGrid'];

  ser.overlay = new OpenLayers.Layer.OSM(ser.title,
      'http://mapseries.georeferencer.org/geoserver/gwc/service/gmaps?' +
      'layers=mapseries:' + objSeries['layer'] +
      '&zoom=${z}&x=${x}&y=${y}&format=image/png',
      {
        'attribution': '',
        'isBaseLayer': false,
        'visibility': false,
        'tileOptions': {'crossOriginKeyword': null}
      });

  ser.formatFunctions = objSeries['formatFunctions'] || [];

  //read template
  var tempreq = new goog.net.XhrIo();
  goog.events.listen(tempreq, 'complete', function() {
    //request complete
    if (tempreq.isSuccess()) {
      ser.template = tempreq.getResponseText();
    }
  });
  tempreq.send('templates/' +
      objSeries['template'], 'GET');

  return ser;
};


/**
 * Load array of map series from object.
 * @param {Array.<Object>} objSeriess object.
 * @return {Array.<ms.Series>} array of map series.
 */
ms.Loader.prototype.loadSeriess = function(objSeriess) {
  var seriess = goog.array.map(objSeriess, this.loadSeries, this);

  //map series that are base grids
  var baseSeriess = goog.array.filter(seriess, function(series) {
    return !(series.grid);
  });

  //create grids
  var grids = [];
  goog.array.forEach(baseSeriess, function(series) {
    var grid = new ms.Grid();
    grid.title = series.title;
    grid.mainSeries = series;
    grid.seriess = [series];
    series.grid = grid;
    grids.push(grid);
  });

  //map series that refer to base grids
  var refSeriess = goog.array.filter(seriess, function(series) {
    return goog.isString(series.grid);
  });
  goog.array.forEach(refSeriess, function(series) {
    var gridTitle = /** @type {string } */(series.grid);
    var grid = goog.array.find(grids, function(grid) {
      return grid.title === gridTitle;
    });
    if (!grid) {
      throw Error('Grid ' + gridTitle + ' not found!');
    } else {
      series.grid = grid;
      grid.series.push(series);
    }
  });


  return seriess;
};
