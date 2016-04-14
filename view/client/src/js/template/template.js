goog.provide('ms.Template');

goog.require('goog.dom.classlist');
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
   * Fields.s
   * @type {Array.<ms.ComboBox>}
   */
  this.fields;

  /**
   * Clipboard.
   * @type {ZeroClipboard.Client}
   */
  this.clipboard = null;

  /**
   * Clipboard 008.
   * @type {ZeroClipboard.Client}
   */
  this.clipboard008 = null;

  ZeroClipboard.setMoviePath(
      '/lib/zeroclipboard/ZeroClipboard.swf');
};
goog.inherits(ms.Template, goog.ui.Dialog);


/**
 * Add listeners to dialog with decorated template content.
 * @private
 */
ms.Template.prototype.addTemplateListeners_ = function() {
  var _this = this;


  var getTextToCopy = function() {
    var container = _this.getContentElement();
    var pre = goog.dom.getElementsByTagNameAndClass('pre', null, container)[0];
    var textToCopy = '';
    var node;
    for (var i = 0; i < pre.childNodes.length; i++) {
      node = pre.childNodes[i];
      switch (node.nodeType) {
        case goog.dom.NodeType.TEXT:
          textToCopy += node.nodeValue;
          break;
        case goog.dom.NodeType.ELEMENT:
          if (goog.dom.classlist.contains(node, 'combo')) {
            var field = goog.array.find(_this.fields, function(field) {
              return node === field.getElement().parentNode;
            });
            textToCopy += field.getValue();
          } else if (goog.dom.classlist.contains(node, 'multipleValues')) {
            textToCopy += goog.dom.getRawTextContent(node);
          }
          break;
      }
    }
    return textToCopy;
  };

  this.clipboard = new ZeroClipboard.Client();
  this.clipboard.glue('clipboard_button', 'clipboard_container');
  this.clipboard.addEventListener('mouseDown', function(client) {
    var textToCopy = getTextToCopy();
    _this.clipboard.setText(textToCopy);
  });

  this.clipboard008 = new ZeroClipboard.Client();
  this.clipboard008.glue('clipboard_button_008', 'clipboard_container_008');
  this.clipboard008.addEventListener('mouseDown', function(client) {
    var line008 = '';
    var allText = getTextToCopy();
    var res = allText.match(/^008.*$/gm);
    if (goog.isArray(res) && res.length) {
      line008 = res[0];
    }
    _this.clipboard008.setText(line008);
  });
};


/**
 * Create template HTML content and ComboBoxes.
 * @param {string} template template string.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 * @private
 */
ms.Template.prototype.createHtmlAndComboBoxes_ =
    function(template, series, map) {
  this.fields = [];
  var _this = this;

  //create BASE combo boxes
  var html = this.replaceEveryJson_(template, function(json, str) {
    var baseId = json['base'];
    if (baseId) {
      return str;
    } else {
      return _this.createComboBox_(json, series, map);
    }
  });

  //create referring combo boxes
  html = this.replaceEveryJson_(html, function(json, str) {
    return _this.createComboBox_(json, series, map);
  });

  html = '<pre>' + html + '</pre>';

  html += '<div id="clipboard_container" style="position:relative" ' +
      'class="clipboard-container">';
  html += '<button id="clipboard_button">Copy to Clipboard</button>';
  html += '</div>';
  html += '<div id="clipboard_container_008" style="position:relative" ' +
      'class="clipboard-container">';
  html += '<button id="clipboard_button_008">Copy 008 to Clipboard</button>';
  html += '</div>';
  this.setContent(html);

};


/**
 * Create ComboBoxes.
 * @param {Object} json config JSON.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 * @return {string} combobox HTML.
 * @private
 */
ms.Template.prototype.createComboBox_ = function(json, series, map) {
  var baseId = json['base'];

  if (baseId) {
    var base = goog.array.find(this.fields, function(cb) {
      return cb.id === baseId;
    });
    if (base) {
      goog.object.forEach(base.configObj, function(val, key) {
        if (key != 'id') {
          goog.object.setIfUndefined(json, key, val);
        }
      });
    }
  }

  var cb = new ms.ComboBox();
  cb.configurate(json, series, map);
  cb.base = base || null;
  cb.setUseDropdownArrow(true);
  this.fields.push(cb);

  var cls = ['combo'];
  if (base || cb.configObj['enabled'] === false) {
    cls.push('disabled');
  }
  cls = cls.join(' ');
  var divAttrs = {
    'id': 'templateComboBox' + (this.fields.length - 1),
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
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @param {ms.Series} series series.
 * @param {OpenLayers.Map} map map.
 * functions.
 * @private
 */
ms.Template.prototype.initComboBoxes_ = function(sheet, series, map) {
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
    if (w > 219) {
      menuEl.style.width = inputEl.style.width;
    }

    //add options
    this.addOptions_(cb, sheet);

    //synchronize values within group
    if (cb.id) {
      goog.events.listen(cb, 'change', function(evt) {
        var cbs = this.getDependent_(cb);
        goog.array.forEach(cbs, function(groupMember) {
          var memberInput = groupMember.getInputElement();
          if (groupMember !== cb) {
            memberInput.value = groupMember.formatValue(cb.getValue(), sheet);
          }
        }, this);
      }, false, this);
    }

    //visual styles
    if (cb.base || cb.configObj['enabled'] === false) {
      cb.setEnabled(false);
    } else {
      goog.events.listen(cb.getInputElement(), 'focus', function(evt) {
        var cbs = this.getDependent_(cb);
        cbs.push(cb);
        goog.array.forEach(cbs, function(depCombo) {
          var el = depCombo.getElement();
          goog.dom.classlist.add(el, 'active');
        });
      }, false, this);
      goog.events.listen(cb.getInputElement(), 'blur', function(evt) {
        var cbs = this.getDependent_(cb);
        cbs.push(cb);
        goog.array.forEach(cbs, function(depCombo) {
          var el = depCombo.getElement();
          goog.dom.classlist.remove(el, 'active');
        });
      }, false, this);
    }

    return cb;
  }, this);


  // fill every field
  goog.array.forEach(this.fields, function(cb) {

    if (cb.getItemCount() == 1) {
      cb.removeItemAt(0);
      goog.dom.classlist.add(cb.getElement(), 'no-arrow');
    }
    var el = cb.getElement();
    if (el) {
      var div = el.parentNode;
      if (div.title) {
        cb.setDefaultText(div.title + '...');
      }
    } else {
      console.log('je null');
    }
  }, this);


};


/**
 * Add options to combo boxes.
 * @param {ms.ComboBox} cb combo box.
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @private
 */
ms.Template.prototype.addOptions_ = function(cb, sheet) {
  if (!cb.base && (cb.values || cb.value)) {
    var values = cb.values || [cb.value];

    //create options
    var count = 0;
    var lastComboboxValue = '';
    if (cb.multipleValues) {
      var otherMultipleStringValues = [];
    }
    goog.array.forEach(values, function(valueItem) {
      var stringValues = cb.formatValue(valueItem, sheet);
      goog.array.forEach(stringValues, function(stringValue) {
        if (cb.multipleValues && count) {
          otherMultipleStringValues.push(stringValue);
        } else {
          cb.addItem(new goog.ui.ComboBoxItem(stringValue));
          count++;
          lastComboboxValue = stringValue;
        }
      });
    });
    //set value if there was only one value
    if (lastComboboxValue && count == 1) {
      cb.setValue(lastComboboxValue);
    }

    //set other multiple values
    if (cb.multipleValues && otherMultipleStringValues.length) {
      var cbdiv = goog.dom.getParentElement(cb.getElement());
      var content = '';
      goog.array.forEach(otherMultipleStringValues, function(stringValue) {
        content += cb.valueSeparator + stringValue;
      });
      var span = goog.dom.createDom('span', {
        'class': 'multipleValues',
        'title': cb.configObj['title'] || ''
      }, content);
      goog.dom.insertSiblingAfter(span, cbdiv);
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

  this.createHtmlAndComboBoxes_(template, series, map);
  this.initComboBoxes_(sheet, series, map);


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


/**
 * Go through template and replace every JSON with result of given function
 * applied to this JSON.
 * @param {string} template template string.
 * @param {Function} f replace function.
 * @return {string} edited template.
 * @private
 */
ms.Template.prototype.replaceEveryJson_ = function(template, f) {
  var openBrackets = [];
  var idx;
  while ((idx = template.indexOf('{', idx ? idx + 1 : 0)) >= 0) {
    openBrackets.push(idx);
  }
  var closeBrackets = [];
  idx = null;
  while ((idx = template.indexOf('}', idx ? idx + 1 : 0)) >= 0) {
    closeBrackets.push(idx);
  }
  if (!openBrackets.length || !closeBrackets.length) {
    return template;
  }

  var findIndexOfNextOpenBracket = function(closebr) {
    var result = goog.array.find(openBrackets, function(openbr) {
      return openbr > closebr;
    });
    result = result ? goog.array.indexOf(openBrackets, result) : -1;
    return result;
  };
  var findIndexOfNextCloseBracket = function(openbr) {
    var result = goog.array.find(closeBrackets, function(closebr) {
      return closebr > openbr;
    });
    result = result ? goog.array.indexOf(closeBrackets, result) : -1;
    return result;
  };

  var closeBracket = -1;
  var openBracketIdx;
  var replacements = [];
  while ((openBracketIdx = findIndexOfNextOpenBracket(closeBracket)) >= 0) {
    var ob = openBrackets[openBracketIdx];
    var cbi = findIndexOfNextCloseBracket(ob);
    if (cbi < 0) {
      break;
    }
    var json;
    for (var i = cbi; i < closeBrackets.length; i++) {
      var cb = closeBrackets[i];
      var str = template.substring(ob, cb + 1);
      try {
        json = JSON.parse(str);
        break;
      } catch (e) {
        //try next loop
      }
    }
    if (json) {
      replacements.push([ob, cb + 1, f(json, str)]);
    }
    closeBracket = cb;
  }

  for (i = replacements.length - 1; i >= 0; i--) {
    var repl = replacements[i];

    template = template.substr(0, repl[0]) +
        repl[2] + template.substr(repl[1]);
  }
  return template;
};


/**
 * @private
 * @inheritDoc
 * @suppress {accessControls}
 */
ms.Template.prototype.onKey_ = function(e) {
  var close = false;
  var hasHandler = false;
  var buttonSet = this.getButtonSet();
  var target = e.target;

  if (e.type == goog.events.EventType.KEYDOWN) {
    // Escape and tab can only properly be handled in keydown handlers.
    if (this.escapeToCancel_ && e.keyCode == goog.events.KeyCodes.ESC) {
      // Only if there is a valid cancel button is an event dispatched.
      var cancel = buttonSet && buttonSet.getCancel();

      // Users may expect to hit escape on a SELECT element.
      var isSpecialFormElement =
          target.tagName == 'SELECT' && !target.disabled;

      if (cancel && !isSpecialFormElement) {
        hasHandler = true;

        var caption = buttonSet.get(cancel);
        close = this.dispatchEvent(
            new goog.ui.Dialog.Event(cancel,
                /** @type {Element|null|string} */(caption)));
      } else if (!isSpecialFormElement) {
        close = true;
      }
    } else if (e.keyCode == goog.events.KeyCodes.TAB && e.shiftKey &&
        target == this.getElement()) {
      // Prevent the user from shift-tabbing backwards out of the dialog box.
      // Instead, set up a wrap in focus backward to the end of the dialog.
      this.setupBackwardTabWrap();
    }
  } else if (e.keyCode == goog.events.KeyCodes.ENTER) {
    // Only handle ENTER in keypress events, in case the action opens a
    // popup window.
    var key;
    if (target.tagName == 'BUTTON') {
      // If focus was on a button, it must have been enabled, so we can fire
      // that button's handler.
      key = target.name;
    } else if (buttonSet) {
      // Try to fire the default button's handler (if one exists), but only if
      // the button is enabled.
      var defaultKey = buttonSet.getDefault();
      var defaultButton = defaultKey && buttonSet.getButton(defaultKey);

      // Users may expect to hit enter on a TEXTAREA, SELECT or an A element.
      var isSpecialFormElement =
          (target.tagName == 'TEXTAREA' || target.tagName == 'SELECT' ||
           target.tagName == 'A') && !target.disabled;

      if (defaultButton && !defaultButton.disabled && !isSpecialFormElement) {
        key = defaultKey;
      }
    }
    if (key && buttonSet) {
      hasHandler = true;
      close = this.dispatchEvent(
          new goog.ui.Dialog.Event(key, String(buttonSet.get(key))));
    }
    var enter = close;
  }

  if (close || hasHandler) {
    e.stopPropagation();
    e.preventDefault();
  }

  if (close && !enter) {
    this.setVisible(false);
  }
};
