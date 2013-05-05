goog.provide('ms.ComboBox');

goog.require('goog.ui.ComboBox');



/**
 * Template combo box.
 * @param {Object} configObj configuration object.
 * @constructor
 * @extends {goog.ui.ComboBox}
 */
ms.ComboBox = function(configObj) {
  goog.ui.ComboBox.call(this);

  /**
   * Configuration object.
   * @type {Object}
   */
  this.configObj;

  /**
   * Group ID.
   * @type {string}
   */
  this.gid;

  /**
   * Source attribute.
   * @type {string}
   */
  this.attr;

  /**
   * Format function name.
   * @type {string}
   */
  this.formatFunction;

  this.configurate_(configObj);

};
goog.inherits(ms.ComboBox, goog.ui.ComboBox);


/**
 * @param {Object} configObj configuration object.
 * @private
 */
ms.ComboBox.prototype.configurate_ = function(configObj) {
  this.configObj = configObj;
  this.gid = this.configObj['gid'];
  this.attr = this.configObj['attr'];
  this.formatFunction = this.configObj['ff'];
};


/**
 * @param {*} value value.
 * @param {Object.<string, (function(*): string)>} formatFunctions format
 * functions.
 * @return {string} formatted value.
 */
ms.ComboBox.prototype.formatValue = function(value, formatFunctions) {
  var ff;
  if (this.formatFunction && formatFunctions &&
      (ff = formatFunctions[this.formatFunction])) {
    value = ff(value);
  }
  return value + '';
};
