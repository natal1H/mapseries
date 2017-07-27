var turf = require('turf'),
    $ = require('jquery');

module.exports = function(context) {
    // var bounds = context.mapLayer.getBounds();
    // if (bounds.isValid()) context.map.fitBounds(bounds);
    var bbox = turf.bbox(context.data.get('map'));
    if (bbox && !$.inArray(Infinity, bbox) && !$.inArray(-Infinity, bbox)) {
      context.map.fitBounds(bbox);
    }
};
