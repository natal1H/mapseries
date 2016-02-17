require('qs-hash');
require('../lib/custom_hash.js');

var popup = require('../lib/popup'),
    grid = require('../lib/leaflet.grid'),
    escape = require('escape-html'),
    LGeo = require('leaflet-geodesy'),
    $ = require('jquery'),
    writable = false,
    makiValues = require('../../data/maki.json'),
    maki = '';

for (var i = 0; i < makiValues.length; i++) {
    maki += '<option value="' + makiValues[i].icon + '">';
}

module.exports = function(context, readonly) {

    writable = !readonly;

    var selectedLayer = null;

    function map(selection) {
        context.map = L.mapbox.map(selection.node(), null, {
                infoControl: true,
                attributionControl: false
            })
            .setView([20, 0], 2)
            .addControl(L.mapbox.geocoderControl('mapbox.places', {
                position: 'topright'
            }));

        context.map.zoomControl.setPosition('topright');

        L.hash(context.map);

        context.mapLayer = L.featureGroup().addTo(context.map);
        context.labelLayer = L.layerGroup().addTo(context.map);

        if (writable) {
          context.drawControl = new L.Control.Draw({
              position: 'topright',
              edit: { featureGroup: context.mapLayer },
              draw: {
                  circle: false,
                  polyline: false,
                  polygon: { metric: (navigator.language !== 'en-us' && navigator.language !== 'en-US'), guideLayers: [context.mapLayer], snapDistance: 5 },
                  marker: false
              }
          }).addTo(context.map);

          context.drawGrid = new grid.Control(context.texts, {
            position: 'topright'
          }).addTo(context.map);

          context.map
            .on('draw:edited', update)
            .on('draw:deleted', update);
        }

        context.map
            .on('draw:created', created)
            .on('popupopen', popup(context));

        context.map.infoControl.addInfo('<a target="_blank" href="http://tmcw.wufoo.com/forms/z7x4m1/">Feedback</a>');
        context.map.infoControl.addInfo('<a target="_blank" href="http://geojson.io/about.html">About</a>');

        function update() {
            geojsonToLayer(context.mapLayer.toGeoJSON(), context.mapLayer, context.labelLayer);
            context.data.set({map: layerToGeoJSON(context.mapLayer)}, 'map');
        }

        context.dispatch.on('change.map', function() {
            geojsonToLayer(context.data.get('map'), context.mapLayer, context.labelLayer);
        });

        context.dispatch.on('open_serie', function() {
          $('.leaflet-draw-section').css('display', 'block');
          $('.leaflet-control-grid-container').css('display', 'block');
        });

        function created(e) {
            if (e.layer) {
              context.mapLayer.addLayer(e.layer);
            }
            if (e.layers) {
              e.layers.forEach(function(l) {
                context.mapLayer.addLayer(l);
              });
            }
            update();
        }
    }

    function layerToGeoJSON(layer) {
        var features = [];
        layer.eachLayer(collect);
        function collect(l) { if ('toGeoJSON' in l) features.push(l.toGeoJSON()); }
        return {
            type: 'FeatureCollection',
            features: features
        };
    }

    function geojsonToLayer(geojson, mapLayer, labelLayer) {
        mapLayer.clearLayers();
        labelLayer.clearLayers();
        L.geoJson(geojson, {
            style: L.mapbox.simplestyle.style,
            pointToLayer: function(feature, latlon) {
                if (!feature.properties) feature.properties = {};
                return L.mapbox.marker.style(feature, latlon);
            }
        }).eachLayer(add);
        function add(l) {
            bindClick(l);
            bindLabel(l, labelLayer);
            l.addTo(mapLayer);
        }
    }

    function bindClick(l) {
      l.on('click', function(e) {
        context.dispatch.select_layer(e.target);
      });
    }

    function bindLabel(l, layer) {
      var props = JSON.parse(JSON.stringify(l.toGeoJSON().properties)),
          properties = {};

      // Steer clear of XSS
      for (var k in props) {
          var e = escape(k);
          properties[e] = escape(props[k]);
      }

      if (properties.SHEET) {
        var label = new L.Label({direction: 'center'});
        label.setContent(properties.SHEET);
        label.setLatLng(l.getBounds().getCenter());
        layer.addLayer(label);
      }
    }

    return map;
};
