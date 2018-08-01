import 'bootstrap'
import mapboxgl from 'mapbox-gl'
import $ from 'jquery'
import bootbox from 'bootbox'
import loading from 'loading'
import turf from 'turf'
import Loader from 'loader'
import Template from 'closure/template/template'
import Series from 'model/series'


class Search

  constructor: (config) ->
    @map = null
    @series = null
    @seriess = null
    @template = new Template();
    @config = config

    @initMap()

    loader = new Loader()
    @seriess = loader.loadSeriess(@config['series']);
    @setSeries(@seriess[0])

    # initialize region switcher
    regions = Series.getRegions(@seriess)
    @updateRegions(regions)
    @setRegion('')
    @setActiveSheet(null);

  initMap: ->
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

    @map = new mapboxgl.Map
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
                "serie-source":
                  "type": "geojson"
                  "data": {
                    "type": "FeatureCollection",
                    "features": []
                  }
                "serie-source-labels":
                  "type": "geojson"
                  "data": {
                    "type": "FeatureCollection",
                    "features": []
                  }
                "serie-source-marked":
                  "type": "geojson"
                  "data": {
                    "type": "FeatureCollection",
                    "features": []
                  }
                "serie-source-labels-marked":
                  "type": "geojson"
                  "data": {
                    "type": "FeatureCollection",
                    "features": []
                  }

            "layers": [
              {
                "id": "base-map-layer"
                "type": "raster"
                "source": "base-map-source"
                "minzoom": 0
                "maxzoom": 22
              }
              {
                "id": "serie-layer"
                "type": "fill"
                "source": "serie-source"
                "paint": {
                    "fill-color": "#888"
                    "fill-outline-color": "#000"
                    "fill-opacity": 0.4
                }
              }
              {
                "id": "serie-layer-labels"
                "type": "symbol"
                "source": "serie-source-labels"
                "layout": {
                  "text-field": "{SHEET}"
                  "text-font": ["Open Sans Light"]
                }
              }
              {
                "id": "serie-layer-marked"
                "type": "fill"
                "source": "serie-source-marked"
                "paint": {
                    "fill-color": "#e67e22"
                    "fill-outline-color": "#e67e22"
                    "fill-opacity": 0.4
                }
              }
              {
                "id": "serie-layer-labels-marked"
                "type": "symbol"
                "source": "serie-source-labels-marked"
                "paint": {
                    "text-color": "#e74c3c"
                    "text-halo-color": "#f1c40f"
                    "text-halo-width": 3
                }
                "layout": {
                  "text-field": "{SHEET}"
                  "text-font": ["Open Sans Light"]
                }
              }
            ]
            "glyphs": "http://glfonts.lukasmartinelli.ch/fonts/{fontstack}/{range}.pbf"
        center: center
        zoom: zoom
        bearing: bearing
        pitch: pitch

    @map.addControl(new mapboxgl.NavigationControl())

    shouldUpdate = true
    updatePermalink = () =>
      if not shouldUpdate
        # do not update the URL when the view was changed in the 'popstate' handler
        return

      center = @map.getCenter()
      z = @map.getZoom()
      x = Math.round(center.lng * 100) / 100
      y = Math.round(center.lat * 100) / 100
      b = Math.round(@map.getBearing() * 100) / 100
      p = Math.round(@map.getPitch() * 100) / 100
      hash = "#map=#{z}/#{x}/#{y}/#{b}/#{p}"
      state = {
        zoom: @map.getZoom()
        center: [@map.getCenter().lng, @map.getCenter().lat]
        bearing: @map.getBearing()
        pitch: @map.getPitch()
      }
      window.history.pushState(state, 'map', hash)

    @map.on('moveend', updatePermalink)

    @map.on 'click', 'serie-layer-labels', (e) =>
      sheet = e.features[0]
      @setActiveSheet(sheet)

    @map.on 'click', 'serie-layer', (e) =>
      sheet = e.features[0]
      @setActiveSheet(sheet)

    @map.on 'mouseenter', 'serie-layer', () => @map.getCanvas().style.cursor = 'pointer'
    @map.on 'mouseleave', 'serie-layer', () => @map.getCanvas().style.cursor = ''

    # restore the view state when navigating through the history, see
    # https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
    window.addEventListener 'popstate', (event) =>
      if event.state == null
        return

      shouldUpdate = false
      center = event.state.center
      @map.setCenter(new mapboxgl.LngLat(center[0], center[1]))
      @map.setZoom(event.state.zoom)
      @map.setBearing(event.state.bearing)
      @map.setPitch(event.state.pitch)
      shouldUpdate = true

  updateRegions: (regions) ->
    select = $('#regionSelect')
    select.off()
    select.empty()

    select.append $('<option>', {
      value: '',
      text: 'Filter by region'
    })

    regions.forEach (region) ->
      select.append $('<option>', {
        value: region,
        text: region
      })

    select.on 'change', => @setRegion(select.val())

  setRegion: (region) ->
    seriess = null
    if region
      seriess = (serie for serie in @seriess when serie.title.startsWith(region))
    else
      seriess = @seriess

    # update grid switcher
    grids = Series.getGrids(seriess)
    @updateGrids(grids, region)

    @setGrid(null, region);

  updateGrids: (grids, region) ->
    select = $('#gridSelect')
    select.off()
    select.empty()

    select.append $('<option>', {
      value: '',
      text: 'Filter by grid'
    })

    grids.forEach (grid) ->
      visTitle = if region then grid.getShortTitle() else grid.title
      select.append $('<option>', {
        'value': grid.title
        'text': visTitle
      })

    value = if region then grids.values().next().value.title else ''
    select.val(value)
    select.on 'change', () =>
      gridTitle = select.val()
      grid = null
      grids.forEach (g) -> if g.title == gridTitle then grid = g
      regSelect = $('#regionSelect')
      region = regSelect.val()
      @setGrid(grid, region)

  setGrid: (grid, region) ->
    seriess = null

    if grid or region
      seriess = @seriess.filter (series) ->
        (!grid || series.grid == grid) && (!region || series.title.startsWith(region))
    else
      seriess = @seriess

    @updateSeriess(seriess, region)
    @setSeries(seriess[0])

  setSeries: (series) ->
    @series = series

    loading.show()
    $.ajax {
      type: 'GET'
      url: "/server/data/geojson/#{@series.layer}.json"
      dataType: "json",
      success: (geojson) =>
        loading.hide()

        labels = []

        geojson.features.forEach (feature) ->
          centroid = turf.centroid(feature)
          centroid.properties = feature.properties
          centroid.properties['__GEOMETRY'] = feature.geometry;
          labels.push(centroid)

        @map.getSource("serie-source").setData(geojson)

        @map.getSource("serie-source-labels").setData({
          "type": "FeatureCollection",
          "features": labels
        })

      error: (err) ->
        loading.hide()
        bootbox.alert {
          size: 'large'
          title: "Error"
          message: "Server returned code #{err.status} with message: #{err.responseText}"
        }
    }

    link = $('<a></a>')
    link.attr('href', '/edit/#mapserie=' + series.id)
    link.append('Edit')

    container = $('#edit-bttn')
    container.empty().append(link)

  setActiveSheet: (sheet) ->
    html = null
    if !sheet
      @map.getSource("serie-source-labels-marked").setData({
        "type": "FeatureCollection",
        "features": []
      })
      @map.getSource("serie-source-marked").setData({
        "type": "FeatureCollection",
        "features": []
      })
      html = $('<i>Click on a sheet</i>')
      @template.setVisible(false);
    else
      centroid = turf.centroid(sheet)
      centroid.properties = sheet.properties

      @map.getSource("serie-source-labels-marked").setData({
        "type": "FeatureCollection",
        "features": [centroid]
      })
      @map.getSource("serie-source-marked").setData({
        "type": "FeatureCollection",
        "features": [sheet]
      })

      label = sheet.properties['SHEET'] + ' - ' + sheet.properties['TITLE']
      html = $('<a></a>')
      html.attr('href', '#')
      html.append(label)
      html.on 'click', (e) =>
        @template.showSheet(sheet, @series, @map)
        e.preventDefault()

    $('#results').empty().append(html)

  updateSeriess: (seriess, region) ->
    select = $('#seriesSelect')
    select.off()
    select.empty()

    seriess.forEach (series, i) ->
      visTitle = if region then series.getShortTitle() else series.title
      select.append $('<option>', {
        value: i
        text: visTitle
      })

    select.val(0)
    select.on 'change', () => @setSeries(@seriess[select.val()])

export default Search
