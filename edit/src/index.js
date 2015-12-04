var ui = require('./ui'),
    map = require('./ui/map'),
    data = require('./core/data'),
    loader = require('./core/loader'),
    router = require('./core/router'),
    user = require('./core/user'),
    api = require('./core/api'),
    texts = require('./core/texts'),
    store = require('store');

var context = {};
context.dispatch = d3.dispatch('change', 'route', 'beforeclear', 'clear', 'init_dirty', 'open_serie', 'save_serie', 'discardWork');
context.storage = store;
context.map = map(context);
context.data = data(context);
context.user = user(context);
context.texts = texts();
context.user.waitForAuthentization(function() {
  context.user.details(function(err, d) {
    if (!err) {
      context.storage.set('github_username', d.login);
    }
    context.dispatch.on('route', loader(context));
    context.router = router(context);
    var gjUI = ui(context).write;
    d3.select('.geojsonio').call(gjUI);
    context.router.on();
    api(context);
  });
});
