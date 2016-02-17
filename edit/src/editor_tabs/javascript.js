module.exports = function(context, type) {

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
      onEditorChanged = null;

  // API functions
  function init(selection, cb) {
    container = selection;
    confirmButton = cb;
    textarea = container.append('textarea');
    editor = CodeMirror.fromTextArea(textarea.node(), {
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

    onEditorChanged = function() {
      markDirty();
    }
  }

  function show() {
    container.style({display: 'block'});
    editor.setValue(context.data.get(type));
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
    textarea = null;
    editor = null;
    onEditorChanged = null;
  }

  function getTitle() {
    return type;
  }

  function confirmChanges() {
    if (isDirty()) {
      var obj = {};
      obj[type] = editor.getValue();
      context.data.set(obj, 'editor.' + type);
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
