module.exports = function(context) {
    // var bounds = context.mapLayer.getBounds();
    // if (bounds.isValid()) context.map.fitBounds(bounds);
    var bbox = turf.bbox(context.data.get('map'));
    if (bbox) {
      context.map.fitBounds(bbox);
    }
};
