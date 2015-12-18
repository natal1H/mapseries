var validate = require('../lib/validate'),
    zoomextent = require('../lib/zoomextent'),
    loading = require('../ui/loading.js');

module.exports = function(context) {

    CodeMirror.keyMap.tabSpace = {
        Tab: function(cm) {
            var spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
            cm.replaceSelection(spaces, 'end', '+input');
        },
        fallthrough: ['default']
    };

    var renderer = {}
    renderer.dirty = false;

    renderer.render = function(selection) {

        selection = selection.html('');

        var confirmButton = selection
            .append('button')
            .attr('class', 'confirm')
            .text(context.texts.confirmChanges);

        selection
            .append('a')
            .attr('class', 'control')
            .attr('href', 'http://unicode-table.com')
            .attr('target', '_blank')
            .text(context.texts.specialCharacters)

        var textarea = selection
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
            if (err) {
              confirmButton.classed('disabled', true);
            } else {
              confirmButton.classed('disabled', false);
              renderer.dirty = true;
            }
        });

        renderer.confirmChanges = function() {
          if (renderer.dirty) {
            context.data.set({map: JSON.parse(renderer.editor.getValue())}, 'json');
            renderer.dirty = false;
          }
        }

        confirmButton.on('click', renderer.confirmChanges);

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
        loading.hide();
    }

    renderer.off = function() {
        context.dispatch.on('change.json', null);
        renderer.editor.off('change', renderer.changeValidated);
        renderer.confirmChanges();
    };

    return renderer;
};
