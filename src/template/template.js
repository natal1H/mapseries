goog.provide('ms.Template');

goog.require('goog.json');
goog.require('goog.ui.ComboBox');
goog.require('goog.ui.Dialog');
goog.require('ms.ComboBox');



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

  //create base combo boxes
  var html = template.replace(/\{[^}]+\}/gm,
      function(match, offset, template) {
        var json = goog.json.unsafeParse(match);
        var baseId = json['base'];
        if (baseId) {
          return match;
        } else {
          return _this.createComboBox_(json);
        }
      });
  
  html = html.replace(/\{[^}]+\}/gm,
      function(match, offset, template) {
        var json = goog.json.unsafeParse(match);

        return _this.createComboBox_(json);
        
      });

  html = '<pre>' + html + '</pre>';

  html += '<div id="clipboard_container" style="position:relative">';
  html += '<button id="clipboard_button">Copy to Clipboard</button>';
  html += '</div>';
  this.setContent(html);

};


/**
 * Create ComboBoxes.
 * @param {Object} json config JSON.
 * @private
 */
ms.Template.prototype.createComboBox_ = function(json) {
  var baseId = json['base'];
  
  if(baseId) {
    var base = goog.array.find(this.fields, function(cb) {
      return cb.id === baseId;
    });
    if (base) {
      goog.object.forEach(base.configObj, function(val, key) {
        if(key!='id') {
          goog.object.setIfUndefined(json, key, val);
        }
      });
    }
  }

  
  var cb = new ms.ComboBox(json);
  cb.base = base||null;
  cb.setUseDropdownArrow(true);
  var values = json['values'];
  if (values) {
    goog.array.forEach(values, function(value) {
      cb.addItem(new goog.ui.ComboBoxItem(value + ''));
    });
  }
  cb.valuesByBaseIndex = json['valuesByBaseIndex'];
  this.fields.push(cb);

  var cls = ['combo'];
  if(base || cb.configObj['enabled']===false) {
    cls.push('disabled');
  }
  cls = cls.join(' ');
  var divAttrs = {
    'id': 'templateComboBox' + (this.fields.length-1),
    'class': cls
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
  goog.array.forEach(divs, function(div) {
    var idx = parseInt(div.id.substr(16), 10);
    var cb = this.fields[idx];

    var caption = new goog.ui.ComboBoxItem('Select or type another value...');
    caption.setSticky(true);
    caption.setEnabled(false);
    cb.addItemAt(caption, 0);

    cb.render(div);
    var inputEl = cb.getInputElement();
    inputEl.style.width = div.style.width;

    var menuEl = cb.getMenu().getElement();
    var w = inputEl.style.width;
    w = parseInt(w.replace(/[^-\d\.]/g, ''), 10);
    if(w>219) {
      menuEl.style.width = inputEl.style.width;
    }

    //synchronize values within group
    var container = this.getContentElement();
    var pre = goog.dom.getElementsByTagNameAndClass('pre', null, container)[0];
    if(cb.id) {
      goog.events.listen(cb, 'change', function(evt) {
        var cbs = this.getDependent_(cb);
        goog.array.forEach(cbs, function(groupMember) {
          var memberInput = groupMember.getInputElement();
          if (groupMember !== cb) {
            memberInput.value = groupMember.formatValue(cb.getValue(),
                formatFunctions);
          }
        }, this);
      }, false, this);
    }
    if(cb.base || cb.configObj['enabled']===false) {
      cb.setEnabled(false);
    } else {
      goog.events.listen(cb.getInputElement(), 'focus', function(evt) {
        var cbs = this.getDependent_(cb);
        cbs.push(cb);
        goog.array.forEach(cbs, function(depCombo) {
          var el = depCombo.getElement();
          goog.dom.classes.add(el, 'active');
        });
      }, false, this);
      goog.events.listen(cb.getInputElement(), 'blur', function(evt) {
        var cbs = this.getDependent_(cb);
        cbs.push(cb);
        goog.array.forEach(cbs, function(depCombo) {
          var el = depCombo.getElement();
          goog.dom.classes.remove(el, 'active');
        });
      }, false, this);
    }
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
    } else {
      if(cb.getItemCount()==1) {
        cb.removeItemAt(0);
        goog.dom.classes.add(cb.getElement(), 'no-arrow');
      }
      if (div.title) {
        cb.setDefaultText(div.title + '...');
      }
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
 * Get dependent combo boxes.
 * @param {ms.ComboBox} mainCb combo box.
 * @return {Array.<ms.ComboBox>} comboboxes.
 * @private
 *
 */
ms.Template.prototype.getDependent_ = function(mainCb) {
  return goog.array.filter(this.fields, function(cb) {
    return cb.base === mainCb;
  });
};
