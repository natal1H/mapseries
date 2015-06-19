goog.provide('ms.Series');



/**
 * One map series.
 * @constructor
 */
ms.Series = function() {

  /**
   * Title.
   * @type {string}
   */
  this.title;

  /**
   * Template string.
   * @type {string}
   */
  this.template;

  /**
   * Format functions.
   * @type {Object.<string, (function(*): string)>}
   */
  this.formatFunctions;

  /**
   * Overlay.
   * @type {OpenLayers.Layer.OSM}
   */
  this.overlay = null;

  /**
   * Map sheets grid.
   * @type {ms.Grid|string}
   */
  this.grid;

};


/**
 * @return {string} title without region part.
 */
ms.Series.prototype.getShortTitle = function() {
  return this.title.substr(this.title.indexOf(':') + 1);
};


/**
 * @param {Array.<ms.Series>} seriess map seriess.
 * @return {Array.<string>} regien names.
 */
ms.Series.getRegions = function(seriess) {
  var regions = goog.array.map(seriess, function(series) {
    return series.title.split(':')[0];
  });
  goog.array.removeDuplicates(regions);
  return regions;
};


/**
 * @param {Array.<ms.Series>} seriess map seriess.
 * @return {Array.<ms.Grid>} grids.
 */
ms.Series.getGrids = function(seriess) {
  var grids = goog.array.map(seriess, function(series) {
    return series.grid;
  });
  goog.array.removeDuplicates(grids);
  return grids;
};
