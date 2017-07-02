var qs = require('qs-hash'),
    zoomextent = require('../lib/zoomextent'),
    flash = require('../ui/flash'),
    loading = require('../ui/loading'),
    github = require('../source/github');

module.exports = function(context) {

    function success(err, d) {
        context.container.select('.map').classed('loading', false);

        var message,
            url = /(http:\/\/\S*)/g;

        if (err) {
            try {
                message = err.message || JSON.parse(err.responseText).message
                    .replace(url, '<a href="$&">$&</a>');
            } catch(e) {
                message = 'Sorry, an error occurred.';
            }
            return flash(context.container, message);
        }

        context.data.parse(d);

        if (!qs.stringQs(location.hash.substring(1)).map || mapDefault()) {
            zoomextent(context);
        }
    }

    function mapDefault() {
        return context.map.getZoom() == 2 || context.map.getCenter().equals(new LngLat(20,  0));
    }

    function inlineJSON(data) {
        try {
            context.data.set({
                map: JSON.parse(data)
            });
            location.hash = '';
            zoomextent(context);
        } catch(e) {
            return flash(context.container, 'Could not parse JSON');
        }
    }

    function loadUrl(data) {
        d3.json(data)
            .on('load', onload)
            .on('error', onerror)
            .get();

        function onload(d) {
            context.data.set({ map: d });
            location.hash = '';
            zoomextent(context);
        }

        function onerror() {
            return flash(context.container, 'Could not load external file. External files must be served with CORS and be valid GeoJSON.');
        }
    }

    function openSerie(serieId) {
        var config = require('../lib/config')(context),
            serie = require('../ui/serie')(context);

        loading.show();
        config.loadConfig(function(err) {
          loading.hide();
          if (err) {
            flash(context.container, context.texts.unexpectedError);
            return;
          }
          serie.open(serieId);
        });
    }

    function loader(query, isAuth) {
        if (!query.id && !query.data && !query.mapserie) return;

        var oldRoute = d3.event ? qs.stringQs(d3.event.oldURL.split('#')[1]).id :
            context.data.get('route');

        if (query.data) {
            var type = query.data.match(/^(data\:[\w\-]+\/[\w\-]+\,?)/);
            if (type) {
                if (type[0] == 'data:application/json,') {
                    inlineJSON(query.data.replace(type[0], ''));
                } else if (type[0] == 'data:text/x-url,') {
                    loadUrl(query.data.replace(type[0], ''));
                }
            }
        } else if (query.mapserie) {
          if (isAuth) {
            openSerie(query.mapserie);
          } else {
            flash(context.container, context.texts.loginRequired);
          }
        } else if (query.id !== oldRoute) {
            context.container.select('.map').classed('loading', true);
            context.data.fetch(query, success);
        }
    }

    return function(query) {
        if (context.storage.get('github_token')) {
          loading.show();
          github(context).init(function() {
            loading.hide();
            loader(query, true);
          });
        } else {
          loader(query, false);
        }
    };
};
