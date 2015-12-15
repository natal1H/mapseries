var geojson = require('../panel/geojson'),
    javascript = require('../panel/javascript'),
    table = require('../panel/table');

module.exports = function(context, pane) {

  var mode = null;
  var selection = null;

  var tabs = [];
  var idCounter = 0;

  context.dispatch.on('beforeclear.tabs', function() {
    if (mode) {
      mode.off();
    }
    tabs = [];
    update();
    pane.html('');
  });

  context.dispatch.on('before_save.tabs', function() {
    if (mode) {
      mode.confirmChanges();
    }
  });

  function update(s) {
    selection = s || selection;
    var buttons = selection
        .selectAll('button')
        .data(tabs, function(d) { return d.title; });

    var enter = buttons.enter()
        .append('button')
        .attr('title', function(d) { return d.alt; });
    enter.append('span')
        .attr('class', function(d) { return 'icon-' + d.icon; });
    enter
        .append('span')
        .text(function(d) { return ' ' + d.title; });

    buttons.exit().remove();

    buttons.on('click', buttonClick);

    d3.select(buttons.node()).trigger('click');

    function buttonClick(d) {
        buttons.classed('active', function(_) { return d.title == _.title; });
        if (mode) {
          mode.off();
        }
        mode = d.behavior(context, d.title);
        pane.call(mode.render);
    }
  }

  function getBehavior(type) {
    var behaviors = {
      geojson: geojson,
      javascript: javascript,
      table: table
    };
    return behaviors[type];
  }

  function openTabInternal(title, type) {
    var tab = {
      title: title,
      icon: 'code',
      behavior: getBehavior(type)
    };
    tabs.push(tab);
  }

  function openTab(title, type, doUpdate) {
    doUpdate = doUpdate === undefined ? true : doUpdate;
    var tab = getTab(title);

    if (!tab) {
      openTabInternal(title, type);
    }

    if (doUpdate) {
      update();
    }
  }

  function getTab(title) {
    var result = null;
    tabs.forEach(function(tab) {
      if (tab.title == title) {
        result = tab;
        return;
      }
    });
    return result;
  }

  return {
    update: update,
    openTab: openTab,
    getTab: getTab
  };

};
