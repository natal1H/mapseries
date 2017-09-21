var d3 = require('d3');

module.exports = function(context) {

  var layers = [
    {
     title: 'OSM',
     tiles: [
       'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
       'http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'
     ]
    },
    {
      title: 'OCM',
      tiles: [
        'http://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png',
        'http://b.tile.thunderforest.com/cycle/{z}/{x}/{y}.png'
      ],
    }
  ];

  var selection = null;
  var layerButtons = [];

  var layerSwap = function(d) {
      var clicked = this instanceof d3.selection ? this.node() : this;
      layerButtons.classed('active', function() {
          return clicked === this;
      });
      if (d.tiles) {
        context.map.removeSource('base-map-source');
        context.map.addSource('base-map-source', {
            "type": "raster",
            "tiles": d.tiles,
            "tileSize": 256
        });
      }
  };

  function update(selection) {
    layerButtons = selection.append('div')
      .attr('class', 'layer-switch')
      .selectAll('button')
      .data(layers)
      .enter()
      .append('button')
      .attr('class', 'pad0x')
      .on('click', layerSwap)
      .text(function(d) { return d.title; });

    layerButtons.filter(function(d, i) { return i === 0; }).call(layerSwap);
  }

  context.layerSwitch = {
    init: function(s) {
      selection = s;
      update(selection);
    },

    addLayer: function(name, url) {
      layers.push({
        title: name,
        tiles: [url]
      });
      update(selection);
    }
  };

  return context.layerSwitch;

};
