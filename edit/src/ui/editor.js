var geojson = require('../editor_tabs/geojson'),
    javascript = require('../editor_tabs/javascript'),
    table = require('../editor_tabs/table');

module.exports = function(context, pane) {

  // Variables
  var selection = null,
      tableEditor = null,
      editors = null,
      active = null,
      tabContainer = null,
      editorContainer = null,
      confirmButton = null,
      switchToMapButton = null,
      tabs = null;

  // API functions
  function init(s) {
    selection = s;
    tableEditor = table(context);
    editors = [
      tableEditor,
      geojson(context),
      javascript(context, 'template'),
      javascript(context, 'config'),
    ];
    active = editors[0];

    tabContainer = selection
        .append('div')
        .attr('class', 'tab-container');

    editorContainer = selection
        .append('div')
        .attr('class', 'editor-container');

    confirmButton = editorContainer
        .append('button')
        .attr('class', 'fr toolbar')
        .text(context.texts.confirmChanges)
        .on('click', confirmChanges);

    switchToMapButton = editorContainer
        .append('button')
        .attr('class', 'fr toolbar')
        .text(context.texts.switchToMap)
        .on('click', switchToMap);

    editorContainer
        .append('a')
        .attr('class', 'control')
        .attr('href', 'http://unicode-table.com')
        .attr('target', '_blank')
        .text(context.texts.specialCharacters);

    drawTabs(tabContainer);
    tabs.classed('active', function(_) { return active.getTitle() == _.getTitle(); });

    editors.forEach(function(editor) {
      var editorSelection = editorContainer
          .append('div')
          .attr('class', 'editor-' + editor.getTitle())
          .style({display: 'none'});
      editor.init(editorSelection, confirmButton);
    });

    context.dispatch.on('before_save.editor', function() {
      active.confirmChanges();
    });

    context.dispatch.on('clear.editor', function() {
      active.hide();
    });

    context.dispatch.on('open_serie.editor', function() {
      active.show();
    });
  }

  function show() {
    selection.style({display: 'block'});
    active.show();
  }

  function hide() {
    active.hide();
    selection.style({display: 'none'});
  }

  function destroy() {
    active.hide();
    selection = null;
    editors.forEach(function(editor) {
      editor.destroy();
    });
    editors = null;
    tableEditor = null;
    active = null;
    tabContainer = null;
    editorContainer = null;
    tabs = null;

    context.dispatch.on('before_save.editor', null);
    context.dispatch.on('clear.editor', null);
    context.dispatch.on('open_serie.editor', null);
  }

  function selectLayer(layer) {
    if (active !== tableEditor) {
      active.hide();
      active = tableEditor;
      active.show();
    }
    active.selectLayer(layer);
  }

  // Private functions
  function drawTabs(container) {
    tabs = container
      .selectAll('button')
      .data(editors, function(d) { return d.getTitle(); });

    tabs.enter()
      .append('button')
      .attr('title', function(d) { return d.getTitle(); })
      .append('span')
      .text(function(d) { return d.getTitle(); });

    tabs.on('click', tabClick);
  }

  function tabClick(editor) {
    tabs.classed('active', function(_) { return editor.getTitle() == _.getTitle(); });
    active.hide();
    active = editor;
    active.show();
  }

  function switchToMap() {
    context.dispatch.switch_to_map();
  }

  function confirmChanges() {
    active.confirmChanges();
  }

  return {
    init: init,
    show: show,
    hide: hide,
    destroy: destroy,
    selectLayer: selectLayer
  };

};
