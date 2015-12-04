var validate = require('../lib/validate'),
    zoomextent = require('../lib/zoomextent');

module.exports = function(context) {

    CodeMirror.keyMap.tabSpace = {
        Tab: function(cm) {
            var spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
            cm.replaceSelection(spaces, 'end', '+input');
        },
        fallthrough: ['default']
    };

    var renderer = {}

    renderer.render = function(selection) {
        var textarea = selection
            .html('')
            .append('textarea');

        renderer.editor = CodeMirror.fromTextArea(textarea.node(), {
            mode: 'application/json',
            matchBrackets: true,
            tabSize: 2,
            gutters: ['error'],
            theme: 'eclipse',
            autofocus: (window === window.top),
            keyMap: 'tabSpace',
            lineNumbers: true
        });

        renderer.changeValidated = validate(function(err, data, zoom) {
            if (!err) {
              context.data.set({map: data}, 'json');
              if (zoom) zoomextent(context);
            }
        });

        var data = context.data.get('map');
        renderer.editor.setValue(JSON.stringify(data, null, 2));

        renderer.editor.on('change', renderer.changeValidated);

        context.dispatch.on('change.json', function(event) {
            if (event.source !== 'json' && event.obj.map) {
                var scrollInfo = renderer.editor.getScrollInfo();
                renderer.editor.setValue(JSON.stringify(context.data.get('map'), null, 2));
                renderer.editor.scrollTo(scrollInfo.left, scrollInfo.top);
            }
        });
    }

    renderer.off = function() {
        context.dispatch.on('change.json', null);
        renderer.editor.off('change', renderer.changeValidated);
    };

    return renderer;
};
