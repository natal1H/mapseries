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

};

