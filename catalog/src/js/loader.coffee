import Series from 'model/series'
import Grid from 'model/grid'
import $ from 'jquery'
import bootbox from 'bootbox'

class Loader
  loadSeries:(objSeries, id) ->
    series = new Series()
    series.id = id
    series.title = objSeries['title']
    series.layer = objSeries['layer']
    series.grid = objSeries['baseGrid']
    series.formatFunctions = objSeries['formatFunctions'] || []

    url = "/server/data/template/#{objSeries['template']}"
    $.ajax {
      type: 'GET'
      url: url
      dataType: 'text'
      success: (template) =>
        series.template = template

      error: (err) ->
        bootbox.alert {
          size: 'large'
          title: "Error"
          message: "Server returned code #{err.status} with message: #{err.responseText} for #{url}"
        }
    }

    return series

  loadSeriess: (objSeriess) ->
    i = 0
    seriess = (@loadSeries(series, i++) for series in objSeriess)

    # map series that are base grids
    baseSeriess = seriess.filter (series) -> !(series.grid)

    # create grids
    grids = []
    for series in baseSeriess
      grid = new Grid()
      grid.title = series.title
      grid.mainSeries = series
      grid.seriess = [series]
      series.grid = grid
      grids.push(grid)

    # map series that refer to base grids
    refSeriess = seriess.filter (series) -> typeof series.grid == 'string'

    for series in refSeriess
      gridTitle = series.grid
      grid = grid for grid in grids when grid.title == gridTitle

      if !grid
        throw Error('Grid ' + gridTitle + ' not found!')
      else
        series.grid = grid
        grid.series.push(series)

    return seriess

export default Loader
