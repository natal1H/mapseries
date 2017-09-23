import mapboxgl from 'mapbox-gl'
import $ from 'jquery'
import bootbox from 'bootbox'
import loading from 'js/loading'
import turf from 'turf'

showError = (msg) ->
  bootbox.alert {
    size: 'large',
    title: window.msg.error,
    message: msg
  }

export default {
  main: ->
    # default zoom, center and rotation
    zoom = 5
    center = [20, 46]
    bearing = 0
    pitch = 0

    if window.location.hash != ''
      # try to restore center, zoom-level and rotation from the URL
      hash = window.location.hash.replace('#map=', '')
      parts = hash.split('/')
      if parts.length == 5
        zoom = parseInt(parts[0], 10)
        center = [
          parseFloat(parts[1]),
          parseFloat(parts[2])
        ]
        bearing = parseFloat(parts[3])
        pitch = parseFloat(parts[4])

    map = new mapboxgl.Map
        container: 'map'
        style:
            "version": 8
            "sources":
                "base-map-source":
                    "type": "raster"
                    "tiles": [
                        "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        "http://b.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    ],
                    "tileSize": 256
            "layers": [{
                "id": "base-map-layer"
                "type": "raster"
                "source": "base-map-source"
                "minzoom": 0
                "maxzoom": 22
            }]
            "glyphs": "http://glfonts.lukasmartinelli.ch/fonts/{fontstack}/{range}.pbf"
        center: center
        zoom: zoom
        bearing: bearing
        pitch: pitch

    map.addControl(new mapboxgl.NavigationControl())

    loading.show()
    $.ajax {
      type: 'GET'
      url: "#{window.contextPath}/server/data/geojson/#{window.mapSettings.grid}.json"
      dataType: "json",
      success: (geojson) ->
        loading.hide()

        labels = []
        posFeatures = []
        negFeatures = []

        geojson.features.forEach (feature) ->
          sheetId = feature.properties.SHEET
          if sheetId in window.mapSettings.sheetIds
            posFeatures.push(feature)
          else
            negFeatures.push(feature)

        posFeatures.forEach (feature) ->
          centroid = turf.centroid(feature)
          centroid.properties = feature.properties
          labels.push(centroid)

        map.addSource("geojson-pos-source", {
          "type": "geojson"
          "data": {
            "type": "FeatureCollection",
            "features": posFeatures
          }
        })

        map.addSource("geojson-neg-source", {
          "type": "geojson"
          "data": {
            "type": "FeatureCollection",
            "features": negFeatures
          }
        })

        map.addLayer({
          "id": "geojson-pos-layer"
          "type": "fill"
          "source": "geojson-pos-source"
          "paint": {
              "fill-color": "#888"
              "fill-outline-color": "#000"
              "fill-opacity": 0.8
          }
        })

        map.addLayer({
          "id": "geojson-neg-layer"
          "type": "fill"
          "source": "geojson-neg-source"
          "paint": {
              "fill-color": "#888"
              "fill-outline-color": "#000"
              "fill-opacity": 0.2
          }
        })

        map.addSource("label-source", {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": labels
          }
        });
        map.addLayer({
          "id": "label-layer",
          "type": "symbol",
          "source": "label-source",
          "layout": {
            "text-field": "{SHEET}",
            "text-font": ["Open Sans Light"],
          }
        });

        map.on 'click', 'label-layer', (e) ->
          id = e.features[0].properties['SHEET']
          location.href = "#{window.contextPath}/sheet.xhtml?serie=#{encodeURIComponent(window.mapSettings.serie)}&sheet=#{id}"

        map.on 'mouseenter', 'label-layer', () -> map.getCanvas().style.cursor = 'pointer'
        map.on 'mouseleave', 'label-layer', () -> map.getCanvas().style.cursor = ''

      error: (err) ->
        loading.hide()
        showError "Server returned code #{err.status} with message: #{err.responseText}"
    }

    shouldUpdate = true
    updatePermalink = () ->
      if not shouldUpdate
        # do not update the URL when the view was changed in the 'popstate' handler
        return

      center = map.getCenter()
      z = map.getZoom()
      x = Math.round(center.lng * 100) / 100
      y = Math.round(center.lat * 100) / 100
      b = Math.round(map.getBearing() * 100) / 100
      p = Math.round(map.getPitch() * 100) / 100
      hash = "#map=#{z}/#{x}/#{y}/#{b}/#{p}"
      state = {
        zoom: map.getZoom()
        center: [map.getCenter().lng, map.getCenter().lat]
        bearing: map.getBearing()
        pitch: map.getPitch()
      }
      window.history.pushState(state, 'map', hash)

    map.on('moveend', updatePermalink)

    # restore the view state when navigating through the history, see
    # https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
    window.addEventListener 'popstate', (event) ->
      if event.state == null
        return

      shouldUpdate = false
      center = event.state.center
      map.setCenter(new mapboxgl.LngLat(center[0], center[1]))
      map.setZoom(event.state.zoom)
      map.setBearing(event.state.bearing)
      map.setPitch(event.state.pitch)
      shouldUpdate = true
}
