goog.provide('ms.Search');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('goog.ui.Dialog');
goog.require('latlng');
goog.require('ms.Loader');
goog.require('ms.Series');



/**
 * Search map sheet in map series.
 * @constructor
 */
ms.Search = function() {

  /**
   * OL map.
   * @type {OpenLayers.Map}
   */
  this.map = null;

  /**
   * Active Map Series.
   * @type {ms.Series}
   */
  this.series = null;

  /**
   * List of Map Series.
   * @type {Array.<ms.Series>}
   */
  this.seriess = null;

  /**
   * Layer of active sheet.
   * @type {OpenLayers.Layer.Vector}
   */
  this.sheetLayer = null;

  /**
   * OL StyleMap.
   * @type {OpenLayers.StyleMap}
   */
  this.styleMap = new OpenLayers.StyleMap({
    'default': new OpenLayers.Style({
      'strokeColor': 'red',
      'strokeOpacity': 1,
      'strokeWidth': 1,
      'fillColor': 'red',
      'fillOpacity': 0.15,
      'fontWeight': 'bold',
      'fontColor': 'red',
      'label': '${SHEET}',
      'labelSelect': true,
      'labelOutlineColor': '#ffcccc',
      'labelOutlineWidth': 4
    })
  });

  /**
   * Dialog.
   * @type {goog.ui.Dialog}
   */
  this.dialog = null;

  /**
   * Clipboard.
   * @type {ZeroClipboard.Client}
   */
  this.clipboard = null;

};


/**
 * Init search.
 * @param {Object} config map series config.
 */
ms.Search.prototype.init = function(config) {

  this.map = new OpenLayers.Map('map', {
    'controls': [
      new OpenLayers.Control.Navigation(),
      new OpenLayers.Control.Zoom(),
      new OpenLayers.Control.ArgParser(),
      new OpenLayers.Control.Attribution(),
      new OpenLayers.Control.Permalink({
        'anchor': true
      })
    ],
    'displayProjection': new OpenLayers.Projection('EPSG:4326')
  });

  //add layers
  var osm = new OpenLayers.Layer.OSM();
  var osm_mq = new OpenLayers.Layer.OSM('OpenStreetMap - MapQuest',
      ['http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg',
       'http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg',
       'http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg',
       'http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg']);
  var gmap = new OpenLayers.Layer.Google('Modern - Google Streets', {
    'numZoomLevels': 20
  });
  var gsat = new OpenLayers.Layer.Google('Modern - Google Satellite', {
    type: google.maps.MapTypeId.SATELLITE,
    'numZoomLevels': 22
  });
  var ghyb = new OpenLayers.Layer.Google('Modern - Google Hybrid', {
    type: google.maps.MapTypeId.HYBRID,
    'numZoomLevels': 22
  });
  var gphy = new OpenLayers.Layer.Google('Modern - Google Terrain', {
    type: google.maps.MapTypeId.TERRAIN,
    'numZoomLevels': 20
  });
  this.map.addLayers([osm_mq, osm, gmap, gsat, ghyb, gphy]);


  var loader = new ms.Loader();

  this.seriess = loader.loadSeriess(config['series']);
  var layers = goog.array.map(this.seriess, function(ms) {
    return ms.overlay;
  });
  layers[0].setVisibility(true);
  this.map.addLayers(layers);

  // Active sheet layer
  this.sheetLayer = new OpenLayers.Layer.Vector('Active sheet layer', {
    'projection': this.map.projection,
    'displayInLayerSwitcher': false,
    'styleMap': this.styleMap
  });
  this.map.addLayer(this.sheetLayer);

  this.map.updateSize();

  // If we do not have permalink set the default zoom and layers
  if (!this.map.getCenter()) {
    var proj = new OpenLayers.Projection('EPSG:4326');
    var bbox = new OpenLayers.Bounds(12.0905, 48.5518, 18.8592, 51.0556);
    bbox.transform(proj, this.map.getProjectionObject());
    this.map.zoomToExtent(bbox);
  }


  // initialize base layer switcher
  var layerSelect = goog.dom.getElement('layerSelect');
  var _this = this;
  goog.events.listen(layerSelect, 'change', function(e) {
    _this.map.setBaseLayer(_this.map.layers[this.selectedIndex]);
  });
  layers = this.map.layers.slice();
  var layer;
  for (var i = 0; i < layers.length; i++) {
    layer = layers[i];
    if (!layer.displayInLayerSwitcher) continue;
    if (layer.isBaseLayer) {

      var optel = goog.dom.createDom('option', {
        'value': i,
        'id': 'baseOption' + layer.name,
        'selected': layer.getVisibility()
      }, layer.name);
      goog.dom.appendChild(layerSelect, optel);
    }
  }

  // initialize overlay switcher
  var overlaySelect = goog.dom.getElement('overlaySelect');
  var ol;
  for (i = 0; i < this.seriess.length; i++) {
    var ser = this.seriess[i];
    ol = ser.overlay;
    var input = goog.dom.createDom('input', {
      'type': 'radio',
      'name': 'overlay',
      'id': 'overlayRadio' + ol.name,
      'value': i,
      'checked': ol.getVisibility()
    });
    var div = goog.dom.createDom('div', null, input);
    goog.dom.append(div, ol.name);
    goog.dom.appendChild(overlaySelect, div);

    goog.events.listen(input, 'change', function(ser) {
      return function(e) {
        this.setSeries(ser);
      }
    }(ser), false, this);
  }

  this.series = this.seriess[0];


  // Click handler for the map
  this.map.events.register('click', this.map,
      function(evt) {
        // var lonlat = map.getLonLatFromViewPortPx(e.xy);
        // alert("You clicked near " + lonlat.lat + " N, " + lonlat.lon + " E");
        var llPx = evt.xy.add(- 2, 2);
        var urPx = evt.xy.add(2, -2);
        var ll = _this.map.getLonLatFromPixel(llPx);
        var ur = _this.map.getLonLatFromPixel(urPx);
        var bbox = [ll.lon, ll.lat, ur.lon, ur.lat, 'epsg:900913'].join(',');

        var jsonp = new OpenLayers.Protocol.Script({
          'url': 'http://mapseries.georeferencer.org/geoserver/wfs',
          'callbackKey': 'format_options',
          'callbackPrefix': 'callback:',
          'params': {
            'request': 'GetFeature',
            'bbox': bbox,
            'typeName':
                OpenLayers.Util.getParameters(
                /** @type {string} */(_this.series.overlay.url))['layers'],
            'srsName': 'epsg:900913',
            'outputFormat': 'json'
          },
          'callback': function(evt) {
            var fs = evt.features;
            if (fs.length > 0) {
              var f = fs[0];
              _this.setActiveSheet(f);
            }
          }
        });
        jsonp.read();
        OpenLayers.Event.stop(evt);
      });


  // dialog
  this.dialog = new goog.ui.Dialog();

  this.setActiveSheet(null);

  ZeroClipboard.setMoviePath(
      'http://mapseries.georeferencer.org/zeroclipboard/ZeroClipboard.swf');

};


/**
 * Set active series.
 * @param {ms.Series} series active series.
 */
ms.Search.prototype.setSeries = function(series) {
  this.series.overlay.setVisibility(false);
  this.sheetLayer.removeAllFeatures();
  this.series = series;
  this.series.overlay.setVisibility(true);

};


/**
 * Set active sheet.
 * @param {OpenLayers.Feature.Vector} sheet active sheet.
 */
ms.Search.prototype.setActiveSheet = function(sheet) {
  this.sheetLayer.removeAllFeatures();
  if (sheet) {
    this.sheetLayer.addFeatures([sheet]);
  }

  var html;
  var _this = this;
  if (!sheet) {
    html = goog.dom.createDom('i', null, 'Click on a sheet');
    _this.dialog.setVisible(false);
  } else {
    var label = sheet.attributes['SHEET'] + ' - ' + sheet.attributes['TITLE'];
    html = goog.dom.createDom('a', {'href': '#'}, label);
    goog.events.listen(html, 'click', function(e) {
      _this.dialog.setTitle(label);
      var templ = _this.autofillTemplate(sheet);
      templ = this.decorateTemplate(templ);
      _this.dialog.setContent(templ);
      _this.dialog.setVisible(true);
      _this.addTemplateListeners(_this.dialog);
      e.preventDefault();
    });
  }
  var container = /** @type {!Element} */(goog.dom.getElement('results'));
  goog.dom.removeChildren(container);
  goog.dom.append(container, html);
};


/**
 * Fill template with values for given sheet.
 * @param {OpenLayers.Feature.Vector} sheet sheet.
 * @return {string} filled template.
 */
ms.Search.prototype.autofillTemplate = function(sheet) {
  var template = this.series.template;
  if (!template) {
    return '';
  }

  // read template tokens
  var tokens = template.match(/\{[^}]+\}/gm);
  goog.array.removeDuplicates(tokens);

  // prepare variables
  var filled = template;
  var token;
  var value;
  var latLngBbox;
  var map = this.map;
  var fillBbox = function() {
    var bbox = sheet.geometry.getBounds();
    var proj = new OpenLayers.Projection('EPSG:4326');
    bbox.transform(map.getProjectionObject(), proj);
    return bbox;
  };

  // replace every token
  for (var i = 0; i < tokens.length; i++) {
    token = tokens[i].substr(1, tokens[i].length - 2);
    value = null;

    switch (token) {
      case 'marc21_0341_scale':
        value = '$$b' + sheet.attributes['SCALE'];
        break;
      case 'marc21_0341_bbox':
        latLngBbox = latLngBbox || fillBbox();
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
      //deal with dollar signs
      //http://stackoverflow.com/questions/9423722/string-replace-weird-behavior-when-using-dollar-sign-as-replacement
      value = value.replace(/\$\$/g, '$$$$$$$$');
      var pat = new RegExp('\\{' + token + '\\}', 'gm');
      filled = filled.replace(pat, value);
    }
  }
  return filled;
};


/**
 * Decorate template to HTML string.
 * @param {string} template string.
 * @return {string} HTML string.
 */
ms.Search.prototype.decorateTemplate = function(template) {
  var decorated = template.replace(/\{input_([^:}])+:(\d+):([^}]+)\}/gm,
      '<input class="input_$1" style="width:$2em;" title="$3" />'
      );
  decorated = '<pre>' + decorated + '</pre>';

  decorated += '<div id="clipboard_container" style="position:relative">';
  decorated += '<button id="clipboard_button">Copy to Clipboard</button>';
  decorated += '</div>';
  return decorated;

};


/**
 * Add listeners to dialog with decorated template content.
 * @param {goog.ui.Dialog} dialog dialod.
 */
ms.Search.prototype.addTemplateListeners = function(dialog) {
  var container = dialog.getContentElement();
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
          if (node.tagName == 'INPUT') {
            textToCopy += node.value;
          }
          break;
      }
    }
    _this.clipboard.setText(textToCopy);
  });
};
