var shpwrite = require('shp-write'),
    clone = require('clone'),
    geojson2dsv = require('geojson2dsv'),
    topojson = require('topojson'),
    saveAs = require('filesaver.js'),
    tokml = require('tokml'),
    githubBrowser = require('github-file-browser'),
    gistBrowser = require('gist-map-browser'),
    geojsonNormalize = require('geojson-normalize'),
    wellknown = require('wellknown'),
    vex = require('vex-js'),
    vexDialog = require('vex-js/js/vex.dialog.js'),
    S = require('string'),
    $ = require('jquery');

require('jstree');

var flash = require('./flash'),
    zoomextent = require('../lib/zoomextent'),
    readFile = require('../lib/readfile'),
    meta = require('../lib/meta.js'),
    serializer = require('../lib/serializer'),
    loading = require('../ui/loading.js');

/**
 * This module provides the file picking & status bar above the map interface.
 * It dispatches to source implementations that interface with specific
 * sources, like GitHub.
 */
module.exports = function fileBar(context) {

    var github = require('../source/github')(context),
        config = require('../lib/config')(context),
        serie = require('../ui/serie')(context),
        shpSupport = typeof ArrayBuffer !== 'undefined';
    vex.defaultOptions.className = 'vex-theme-os';
    vexDialog.defaultOptions.showCloseButton = true;

    var exportFormats = [{
        title: 'GeoJSON',
        action: downloadGeoJSON
    }, {
        title: 'TopoJSON',
        action: downloadTopo
    }, {
        title: 'CSV',
        action: downloadDSV
    }, {
        title: 'KML',
        action: downloadKML
    }, {
        title: 'WKT',
        action: downloadWKT
    }];

    if (shpSupport) {
        exportFormats.push({
            title: 'Shapefile',
            action: downloadShp
        });
    }

    function bar(selection) {

        var actions = [{
          title: context.texts.newSerie,
          action: newSerie,
          enabled: true
        }, {
          title: context.texts.openSerie,
          action: openSerie,
          enabled: true
        }, {
          title: context.texts.save,
          id: 'save',
          action: saveWork,
          enabled: false
        }, {
          title: context.texts.discardChanges,
          id: 'discard',
          action: discardWork,
          enabled: false
        }, {
          title: context.texts.publish,
          id: 'publish',
          action: publishWork,
          enabled: false
        }, {
          title: context.texts.import,
          id: 'import',
          alt: context.texts.importAlt,
          action: blindImport,
          enabled: false
        }, {
          title: context.texts.export,
          id: 'export',
          children: exportFormats,
          enabled: false
        }, {
            title: context.texts.tools,
            id: 'tools',
            children: [
                {
                    title: context.texts.addMapLayer,
                    alt: context.texts.addMapLayerAlt,
                    action: function() {
                        var layerURL = prompt(context.texts.layerURL + ' \n(http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg)');
                        if (layerURL === null) return;
                        var layerName = prompt(context.texts.layerName);
                        if (layerName === null) return;
                        meta.adduserlayer(context, layerURL, layerName);
                    }
                },
                {
                    title: context.texts.zoomToFeatures,
                    alt: context.texts.zoomToFeaturesAlt,
                    action: function() {
                        meta.zoomextent(context);
                    }
                },
                {
                    title: context.texts.clear,
                    alt: context.texts.clearAlt,
                    action: function() {
                        if (confirm(context.texts.clearConfirm)) {
                            meta.clear(context);
                        }
                    }
                }
            ],
            enabled: false
        }];

        var items = selection.append('div')
            .attr('class', 'inline')
            .selectAll('div.item')
            .data(actions)
            .enter()
            .append('div')
            .attr('class', function(d) { return 'item' + (d.enabled ? '' : ' disabled'); })
            .attr('id', function(d) { return d.id ? 'button-' + d.id : null; });

        var buttons = items.append('a')
            .attr('class', 'parent')
            .on('click', function(d) {
                if (d.action) d.action.apply(this, d);
            })
            .text(function(d) {
                return ' ' + d.title;
            });

        items.each(function(d) {
            if (!d.children) return;
            d3.select(this)
                .append('div')
                .attr('class', 'children')
                .call(submenu(d.children));
        });

        /* Register events */
        context.dispatch.on('init_dirty.file_bar', function() {
          $('#button-discard').removeClass('disabled');
          $('#button-publish').removeClass('disabled');
        });

        context.dispatch.on('change.file_bar', function(e) {
          if (context.data.dirty === true) {
            $('#button-save').removeClass('disabled');
            $('#button-publish').removeClass('disabled');
          } else {
            $('#button-save').addClass('disabled');
          }
        });

        context.dispatch.on('open_serie.file_bar', function() {
          $('#button-import').removeClass('disabled');
          $('#button-export').removeClass('disabled');
          $('#button-tools').removeClass('disabled');
        });

        context.dispatch.on('save_serie.file_bar', function() {
          $('#button-discard').removeClass('disabled');
        });

        context.dispatch.on('clear.file_bar', function() {
          $('#button-import').addClass('disabled');
          $('#button-export').addClass('disabled');
          $('#button-tools').addClass('disabled');
        });

        context.dispatch.on('discardWork.file_bar', function() {
          $('#button-discard').addClass('disabled');
          $('#button-publish').addClass('disabled');
        });

        function submenu(children) {
            return function(selection) {
                selection
                    .selectAll('a')
                    .data(children)
                    .enter()
                    .append('a')
                    .text(function(d) {
                        return d.title;
                    })
                    .on('click', function(d) {
                        d.action.apply(this, d);
                    });
            };
        }

        function newSerie() {
          loading.show();

          config.loadConfig(function(err) {
            loading.hide();
            if (err) {
              flash(context.container, context.texts.unexpectedError);
              return;
            }
            newSerieDialog(config.getAreas());
          });
        }

        function newSerieDialog(areas) {
          var input = '<label for="input-title">' + context.texts.newSerieDialogSerieTitle + '</label>' +
                      '<input id="input-title" name="title" type="text" required />' +
                      '<div class="radio-box"><div class="title">' + context.texts.newSerieDialogSerieArea + '</div>' +
                      '<div class="vertical-scroll">';

          var first = true;
          areas.forEach(function(area) {
            if (first) {
              first = false;
              input += '<input type="radio" name="area" checked="true" value="' + area + '"/><span>' + area + '</span></br>';
            } else {
              input += '<input type="radio" name="area" value="' + area + '"/><span>' + area + '</span></br>';
            }
          });
          input += '</div><span class="other"><input id="radio-area-other" type="radio" name="area" value="&lt;other&gt;"/><input id="input-area-other" type="text" name="area-other" placeholder="' + context.texts.other + '" /></span></div>';

          vexDialog.open({
            message: context.texts.newSerieDialogTitle,
            input: input,
            afterOpen: function() {
              var inputAreaOther = document.getElementById('input-area-other');
              inputAreaOther.addEventListener('focus', function() {
                document.getElementById('radio-area-other').checked = true;
              });
            },
            callback: function(data) {
              if (!data) {
                return;
              }
              var area = data.area;
              if (area == '<other>') {
                area = data['area-other'];
              }
              serie.newOne(data.title, area);
            }
          });
        }

        function openSerie() {
          config.loadConfig(function(err) {
            loading.hide();
            if (err) {
              flash(context.container, context.texts.unexpectedError);
              return;
            }

            vexDialog.open({
              message: context.texts.openSerieDialogTitle,
              input: '<div id="file-tree"></div>',
              contentCSS: {
                width: '600px'
              },
              buttons: [],
              afterOpen: function() {
                var _this = this;
                $('#file-tree').jstree({
                  core: {
                    data: config.getJsTreeData()
                  }
                }).on('changed.jstree', function(e, data) {
                  if (data.node.parent != '#') {
                    vex.close(_this.id);
                    serie.open(data.node.original.id);
                  }
                });
              }
            });
          });
        }

        function saveWork() {
          loading.show();
          serie.save(function(err) {
            loading.hide();
            if (err) {
              flash(context.container, context.texts.saveFailed);
            } else {
              flash(context.container, context.texts.saveSuccess);
            }
          });
        }

        function discardWork() {
          loading.show();
          github.discardWork(function(err) {
            loading.hide();
            if (err) {
              flash(context.container, context.texts.discardFailed);
            } else {
              flash(context.container, context.texts.discardSuccess);
              context.dispatch.clear();
            }
          });
        }

        function publishWork() {
          loading.show();
          serie.save(function(err) {
            if (err) {
              loading.hide();
              flash(context.container, context.texts.saveFailed);
              return;
            }
            github.pullRequest(config.getTitle(), function(err) {
              loading.hide();
              if (err) {
                flash(context.container, context.texts.publishFailed);
              } else {
                flash(context.container, context.texts.publishSuccess);
                context.dispatch.clear();
                $('#button-publish').addClass('disabled');
              }
            });
          });
        }

        function blindImport() {
            var put = d3.select('body')
                .append('input')
                .attr('type', 'file')
                .style('visibility', 'hidden')
                .style('position', 'absolute')
                .style('height', '0')
                .on('change', function() {
                    var files = this.files;
                    if (!(files && files[0])) return;
                    loading.show();
                    readFile.readAsText(files[0], function(err, text) {
                        readFile.readFile(files[0], text, onImport);
                    });
                    put.remove();
                });
            put.node().click();
        }

        function onImport(err, gj, warning) {
            gj = geojsonNormalize(gj);
            if (gj) {
                context.data.mergeFeatures(gj.features);
                if (warning) {
                    flash(context.container, warning.message);
                } else {
                    flash(context.container, context.texts.imported + ' ' + gj.features.length + ' ' + context.texts.features + '.')
                        .classed('success', 'true');
                }
                zoomextent(context);
            }
            loading.hide();
        }
    }

    function downloadTopo() {
        var content = JSON.stringify(topojson.topology({
            collection: clone(context.data.get('map'))
        }, {'property-transform': allProperties}));

        saveAs(new Blob([content], {
            type: 'text/plain;charset=utf-8'
        }), 'map.topojson');

    }

    function downloadGeoJSON() {
        if (d3.event) d3.event.preventDefault();
        var content = JSON.stringify(context.data.get('map'));
        var meta = context.data.get('meta');
        saveAs(new Blob([content], {
            type: 'text/plain;charset=utf-8'
        }), (meta && meta.name) || 'map.geojson');
    }

    function downloadDSV() {
        if (d3.event) d3.event.preventDefault();
        var content = geojson2dsv(context.data.get('map'));
        saveAs(new Blob([content], {
            type: 'text/plain;charset=utf-8'
        }), 'points.csv');
    }

    function downloadKML() {
        if (d3.event) d3.event.preventDefault();
        var content = tokml(context.data.get('map'));
        var meta = context.data.get('meta');
        saveAs(new Blob([content], {
            type: 'text/plain;charset=utf-8'
        }), 'map.kml');
    }

    function downloadShp() {
        if (d3.event) d3.event.preventDefault();
        d3.select('.map').classed('loading', true);
        try {
            shpwrite.download(context.data.get('map'));
        } finally {
            d3.select('.map').classed('loading', false);
        }
    }

    function downloadWKT() {
        if (d3.event) d3.event.preventDefault();
        var contentArray = [];
        var features = context.data.get('map').features;
        if (features.length === 0) return;
        var content = features.map(wellknown.stringify).join('\n');
        var meta = context.data.get('meta');
        saveAs(new Blob([content], {
            type: 'text/plain;charset=utf-8'
        }), 'map.wkt');
    }

    function allProperties(properties, key, value) {
        properties[key] = value;
        return true;
    }

    return bar;
};
