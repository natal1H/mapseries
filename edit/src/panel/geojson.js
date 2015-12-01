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

    function render(selection) {
        var textarea = selection
            .html('')
            .append('textarea');

        var editor = CodeMirror.fromTextArea(textarea.node(), {
            mode: 'application/json',
            matchBrackets: true,
            tabSize: 2,
            gutters: ['error'],
            theme: 'eclipse',
            autofocus: (window === window.top),
            keyMap: 'tabSpace',
            lineNumbers: true
        });

        var data = context.data.get('map');
        editor.setValue(JSON.stringify(data, null, 2));

        editor.on('change', validate(changeValidated));

        function changeValidated(err, data, zoom) {
            if (!err) {
              context.data.set({map: data}, 'json');
              if (zoom) zoomextent(context);
            }
        }

        context.dispatch.on('change.json', function(event) {
            if (event.source !== 'json' && event.obj.map) {
                var scrollInfo = editor.getScrollInfo();
                editor.setValue(JSON.stringify(context.data.get('map'), null, 2));
                editor.scrollTo(scrollInfo.left, scrollInfo.top);
            }
        });
    }

    render.off = function() {
        context.dispatch.on('change.json', null);
    };

    return render;
};
