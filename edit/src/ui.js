var editor = require('./ui/editor'),
    file_bar = require('./ui/file_bar'),
    dnd = require('./ui/dnd'),
    userUi = require('./ui/user'),
    layer_switch = require('./ui/layer_switch');

module.exports = ui;

function ui(context) {

    var map = null;

    function init(selection) {

        var container = selection
            .append('div')
            .attr('class', 'container');

        map = container
            .append('div')
            .attr('class', 'map')
            .call(context.map)
            .call(layer_switch(context).init);

        context.container = container;

        return container;
    }

    function render(selection) {

        var container = init(selection);

        context.editor = editor(context);
        container
            .append('div')
            .attr('class', 'editor')
            .call(context.editor.init);

        var fileBar = container
            .append('div')
            .attr('class', 'file-bar')
            .call(file_bar(context));

        fileBar
            .append('div')
            .attr('class', 'user fr deemphasize')
            .call(userUi(context));

        context.dispatch.on('select_layer.ui', function(layer) {
          map.style({display: 'none'});
          context.editor.show();
          context.editor.selectLayer(layer);
        });

        context.dispatch.on('switch_to_map', function() {
          map.style({display: 'block'});
          context.editor.hide();
        });

        dnd(context);
    }

    return {
        read: init,
        write: render
    };
}
