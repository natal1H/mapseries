// require('qs-hash');
// require('../lib/custom_hash.js');

var popup = require('../lib/popup'),
    // grid = require('../lib/leaflet.grid'), TODO
    escape = require('escape-html'),
    $ = require('jquery'),
    mapboxgl = require('mapbox-gl'),
    writable = false,
    makiValues = require('../../data/maki.json'),
    maki = '',
    turf = require('turf');

for (var i = 0; i < makiValues.length; i++) {
    maki += '<option value="' + makiValues[i].icon + '">';
}

module.exports = function(context, readonly) {

    writable = !readonly;

    var selectedLayer = null;

    function map(selection) {
        // context.map = L.mapbox.map(selection.node(), null, {
        //         infoControl: true,
        //         attributionControl: false
        //     })
        //     .setView([20, 0], 2)
        //     .addControl(L.mapbox.geocoderControl('mapbox.places', {
        //         position: 'topright'
        //     }));

        context.map = new mapboxgl.Map({
            container: selection.node(), // container id
            style: {
                "version": 8,
                "sources": {
                    "base-map-source": {
                        "type": "raster",
                        "tiles": [
                            "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        ],
                        "tileSize": 256
                    }
                },
                "layers": [{
                    "id": "base-map-layer",
                    "type": "raster",
                    "source": "base-map-source",
                    "minzoom": 0,
                    "maxzoom": 22
                }],
                "glyphs": "http://glfonts.lukasmartinelli.ch/fonts/{fontstack}/{range}.pbf",
            },
            center: [20, 46], // starting position
            zoom: 5 // starting zoom
        });

        context.map.addControl(new mapboxgl.NavigationControl());

        // L.hash(context.map);


        // if (writable) {
        //   context.drawControl = new L.Control.Draw({
        //       position: 'topright',
        //       edit: { featureGroup: context.mapLayer },
        //       draw: {
        //           circle: false,
        //           polyline: false,
        //           polygon: { metric: (navigator.language !== 'en-us' && navigator.language !== 'en-US'), guideLayers: [context.mapLayer], snapDistance: 5 },
        //           marker: false
        //       }
        //   }).addTo(context.map);
        //
        //   context.drawGrid = new grid.Control(context.texts, {
        //     position: 'topright'
        //   }).addTo(context.map);
        //
        //   context.map
        //     .on('draw:edited', update)
        //     .on('draw:deleted', update);
        // } TODO

        // context.map
        //     .on('draw:created', created)
        //     .on('popupopen', popup(context)); TODO

        // context.map.infoControl.addInfo('<a target="_blank" href="http://tmcw.wufoo.com/forms/z7x4m1/">Feedback</a>');
        // context.map.infoControl.addInfo('<a target="_blank" href="http://geojson.io/about.html">About</a>'); TODO

        function update() {
            geojsonToLayer(context.mapLayer.toGeoJSON(), context.mapLayer, context.labelLayer);
            context.data.set({map: layerToGeoJSON()}, 'map');
        }

        context.dispatch.on('change.map', function() {
            geojsonToLayer(context.data.get('map'));
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

    function layerToGeoJSON() {
      return context.map.getSource("geojson-source").getData();
    }

    function geojsonToLayer(geojson) {

      var labels = [];

      geojson.features.forEach(function(feature) {
        var centroid = turf.centroid(feature);
        centroid.properties = feature.properties;
        labels.push(centroid);
      });

      if (!context.map.getSource('geojson-source')) {
        context.map.addSource("geojson-source", {
          "type": "geojson",
          "data": geojson
        });
        context.map.addLayer({
          "id": "geojson-layer",
          "type": "fill",
          "source": "geojson-source",
          "paint": {
              "fill-color": "#888",
              "fill-outline-color": "#000",
              "fill-opacity": 0.8
          }
        });
      } else {
        context.map.getSource("geojson-source").setData(geojson);
      }

      if (!context.map.getSource('label-source')) {
        context.map.addSource("label-source", {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": labels
          }
        });
        context.map.addLayer({
          "id": "label-layer",
          "type": "symbol",
          "source": "label-source",
          "layout": {
            "text-field": "{SHEET}",
            "text-font": ["Open Sans Light"],
          }
        });
        context.map.on('click', 'label-layer', function(e) {
          context.dispatch.select_layer(e.features[0].properties['SHEET']);
        });
        context.map.on('mouseenter', 'label-layer', function () {
          context.map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        context.map.on('mouseleave', 'label-layer', function () {
          context.map.getCanvas().style.cursor = '';
        });
      } else {
        context.map.getSource("label-source").setData({
          "type": "FeatureCollection",
          "features": labels
        });
      }

      // L.geoJson(geojson, {
      //     style: L.mapbox.simplestyle.style,
      //     pointToLayer: function(feature, latlon) {
      //         if (!feature.properties) feature.properties = {};
      //         return L.mapbox.marker.style(feature, latlon);
      //     }
      // }).eachLayer(add);
      // function add(l) {
      //     bindClick(l);
      //     bindLabel(l, labelLayer);
      //     l.addTo(mapLayer);
      // }
    }

    // function bindClick(l) {
    //   l.on('click', function(e) {
    //     console.log(e);
    //     context.dispatch.select_layer(e.target);
    //   });
    // }
    //
    // function bindLabel(l, layer) {
    //   var props = JSON.parse(JSON.stringify(l.toGeoJSON().properties)),
    //       properties = {};
    //
    //   // Steer clear of XSS
    //   for (var k in props) {
    //       var e = escape(k);
    //       properties[e] = escape(props[k]);
    //   }
    //
    //   if (properties.SHEET) {
    //     var label = new L.Label({direction: 'center'});
    //     label.setContent(properties.SHEET);
    //     label.setLatLng(l.getBounds().getCenter());
    //     layer.addLayer(label);
    //   }
    // }

    return map;
};
