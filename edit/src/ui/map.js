require('qs-hash');
require('../lib/custom_hash.js');

var popup = require('../lib/popup'),
    grid = require('../lib/leaflet.grid'),
    escape = require('escape-html'),
    LGeo = require('leaflet-geodesy'),
    writable = false,
    makiValues = require('../../data/maki.json'),
    maki = '';

for (var i = 0; i < makiValues.length; i++) {
    maki += '<option value="' + makiValues[i].icon + '">';
}

module.exports = function(context, readonly) {

    writable = !readonly;

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
            bindPopup(l);
            bindLabel(l, labelLayer);
            l.addTo(mapLayer);
        }
    }

    function bindPopup(l) {

        var props = JSON.parse(JSON.stringify(l.toGeoJSON().properties)),
            table = '',
            info = '';

        var properties = {};

        // Steer clear of XSS
        for (var k in props) {
            var e = escape(k);
            properties[e] = escape(props[k]);
        }

        if (!properties) return;

        if (!Object.keys(properties).length) properties = { '': '' };

        for (var key in properties) {
            table += '<tr><th><input type="text" value="' + key + '"' + (!writable ? ' readonly' : '') + ' /></th>' +
                '<td><input type="text" value="' + properties[key] + '"' + (!writable ? ' readonly' : '') + ' /></td></tr>';
        }

        if (l.feature && l.feature.geometry) {
            info += '<table class="metadata">';
            if (l.feature.geometry.type === 'LineString') {
                var total = d3.pairs(l.feature.geometry.coordinates).reduce(function(total, pair) {
                    return total + L.latLng(pair[0][1], pair[0][0])
                        .distanceTo(L.latLng(pair[1][1], pair[1][0]));
                }, 0);
                info += '<tr><td>' + context.texts.meters + '</td><td>' + total.toFixed(2) + '</td></tr>' +
                        '<tr><td>' + context.texts.kilometers + '</td><td>' + (total / 1000).toFixed(2) + '</td></tr>' +
                        '<tr><td>' + context.texts.feet + '</td><td>' + (total / 0.3048).toFixed(2) + '</td></tr>' +
                        '<tr><td>' + context.texts.yards + '</td><td>' + (total / 0.9144).toFixed(2) + '</td></tr>' +
                        '<tr><td>Miles</td><td>' + (total / 1609.34).toFixed(2) + '</td></tr>';
            } else if (l.feature.geometry.type === 'Point') {
                info += '<tr><td>' + context.texts.latitude + '</td><td>' + l.feature.geometry.coordinates[1].toFixed(4) + '</td></tr>' +
                        '<tr><td>' + context.texts.longitude + '</td><td>' + l.feature.geometry.coordinates[0].toFixed(4) + '</td></tr>';
            } else if (l.feature.geometry.type === 'Polygon') {
              info += '<tr><td>' + context.texts.sqMeters + '</td><td>' + (LGeo.area(l)).toFixed(2) + '</td></tr>' +
                      '<tr><td>' + context.texts.sqKilometers + '</td><td>' + (LGeo.area(l) / 1000000).toFixed(2) + '</td></tr>' +
                      '<tr><td>' + context.texts.sqFeet + '</td><td>' + (LGeo.area(l) / 0.092903).toFixed(2) + '</td></tr>' +
                      '<tr><td>' + context.texts.acres + '</td><td>' + (LGeo.area(l) / 4046.86).toFixed(2) + '</td></tr>' +
                      '<tr><td>' + context.texts.sqMiles + '</td><td>' + (LGeo.area(l) / 2589990).toFixed(2) + '</td></tr>';
            }
            info += '</table>';
        }

        var tabs = '<div class="pad1 tabs-ui clearfix col12">' +
                        '<div class="tab col12">' +
                            '<input class="hide" type="radio" id="properties" name="tab-group" checked="true">' +
                            '<label class="keyline-top keyline-right tab-toggle pad0 pin-bottomleft z10 center col6" for="properties">' + context.texts.properties + '</label>' +
                            '<div class="space-bottom1 col12 content">' +
                                '<table class="space-bottom0 marker-properties">' + table + '</table>' +
                                (writable ? '<div class="add-row-button add fl col3"><span class="icon-plus"> ' + context.texts.addRow + '</div>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="space-bottom2 tab col12">' +
                            '<input class="hide" type="radio" id="info" name="tab-group">' +
                            '<label class="keyline-top tab-toggle pad0 pin-bottomright z10 center col6" for="info">' + context.texts.info + '</label>' +
                            '<div class="space-bottom1 col12 content">' +
                                '<div class="marker-info">' + info + ' </div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

        var content = tabs +
            (writable ? '<div class="clearfix col12 pad1 keyline-top">' +
                '<div class="pill col6">' +
                '<button class="save col6 major">' + context.texts.save + '</button> ' +
                '<button class="minor col6 cancel">' + context.texts.cancel + '</button>' +
                '</div>' +
                '<button class="col6 text-right pad0 delete-invert"><span class="icon-remove-sign"></span>' + context.texts.deleteFeature + '</button></div>' : '');

        l.bindPopup(L.popup({
            closeButton: false,
            maxWidth: 500,
            maxHeight: 400,
            autoPanPadding: [5, 45],
            className: 'geojsonio-feature'
        }, l).setContent(content));
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
