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
   * ID.
   * @type {string}
   */
  this.id;

  /**
   * Combobox which is leading for this combobox.
   * @type {ms.ComboBox}
   */
  this.base;

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

  /**
   * Array values indexed as values of base combo box.
   * @type {string}
   */
  this.valuesByBaseIndex;

  this.configurate_(configObj);

};
goog.inherits(ms.ComboBox, goog.ui.ComboBox);


/**
 * @param {Object} configObj configuration object.
 * @private
 */
ms.ComboBox.prototype.configurate_ = function(configObj) {
  this.configObj = configObj;
  this.id = this.configObj['id'];
  this.attr = this.configObj['attr'];
  this.formatFunction = this.configObj['formatFunction'];
};


/**
 * @param {*} value value.
 * @param {Object.<string, (function(*): string)>} formatFunctions format
 * functions.
 * @return {string} formatted value.
 */
ms.ComboBox.prototype.formatValue = function(value, formatFunctions) {
  var ff;
  if(this.valuesByBaseIndex && this.base) {
    var bid = this.base.getMenu().getHighlightedIndex();
    if(bid>0) {
      value = this.valuesByBaseIndex[bid-1] || '';
    } else {
      value = '';
    }
  }
  if (this.formatFunction && formatFunctions &&
      (ff = formatFunctions[this.formatFunction])) {
    value = ff(value);
  }
  return value + '';
};
