module.exports = function(hostname) {
    // Settings for geojson.io
    L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlpIdEpjOHcifQ.Cldl4wq_T5KOgxhLvbjE-w';
    if (hostname === 'mapseries.mzk.cz') {
        return {
            client_id: '70c8690c165d40b7079d',
            gatekeeper_url: 'http://mapseries.mzk.cz/github-proxy/',
        };
    // Customize these settings for your own development/deployment
    // version of geojson.io.
    } else {
        L.mapbox.config.HTTP_URL = 'http://a.tiles.mapbox.com/v4';
        L.mapbox.config.HTTPS_URL = 'https://a.tiles.mapbox.com/v4';
        L.mapbox.config.FORCE_HTTPS = true;
        L.mapbox.config.REQUIRE_ACCESS_TOKEN = true;
        return {
            GithubAPI: null,
            client_id: 'bb7bbe70bd1f707125bc',
            gatekeeper_url: 'https://localhostauth.herokuapp.com'
        };
    }
};
