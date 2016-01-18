var buttons = require('./ui/mode_buttons'),
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
            .call(layer_switch(context));

        context.container = container;

        return container;
    }

    function render(selection) {

        var container = init(selection);

        var editor = container
            .append('div')
            .attr('class', 'editor');

        var top = editor
            .append('div')
            .attr('class', 'top');

        var pane = editor
            .append('div')
            .attr('class', 'pane');

        context.editor = buttons(context, pane);

        top
            .append('div')
            .attr('class', 'buttons')
            .call(context.editor.update);

        var fileBar = container
            .append('div')
            .attr('class', 'file-bar')
            .call(file_bar(context));

        fileBar
            .append('div')
            .attr('class', 'user fr deemphasize')
            .call(userUi(context));

        context.dispatch.on('select_layer.ui', function() {
          map.style({display: 'none'});
          editor.style({display: 'block'});
        });

        context.dispatch.on('switch_to_map', function() {
          map.style({display: 'block'});
          editor.style({display: 'none'});
          context.map.invalidateSize();
        });

        dnd(context);
    }

    return {
        read: init,
        write: render
    };
}
