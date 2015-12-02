var serializer = require('./serializer'),
    flash = require('../ui/flash'),
    loading = require('../ui/loading'),
    S = require('string');

module.exports = function(context) {

  var github = require('../source/github')(context);

  function loadConfig(callback) {
    github.readFile(getConfigPath(), function(err, data) {
      if (err) {
        callback.call(this, err);
        return;
      }
      context.data.set({config: data, dirty: false}, 'config');
      callback.call(this);
    });
  }

  function getAreas() {
    var areas = new Set();
    var config = getConfig();
    config.series.forEach(function(serie) {
      var area = serie.title.split(':', 1)[0].trim();
      areas.add(area);
    });
    return areas;
  }

  function getConfig() {
    var config = context.data.get('config');
    try {
      return eval(config);
    } catch(err) {
      loading.hide();
      flash(context.container, config.texts.configParseError);
      return null;
    }
  }

  function setConfig(data, dirty) {
    if (dirty === undefined) {
      dirty = true;
    }
    var prefix = 'var mapseries = {};\nmapseries.config = ';
    context.data.set({config: prefix + serializer(data), dirty: dirty}, 'config');
  }

  function createSerie(title, area) {
    var serieTitle = area + ': ' + title;
    var layer = S(serieTitle).slugify().s;
    var template = layer + '.txt';

    var config = getConfig();
    config.series.push({
      title: serieTitle,
      layer: layer,
      template: template,
      formatFunctions: config.formatFunctionsTemplate,
      edited: true
    });
    setConfig(config);
  }

  function getGroupedByArea() {
    var series = {};
    var config = getConfig();
    config.series.forEach(function(serie, i, arr) {
      var tmp = serie.title.split(':');
      var area = tmp.splice(0, 1);
      var title = tmp.join(':');
      series[area] = series[area] || [];
      series[area].push({
        id: i,
        title: title,
        layer: serie.layer,
        template: serie.template,
        formatFunctions: serie.formatFunctions
      });
    });
    return series;
  }

  function getJsTreeData() {
    seriesTree = [];
    var data = getGroupedByArea();
    for (var area in data) {
      var series = data[area];
      series.forEach(function(serie, i, arr) {
        arr[i] = {
          id: serie.id,
          text: serie.title,
          icon: 'jstree-file',
          layer: serie.layer,
          template: serie.template,
          formatFunctions: serie.formatFunctions
        };
      });
      seriesTree.push({
        text: area,
        children: series
      });
    }
    return seriesTree;
  }

  function markEdited(pos) {
    var config = getConfig();
    config.series[pos].edited = true;
    setConfig(config, false);
  }

  function getGeoJsonPath() {
    var config = getConfig();
    var result = null;
    config.series.every(function(serie) {
      if (serie.edited === true) {
        result = 'geojson/' + serie.layer + '.json';
        return false;
      }
      return true;
    });
    return result;
  }

  function getTemplatePath() {
    var config = getConfig();
    var result = null;
    config.series.every(function(serie) {
      if (serie.edited === true) {
        result = 'template/' + serie.template;
        return false;
      }
      return true;
    });
    return result;
  }

  function getTitle() {
    var config = getConfig();
    var result = null;
    config.series.every(function(serie) {
      if (serie.edited === true) {
        result = serie.title;
        return false;
      }
      return true;
    });
    return result;
  }

  function getConfigPath() {
    return 'config.js';
  }

  function getStringData() {
    var config = getConfig();
    config.series.forEach(function(serie) {
      if (serie.edited === true) {
        delete serie.edited;
      }
    });
    var prefix = 'var mapseries = {};\nmapseries.config = ';
    return prefix + serializer(config);
  }

  return {
    loadConfig: loadConfig,
    getAreas: getAreas,
    createSerie: createSerie,
    getJsTreeData: getJsTreeData,
    markEdited: markEdited,
    getGeoJsonPath: getGeoJsonPath,
    getTemplatePath: getTemplatePath,
    getTitle: getTitle,
    getConfigPath: getConfigPath,
    getStringData: getStringData
  };
};
