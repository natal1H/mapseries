var validate = require('../lib/validate'),
    CodeMirror = require('codemirror');

require('codemirror/mode/javascript/javascript');

module.exports = function(context) {

    // Static initialization
    CodeMirror.keyMap.tabSpace = {
        Tab: function(cm) {
            var spaces = new Array(cm.getOption('indentUnit') + 1).join(' ');
            cm.replaceSelection(spaces, 'end', '+input');
        },
        fallthrough: ['default']
    };

    // Variables
    var container = null,
        confirmButton = null,
        textarea = null,
        editor = null,
        onEditorChanged = null,
        valid = true;

    // API functions
    function init(selection, cb) {
      container = selection;
      confirmButton = cb;
      textarea = container.append('textarea');
      editor = CodeMirror.fromTextArea(textarea.node(), {
          mode: 'application/json',
          matchBrackets: true,
          tabSize: 2,
          gutters: ['error'],
          theme: 'eclipse',
          autofocus: (window === window.top),
          keyMap: 'tabSpace',
          lineNumbers: true
      });

      onEditorChanged = validate(function(err, data, zoom) {
          if (err) {
            valid = false;
            confirmButton.classed('disabled', true);
          } else {
            valid = true;
            confirmButton.classed('disabled', false);
          }
      });
    }

    function show() {
      container.style({display: 'block'});
      var data = context.data.get('map');
      editor.setValue(JSON.stringify(data, null, 2));
      valid = true;
      markClean();
      editor.on('change', onEditorChanged);
    }

    function hide() {
      confirmChanges();
      container.style({display: 'none'});
      editor.off('change', onEditorChanged);
    }

    function destroy() {
      container = null;
      confirmButton = null;
      editor = null;
      onEditorChanged = null;
    }

    function getTitle() {
      return "geojson";
    }

    function confirmChanges() {
      if (valid && isDirty()) {
        var data = editor.getValue();
        context.data.set({map: JSON.parse(data)}, 'geojson');
        markClean();
      }
    }

    // Private functions
    function markDirty() {
      confirmButton.classed('disabled', false);
    }

    function markClean() {
      confirmButton.classed('disabled', true);
      editor.markClean();
    }

    function isDirty() {
      return !editor.isClean();
    }

    return {
      init: init,
      show: show,
      hide: hide,
      destroy: destroy,
      getTitle: getTitle,
      confirmChanges: confirmChanges
    };
};
