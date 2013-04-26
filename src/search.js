goog.provide('ms.Search');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.net.XhrIo');
goog.require('latlng');
goog.require('ms.Loader');
goog.require('ms.Series');
goog.require('ms.Template');



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
   * Template dialog.
   * @type {ms.Template}
   */
  this.template = null;

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
      new OpenLayers.Control.Attribution()
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


  // template dialog
  this.template = new ms.Template();

  this.setActiveSheet(null);


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
  if (!sheet) {
    html = goog.dom.createDom('i', null, 'Click on a sheet');
    this.template.setVisible(false);
  } else {
    var label = sheet.attributes['SHEET'] + ' - ' + sheet.attributes['TITLE'];
    html = goog.dom.createDom('a', {'href': '#'}, label);
    goog.events.listen(html, 'click', function(e) {
      this.template.showSheet(sheet, this.series, this.map);
      e.preventDefault();
    }, false, this);
  }
  var container = /** @type {!Element} */(goog.dom.getElement('results'));
  goog.dom.removeChildren(container);
  goog.dom.append(container, html);
};


