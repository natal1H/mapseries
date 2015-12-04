var validate = require('../lib/validate');

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

    renderer.render = function(selection) {
        var textarea = selection
            .html('')
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

        renderer.changed = function() {
          var obj = {};
          obj[type] = renderer.editor.getValue();
          context.data.set(obj, 'editor.' + type);
        }

        renderer.editor.setValue(context.data.get(type));

        renderer.editor.on('change', renderer.changed);

        context.dispatch.on('change.editor.' + type, function(event) {
          if (event.source !== 'editor.' + type && event.obj[type]) {
            var scrollInfo = renderer.editor.getScrollInfo();
            renderer.editor.setValue(event.obj[type]);
            renderer.editor.scrollTo(scrollInfo.left, scrollInfo.top);
          }
        });
    }

    renderer.off = function() {
        context.dispatch.on('change.json', null);
        renderer.editor.off('change', renderer.changed);
    };

    return renderer;
};
