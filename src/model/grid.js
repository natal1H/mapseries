goog.provide('ms.Grid');



/**
 * One map sheets grid.
 * @constructor
 */
ms.Grid = function() {

  /**
   * Title.
   * @type {string}
   */
  this.title;

  /**
   * Series that defines this grid.
   * @type {ms.Series}
   */
  this.mainSeries;

  /**
   * Map series with given grid.
   * @type {Array.<ms.Series>}
   */
  this.seriess;

};

/**
 * @return {string} title without region part.
 */
ms.Grid.prototype.getShortTitle = function() {
  return this.title.substr(this.title.indexOf(':')+1);
};


