goog.provide('ms.Template');

goog.require('goog.json');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.Dialog');



/**
 * Template.
 * @constructor
 * @extends {goog.ui.Dialog}
 */
ms.Template = function() {
  goog.ui.Dialog.call(this);

  /**
   * Fields.
   * @type {Array.<ms.ComboBox>}
   */
  this.fields;

  /**
   * Clipboard.
   * @type {ZeroClipboard.Client}
   */
  this.clipboard = null;

  ZeroClipboard.setMoviePath(
      'http://mapseries.georeferencer.org/zeroclipboard/ZeroClipboard.swf');
};
goog.inherits(ms.Template, goog.ui.Dialog);


/**
 * Add listeners to dialog with decorated template content.
 * @private
 */
ms.Template.prototype.addTemplateListeners_ = function() {
  var container = this.getContentElement();
  var pre = goog.dom.getElementsByTagNameAndClass('pre', null, container)[0];

  /*var inputs = goog.dom.getElementsByTagNameAndClass('input', null, pre);
  var input;
  for (var i = 0; i < inputs.length; i++) {
    input = inputs[i];
    goog.events.listen(input, 'input', function(e) {
      updateTextArea();
    });
  }*/

  var _this = this;
  this.clipboard = new ZeroClipboard.Client();
  this.clipboard.glue('clipboard_button', 'clipboard_container');
  this.clipboard.addEventListener('mouseDown', function(client) {
    var textToCopy = '';
    var node;
    for (var i = 0; i < pre.childNodes.length; i++) {
      node = pre.childNodes[i];
      switch (node.nodeType) {
        case goog.dom.NodeType.TEXT:
          textToCopy += node.nodeValue;
          break;
        case goog.dom.NodeType.ELEMENT:
          var field = goog.array.find(_this.fields, function(field) {
            return node === field.getElement().parentNode;
          });
          textToCopy += field.getValue();
          break;
      }
    }
    _this.clipboard.setText(textToCopy);
  });
};


/**
 * Create template HTML content and ComboBoxes.
 * @param {string} template template string.
 * @private
 */
ms.Template.prototype.createHtmlAndComboBoxes_ = function(template) {
  this.fields = [];
  var _this = this;

  var html = template.replace(/\{[^}]+\}/gm,
      function(match, offset, template) {
        var json = goog.json.unsafeParse(match);

        var gid = json['gid'];
        if (gid) {
          var groupMember = goog.array.find(_this.fields, function(cb) {
            return cb.gid === gid;
          });
          if (groupMember) {
            goog.object.forEach(groupMember.configObj, function(val, key) {
              goog.object.setIfUndefined(json, key, val);
            });
          }
        }

        var cb = new ms.ComboBox(json);
        cb.setUseDropdownArrow(true);
        var values = json['values'];
        if (values) {
          goog.array.forEach(values, function(value) {
            cb.addItem(new goog.ui.ComboBoxItem(value + ''));
          });
        }
        _this.fields.push(cb);

        var divAttrs = {
          'id': 'templateComboBox' + _this.fields.length,
          'class': 'combo'
        };
        var w = json['width'];
        if (w) {
          w = w * 8 + 16;
          divAttrs['style'] = 'width:' + w + 'px;';
        }
        var title = json['title'];
        if (title) {
          divAttrs['title'] = title;
        }
        var el = goog.dom.createDom('div', divAttrs);
        var result = goog.dom.getOuterHtml(el);
        return result;
      });

  html = '<pre>' + html + '</pre>';

  html += '<div id="clipboard_container" style="position:relative">';
  html += '<button id="clipboard_button">Copy to Clipboard</button>';
  html += '</div>';
  this.setContent(html);

};


/**
 * Initialize combo boxes.
 * @param {Object.<string, (function(*): string)>} formatFunctions format
 * functions.
 * @private
 */
ms.Template.prototype.initComboBoxes_ = function(formatFunctions) {
  var divs = goog.dom.getElementsByTagNameAndClass('div', 'combo',
      this.getContentElement());
  goog.array.forEach(divs, function(div, id) {
    var cb = this.fields[id];

    var caption = new goog.ui.ComboBoxItem('Select or type another value...');
    caption.setSticky(true);
    caption.setEnabled(false);
    cb.addItemAt(caption, 0);

    cb.render(div);
    var inputEl = cb.getInputElement();
    inputEl.style.width = div.style.width;

    //synchronize values within group
    var container = this.getContentElement();
    var pre = goog.dom.getElementsByTagNameAndClass('pre', null, container)[0];
    goog.events.listen(cb, 'change', function(evt) {
      var cbs = this.getCbGroup_(cb.gid);

      goog.array.forEach(cbs, function(groupMember) {
        var memberInput = groupMember.getInputElement();
        if (groupMember !== cb) {
          memberInput.value = groupMember.formatValue(cb.getValue(),
              formatFunctions);
        }
      }, this);
    }, false, this);
    if (cb.formatFunction) {
      var selfInput = cb.getInputElement();
      goog.events.listen(selfInput, 'blur', function() {
        selfInput.value = cb.formatValue(selfInput.value, formatFunctions);
      });
    }

    return cb;
  }, this);

};


/**
 * Fill template with values for given sheet.
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 * @private
 */
ms.Template.prototype.autofill_ = function(sheet, series, map) {

  // get BBox
  var fillBbox = function() {
    var bbox = sheet.geometry.getBounds();
    var proj = new OpenLayers.Projection('EPSG:4326');
    bbox = bbox.clone();
    bbox.transform(map.getProjectionObject(), proj);
    return bbox;
  };

  // fill every field
  goog.array.forEach(this.fields, function(cb) {
    var div = cb.getElement().parentNode;
    var value = null;

    if (cb.attr) {
      value = sheet.attributes[cb.attr];
    }
    if (cb.formatFunction) {
      switch (cb.formatFunction) {
        case 'ms:marc21_0341_bbox':
          var latLngBbox = latLngBbox || fillBbox();
          value = latlng.bboxToMarc21_034(latLngBbox);
          break;
        case 'ms:marc21_255_bbox_czech':
          latLngBbox = latLngBbox || fillBbox();
          value = latlng.bboxToMarc21_255InCzech(latLngBbox);
          break;
        default:
          value = cb.formatValue(value, series.formatFunctions);
          break;
      }
    }

    if (value) {
      value += '';
      cb.addItem(new goog.ui.ComboBoxItem(value));
      var inputEl = cb.getInputElement();
      var width = value.length * 8 + 16;
      inputEl.style.width = width + 'px';
      var menuEl = goog.dom.getLastElementChild(cb.getElement());
      menuEl.style.width = Math.max(219, width) + 'px';
      cb.setValue(value);
    } else if (div.title) {
      cb.setDefaultText(div.title + '...');
    }
  }, this);
};


/**
 * Show template for given sheet.
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 */
ms.Template.prototype.showSheet = function(sheet, series, map) {
  var template = series.template;
  if (!template) {
    return;
  }

  this.createHtmlAndComboBoxes_(template);
  this.initComboBoxes_(series.formatFunctions);
  this.autofill_(sheet, series, map);


  //set label
  var label = sheet.attributes['SHEET'] + ' - ' + sheet.attributes['TITLE'];
  this.setTitle(label);

  this.setVisible(true);
  this.addTemplateListeners_();

};


/**
 * Get array of combo boxes by GID.
 * @param {string} gid group ID.
 * @return {Array.<ms.ComboBox>} comboboxes.
 * @private
 *
 */
ms.Template.prototype.getCbGroup_ = function(gid) {
  if (gid) {
    return goog.array.filter(this.fields, function(cb) {
      return cb.gid == gid;
    });
  } else {
    return [];
  }
};
