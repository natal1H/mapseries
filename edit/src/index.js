var ui = require('./ui'),
    map = require('./ui/map'),
    data = require('./core/data'),
    loader = require('./core/loader'),
    router = require('./core/router'),
    repo = require('./core/repo'),
    user = require('./core/user'),
    api = require('./core/api'),
    texts = require('./core/texts'),
    store = require('store');

var gjIO = geojsonIO(),
    gjUI = ui(gjIO).write;

d3.select('.geojsonio').call(gjUI);

gjIO.router.on();

api(gjIO);

function geojsonIO() {
    var context = {};
    context.dispatch = d3.dispatch('change', 'route', 'clear', 'init_dirty', 'open_serie', 'discardWork');
    context.storage = store;
    context.map = map(context);
    context.data = data(context);
    context.dispatch.on('route', loader(context));
    context.repo = repo(context);
    context.router = router(context);
    context.user = user(context);
    context.texts = texts();
    return context;
}
