var metatable = require('d3-metatable')(d3),
    smartZoom = require('../lib/smartzoom.js'),
    $ = require('jquery');

require('floatthead');

module.exports = function(context) {

    var renderer = {};
    renderer.dirty = false;

    renderer.render = function(selection) {

        selection.html('');

        renderer.rerender = function() {
            var geojson = context.data.get('map');
            var props;

            renderer.confirmChanges = function() {
              if (renderer.dirty) {
                context.data.set('map', geojson);
              }
            }

            if (!geojson || !geojson.geometry &&
                (!geojson.features || !geojson.features.length)) {
                selection
                    .html('')
                    .append('div')
                    .attr('class', 'blank-banner center')
                    .text('no features');
            } else {
                props = geojson.geometry ? [geojson.properties] :
                    geojson.features.map(getProperties);

                selection
                    .html('')
                    .append('button')
                    .attr('class', 'confirm')
                    .on('click', renderer.confirmChanges)
                    .text('Confirm changes');
                selection
                    .data([props])
                    .call(metatable()
                        .on('change', function(row, i) {
                            renderer.dirty = true;
                            if (geojson.geometry) {
                                geojson.properties = row;
                            } else {
                                geojson.features[i].properties = row;
                            }
                        })
                        .on('rowfocus', function(row, i) {
                            var j = 0;
                            context.mapLayer.eachLayer(function(l) {
                                if (i === j++) {
                                  context.dispatch.select_layer(l, 'table');
                                }
                            });
                        })
                        .on('beforestructurechanged', function() {
                          if (renderer.table) {
                            $(renderer.table).floatThead('destroy');
                          }
                        })
                        .on('structurechanged', function() {
                          if (renderer.table) {
                            $(renderer.table).floatThead({
                              scrollContainer: function(table) {
                                return table.closest('.tabledata');
                              }
                            });
                            $(renderer.table).floatThead('reflow');
                          }
                        })
                    );
                selection.select('table').each(function() {
                  renderer.table = this;
                  $(this).floatThead({
                    scrollContainer: function(table) {
                      return table.closest('.tabledata');
                    }
                  });
                  $(this).floatThead('reflow');
                });
            }
        };

        renderer.selectLayer = function(layer, source) {
          var i = 1;
          context.mapLayer.eachLayer(function(l) {
            if (layer === l) {
              var w = $(renderer.table).closest('.tabledata');
              var row = $(renderer.table)
                .find('tr')
                .removeClass('active')
                .eq(i)
                .addClass('active');

              if (source != 'table' && row.length) {
                w.scrollTop(0);
                w.scrollTop( row.offset().top - (w.height()/2) );
              }
            }
            i++;
          });
        };

        context.dispatch.on('change.table', renderer.rerender);
        context.dispatch.on('select_layer.table', renderer.selectLayer);

        renderer.rerender();

        function getProperties(f) { return f.properties; }

        function zoomToMap(p) {
            var layer;
            layers.eachLayer(function(l) {
                if (p == l.feature.properties) layer = l;
            });
            return layer;
        }
    };

    renderer.off = function() {
        context.dispatch.on('change.table', null);
        context.dispatch.on('select_layer.table', null);
        $(renderer.table).floatThead('destroy');
        renderer.confirmChanges();
    };

    return renderer;
};
