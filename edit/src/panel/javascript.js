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

    function render(selection) {
        var textarea = selection
            .html('')
            .append('textarea');

        var editor = CodeMirror.fromTextArea(textarea.node(), {
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

        editor.setValue(context.data.get(type));

        editor.on('change', changed);

        function changed() {
          var obj = {};
          obj[type] = editor.getValue();
          context.data.set(obj, 'editor.' + type);
        }

        context.dispatch.on('change.editor.' + type, function(event) {
          if (event.source !== 'editor.' + type && event.obj[type]) {
            var scrollInfo = editor.getScrollInfo();
            editor.setValue(event.obj[type]);
            editor.scrollTo(scrollInfo.left, scrollInfo.top);
          }
        });
    }

    render.off = function() {
        context.dispatch.on('change.json', null);
    };

    return render;
};
