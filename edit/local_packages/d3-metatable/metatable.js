if (typeof module !== 'undefined') {
    module.exports = function(d3) {
        return metatable;
    };
}

var $ = require('jquery');
require('jquery-ui');

function metatable(texts) {
    var event = d3.dispatch('change', 'rowfocus', 'beforestructurechanged', 'structurechanged');

    function table(selection) {
        selection.each(function(d) {
            var sel = d3.select(this),
                table;

            var autocompleteData = {}
            d.forEach(function(d) {
              Object.keys(d).forEach(function(key) {
                if (!(key in autocompleteData)) {
                  autocompleteData[key] = new Set();
                }
                autocompleteData[key].add(d[key]);
              });
            });

            var keyset = d3.set();
            d.map(Object.keys).forEach(function(k) {
                k.forEach(function(_) {
                    keyset.add(_);
                });
            });

            bootstrap();
            paint();

            function bootstrap() {

                var controls = sel.selectAll('.controls')
                    .data([d])
                    .enter()
                    .append('div')
                    .attr('class', 'controls');

                var colbutton = controls.append('button')
                    .on('click', function() {
                        var name = prompt(texts.newColumnMsg);
                        if (name) {
                            event.beforestructurechanged();
                            keyset.add(name);
                            paint();
                            event.structurechanged();
                        }
                    });
                colbutton.append('span').attr('class', 'icon-plus');
                colbutton.append('span').text(' ' + texts.newColumn);

                var enter = sel
                    .append('div')
                    .attr('class', 'tabledata')
                    .selectAll('table')
                    .data([d])
                    .enter()
                    .append('table');

                var thead = enter.append('thead');
                var tbody = enter.append('tbody');
                var tr = thead.append('tr');

                table = sel.select('table');
            }

            function paint() {

                var keys = keyset.values();

                var th = table
                    .select('thead')
                    .select('tr')
                    .selectAll('th')
                    .data(keys, function(d) { return d; });

                var thEnter = th.enter().append('th');

                thEnter.append('span')
                    .text(String);

                var delbutton = thEnter.append('button'),
                    renamebutton = thEnter.append('button'),
                    fillbutton = thEnter.append('button');

                th.exit().remove();

                var tr = table.select('tbody').selectAll('tr')
                    .data(function(d) { return d; });

                tr.enter()
                    .append('tr');

                tr.exit().remove();

                var td = tr.selectAll('td')
                    .data(keys, function(d) { return d; });

                td.enter()
                    .append('td')
                    .append('input')
                    .attr('field', String)
                    .each(function(d) {
                      if (autocompleteData[d]) {
                        $(this).autocomplete({
                          source: Array.from(autocompleteData[d])
                        })
                      }
                    });

                td.exit().remove();

                delbutton.on('click', deleteClick);
                delbutton.append('span').attr('class', 'icon-minus');
                delbutton.append('span').text(' ' + texts.deleteColumn);

                renamebutton.append('span').text(' ' + texts.renameColumn);
                renamebutton.on('click', renameClick);

                fillbutton.on('click', fillClick);
                fillbutton.append('span').text(' ' + texts.fillColumn);

                function deleteClick(d) {
                    var name = d;
                    if (confirm(texts.deleteColumnConfirm + ' ' + name + '?')) {
                        event.beforestructurechanged();
                        keyset.remove(name);
                        tr.selectAll('input')
                            .data(function(d, i) {
                                var map = d3.map(d);
                                map.remove(name);
                                var reduced = mapToObject(map);
                                event.change(reduced, i);
                                return {
                                    data: reduced,
                                    index: i
                                };
                            });
                        paint();
                        event.structurechanged();
                    }
                }

                function renameClick(d) {
                    var name = d;
                    var newname = prompt(texts.newNameColumnMsg + ' ' + name + '?');
                    if (newname) {
                        event.beforestructurechanged();
                        keyset.remove(name);
                        keyset.add(newname);

                        if (name != newname) {
                            autocompleteData[newname] = autocompleteData[name];
                            delete autocompleteData[name];
                        }

                        tr.selectAll('input')
                            .data(function(d, i) {
                                var map = d3.map(d);
                                map.set(newname, map.get(name));
                                map.remove(name);
                                var reduced = mapToObject(map);
                                event.change(reduced, i);
                                return {
                                    data: reduced,
                                    index: i
                                };
                            });
                        paint();
                        event.structurechanged();
                    }
                }

                function fillClick(d) {
                  var name = d;
                  var value = prompt(texts.fillColumnMsg);
                  if (value) {
                    tr.selectAll('input')
                      .data(function(d, i) {
                        if (!d[name]) {
                          d[name] = value;
                        }
                        event.change(d, i);
                        return {
                          data: d,
                          index: i
                        }
                      });
                    paint();
                  }
                }

                function coerceNum(x) {
                    var fl = parseFloat(x);
                    if (fl.toString() === x) return fl;
                    else return x;
                }

                function write(d) {
                    d.data[d3.select(this).attr('field')] = coerceNum(this.value);
                    event.change(d.data, d.index);
                }

                function mapToObject(map) {
                    return map.entries()
                        .reduce(function(memo, d) {
                            memo[d.key] = d.value;
                            return memo;
                        }, {});
                }

                tr.selectAll('input')
                    .data(function(d, i) {
                        return d3.range(keys.length).map(function() {
                            return {
                                data: d,
                                index: i
                            };
                        });
                    })
                    .classed('disabled', function(d) {
                        return d.data[d3.select(this).attr('field')] === undefined;
                    })
                    .property('value', function(d) {
                        var value = d.data[d3.select(this).attr('field')];
                        return !isNaN(value) ? value : value || '';
                    })
                    .on('keyup', write)
                    .on('change', write)
                    .on('click', function(d) {
                        if (d.data[d3.select(this).attr('field')] === undefined) {
                            d.data[d3.select(this).attr('field')] = '';
                            paint();
                        }
                    })
                    .on('focus', function(d) {
                        event.rowfocus(d.data, d.index);
                    });
            }
        });
    }

    return d3.rebind(table, event, 'on');
}
