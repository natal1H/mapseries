module.exports = function(hostname) {

  if (hostname === 'mapseries.mzk.cz') {
    return {
      client_id: '70c8690c165d40b7079d',
      gatekeeper_url: 'http://mapseries.mzk.cz/server',
    };
  // Customize these settings for your own development/deployment
  // version of geojson.io.
} else if (hostname === 'mapseries.devel.mzk.cz') {
    return {
      client_id: '5395a41f086b3fcaa499',
      gatekeeper_url: 'http://mapseries.devel.mzk.cz/server',
    };
  } else {
      return {
        client_id: 'bb7bbe70bd1f707125bc',
        gatekeeper_url: 'https://localhostauth.herokuapp.com'
      };
    }
};
