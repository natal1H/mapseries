goog.provide('ms.Template');

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
   * @type {Array.<goog.ui.ComboBox>}
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
 * Create template HTML content.
 * @param {string} template template string.
 * @private
 */
ms.Template.prototype.createTemplateHtml_ = function(template) {
  var html = template.replace(/\{([^:}]+)(:(\d+))?(:([^}]+))?\}/gm,
      '<div id="$1" class="$1 combo" style="width:$3em;" title="$5"></div>'
      );
  html = '<pre>' + html + '</pre>';

  html += '<div id="clipboard_container" style="position:relative">';
  html += '<button id="clipboard_button">Copy to Clipboard</button>';
  html += '</div>';
  this.setContent(html);

};


/**
 * Create combo boxes.
 * @private
 */
ms.Template.prototype.createComboBoxes_ = function() {
  var divs = goog.dom.getElementsByTagNameAndClass('div', 'combo',
      this.getContentElement());
  this.fields = goog.array.map(divs, function(div) {
    var cb = new goog.ui.ComboBox();
    cb.setUseDropdownArrow(true);

    var caption = new goog.ui.ComboBoxItem('Select or type another value...');
    caption.setSticky(true);
    caption.setEnabled(false);
    cb.addItem(caption);


    cb.render(div);
    var inputEl = cb.getInputElement();
    inputEl.style.width = div.style.width;

    //synchronize values
    var container = this.getContentElement();
    var pre = goog.dom.getElementsByTagNameAndClass('pre', null, container)[0];
    goog.events.listen(cb, 'change', function(evt) {
      var fieldsContainers = goog.dom.getElementsByTagNameAndClass('div',
          cb.getElement().parentNode.id, pre);
      goog.array.forEach(fieldsContainers, function(fieldContainer) {
        var input = goog.dom.getFirstElementChild(
            goog.dom.getFirstElementChild(fieldContainer));
        input.value = cb.getValue();
      }, this);
    }, false, this);

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
ms.Template.prototype.autofillTemplate_ = function(sheet, series, map) {

  // get BBox
  var fillBbox = function() {
    var bbox = sheet.geometry.getBounds();
    var proj = new OpenLayers.Projection('EPSG:4326');
    bbox.transform(map.getProjectionObject(), proj);
    return bbox;
  };

  // replace every token
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    var fieldEl = field.getElement().parentNode;
    var token = fieldEl.id;
    var value = null;

    switch (token) {
      case 'marc21_0341_scale':
        value = '$$b' + sheet.attributes['SCALE'];
        break;
      case 'marc21_0341_bbox':
        var latLngBbox = latLngBbox || fillBbox();
        value = latlng.bboxToMarc21_034(latLngBbox);
        break;
      case 'marc21_255_bbox_czech':
        latLngBbox = latLngBbox || fillBbox();
        value = latlng.bboxToMarc21_255InCzech(latLngBbox);
        break;
      default:
        if (token.substr(0, 5) == 'attr_') {
          value = sheet.attributes[token.substr(5)];
        }
        break;
    }
    if (value) {
      field.addItem(new goog.ui.ComboBoxItem(value));
      var inputEl = field.getInputElement();
      var width = value.length * 8 + 16;
      inputEl.style.width = width + 'px';
      var menuEl = goog.dom.getLastElementChild(field.getElement());
      menuEl.style.width = Math.max(219, width) + 'px';
      field.setValue(value);
    } else {
      field.setDefaultText(fieldEl.title + '...');
    }
  }
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

  this.createTemplateHtml_(template);
  this.createComboBoxes_();
  this.autofillTemplate_(sheet, series, map);


  //set label
  var label = sheet.attributes['SHEET'] + ' - ' + sheet.attributes['TITLE'];
  this.setTitle(label);

  this.setVisible(true);
  this.addTemplateListeners_();

};
