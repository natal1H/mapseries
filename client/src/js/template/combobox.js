goog.provide('ms.ComboBox');

goog.require('goog.ui.ComboBox');
goog.require('ms.ValueItem');



/**
 * Template combo box.
 * @constructor
 * @extends {goog.ui.ComboBox}
 */
ms.ComboBox = function() {
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
   * Array of values indexed as values of base combo box.
   * @type {Array.<ms.ValueItem>}
   */
  this.valuesByBaseIndex;

  /**
   * Array of values.
   * @type {Array.<ms.ValueItem>}
   */
  this.values;

  /**
   * Value.
   * @type {ms.ValueItem}
   */
  this.value;

  /**
   * True if all values should be in the template.
   * @type {boolean}
   */
  this.multipleValues;

  /**
   * Value separator (used only if multipleValues is true).
   * @type {string}
   */
  this.valueSeparator;

};
goog.inherits(ms.ComboBox, goog.ui.ComboBox);


/**
 * @param {Object} configObj configuration object.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 */
ms.ComboBox.prototype.configurate = function(configObj, series, map) {
  this.configObj = configObj;
  this.id = this.configObj['id'];

  var fillBbox = function(sheet) {
    var bbox = sheet.geometry.getBounds();
    var proj = new OpenLayers.Projection('EPSG:4326');
    bbox = bbox.clone();
    bbox.transform(map.getProjectionObject(), proj);
    return bbox;
  };

  var loadValue = function(objValue) {
    var value = new ms.ValueItem();
    if (goog.isObject(objValue)) {
      value.attr = objValue['attr'];
      var ffname = objValue['formatFunction'];
      if (ffname) {
        switch (ffname) {
          case 'ms:marc21_0341_bbox':
            var ff = function(val, sh) {
              return latlng.bboxToMarc21_034(fillBbox(sh));
            };
            break;
          case 'ms:marc21_255_bbox_czech':
            ff = function(val, sh) {
              return latlng.bboxToMarc21_255InCzech(fillBbox(sh));
            };
            break;
          case 'ms:marc21_255_bbox_english':
            ff = function(val, sh) {
              return latlng.bboxToMarc21_255InEnglish(fillBbox(sh));
            };
            break;
          default:
            ff = series.formatFunctions[ffname];
            break;

        }
        value.formatFunction = ff;
      }
    } else {
      value.value = objValue;
    }
    return value;
  };

  var objValues = configObj['values'];
  if (objValues) {
    this.values = goog.array.map(objValues, loadValue);
  }
  var objValuesByBaseIndex = configObj['valuesByBaseIndex'];
  if (objValuesByBaseIndex) {
    this.valuesByBaseIndex = goog.array.map(objValuesByBaseIndex, loadValue);
  }
  var objValue = configObj['value'];
  if (goog.isDef(objValue)) {
    this.value = loadValue(objValue);
  }
  this.multipleValues = !!configObj['multipleValues'];
  this.valueSeparator = configObj['valueSeparator'] || '';
};


/**
 * @param {*} value value.
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @return {Array.<string>} formatted value(s).
 */
ms.ComboBox.prototype.formatValue = function(value, sheet) {

  var getValues = function(value, sheet, baseValue) {
    if (value instanceof ms.ValueItem) {
      var result = '';
      if (goog.isString(value.value)) {
        result = value.value;
      } else if (value.attr) {
        result = sheet.attributes[value.attr];
      } else if (baseValue) {
        result = baseValue;
      }
      var ff = value.formatFunction;
    } else {
      result = value;
    }

    if (goog.isString(result)) {
      var results = result.split('|');
    } else {
      results = [result];
    }

    results = goog.array.map(results, function(res) {
      if (ff) {
        res = ff(res, sheet);
      }
      res = res || '';
      res += '';
      return res;
    });
    return results;
  };

  if (this.valuesByBaseIndex && this.base) {
    var bid = this.base.getMenu().getHighlightedIndex();
    if (bid > 0) {
      var valueItem = this.valuesByBaseIndex[bid - 1] || '';
      var results = getValues(valueItem, sheet, this.base.getValue());
    }
  } else {
    results = getValues(value, sheet, null);
  }
  results = results || [''];
  return results;
};
