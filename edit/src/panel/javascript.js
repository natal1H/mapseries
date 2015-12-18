var validate = require('../lib/validate'),
    loading = require('../ui/loading.js');

module.exports = function(context, type) {

  var config = require('../lib/config')(context);

  CodeMirror.keyMap.tabSpace = {
      Tab: function(cm) {
          var spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
          cm.replaceSelection(spaces, 'end', '+input');
      },
      fallthrough: ['default']
  };

    function saveAction() {
        saver(context);
        return false;
    }

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
            mode: 'javascript',
            matchBrackets: true,
            tabSize: 2,
            gutters: ['CodeMirror-lint-markers'],
            lint: type == 'config',
            theme: 'eclipse',
            autofocus: (window === window.top),
            keyMap: 'tabSpace',
            lineNumbers: true
        });

        renderer.confirmChanges = function() {
          if (renderer.dirty) {
            var obj = {};
            obj[type] = renderer.editor.getValue();
            context.data.set(obj, 'editor.' + type);
            renderer.dirty = false;
          }
        };

        renderer.changedEvent = function() {
          renderer.dirty = true;
        };

        confirmButton.on('click', renderer.confirmChanges);

        renderer.editor.setValue(context.data.get(type));

        context.dispatch.on('change.editor.' + type, function(event) {
          if (event.source !== 'editor.' + type && event.obj[type]) {
            var scrollInfo = renderer.editor.getScrollInfo();
            renderer.editor.setValue(event.obj[type]);
            renderer.editor.scrollTo(scrollInfo.left, scrollInfo.top);
          }
        });

        renderer.editor.on('change', renderer.changedEvent);
        loading.hide();
    };

    renderer.off = function() {
        context.dispatch.on('change.editor.' + type, null);
        renderer.editor.off('change', renderer.changedEvent);
        renderer.confirmChanges();
    };

    return renderer;
};
