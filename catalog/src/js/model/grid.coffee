
class Grid
  constructor: ->
    @title = null
    @mainSeries = null
    @seriess = null

  getShortTitle: -> @title.substr(@title.indexOf(':') + 1)

export default Grid
