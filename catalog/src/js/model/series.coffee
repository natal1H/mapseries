
class Series

  constructor: ->
    @id = null
    @title = null
    @template = null
    @formatFunctions = null
    @overlay = null
    @grid = null

  getShortTitle: -> @title.substr(@title.indexOf(':') + 1)

  @getRegions: (seriess) ->
    regions = new Set()

    for series in seriess
      regions.add series.title.split(':')[0]

    return regions

  @getGrids: (seriess) ->
    grids = new Set()

    for series in seriess
      grids.add series.grid

    return grids

export default Series
