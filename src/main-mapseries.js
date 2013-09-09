goog.provide('ms');

goog.require('ms.Search');

/**
 * Main function.
 */
ms.main = function() {

  var config = mapseries['config'];
  var search = new ms.Search();
  search.init(config);
};

goog.exportSymbol('main', ms.main);
