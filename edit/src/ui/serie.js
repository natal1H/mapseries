module.exports = function(context) {

  var loading = require('./loading'),
      flash = require('./flash'),
      github = require('../source/github')(context),
      config = require('../lib/config')(context),
      meta = require('../lib/meta.js');

  function newOne(title, area) {
    config.createSerie(title, area);
    meta.clear(context);

    github.readFile('template/template.txt', function(err, data) {
      if (err) {
        console.error(err);
        flash(context.container, context.texts.unexpectedError);
        return;
      }
      context.data.set({template: data}, 'buttons');
      context.editor.openTab('template', 'javascript', false);
      context.editor.openTab('config', 'javascript', false);
      context.editor.openTab('geojson', 'geojson', true);
      context.dispatch.open_serie();
    });
  }

  function open(id) {
    loading.show();

    config.markEdited(id);

    var errmsg = context.texts.unexpectedError;
    var geojsonPath = config.getGeoJsonPath();
    var templatePath = config.getTemplatePath();

    context.dispatch.clear();

    github.readFile(geojsonPath, function(err, data) {
      if (err) {
        loading.hide();
        console.error(err);
        flash(context.container, errmsg);
        return;
      }
      context.data.set({map: JSON.parse(data), dirty: false}, 'file_bar');
      github.readFile(templatePath, function(err, data) {
        loading.hide();
        if (err) {
          console.error(err);
          flash(context.container, errmsg);
          return;
        }
        context.data.set({template: data, dirty: false}, 'file_bar');
        context.editor.openTab('template', 'javascript', false);
        context.editor.openTab('config', 'javascript', false);
        context.editor.openTab('geojson', 'geojson', true);
        meta.zoomextent(context);
        context.dispatch.open_serie();
      });
    });
  }

  function save(callback) {
    if (!context.data.dirty) {
      callback.call(this);
      return;
    }

    var geojsonData = JSON.stringify(context.data.get('map'), null, 2);
    var templateData = context.data.get('template');
    var configData = config.getStringData();

    var geojsonPath = config.getGeoJsonPath();
    var templatePath = config.getTemplatePath();
    var configPath = config.getConfigPath();

    github.writeFile(geojsonPath, geojsonData, 'Updated ' + geojsonPath, function(err) {
      if (err) {
        callback.call(this, err);
        return;
      }
      github.writeFile(templatePath, templateData, 'Updated ' + templatePath, function(err) {
        if (err) {
          callback.call(this, err);
          return;
        }
        github.writeFile(configPath, configData, 'Updated ' + configPath, function(err) {
          if (err) {
            callback.call(this, err);
            return;
          }
          context.data.dirty = false;
          context.dispatch.change({obj: {}, source: 'serie'});
          context.dispatch.save_serie();
          callback.call(this);
        });
      });
    });
  }

  return {
    newOne: newOne,
    open: open,
    save: save
  };
};
