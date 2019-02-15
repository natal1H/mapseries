import Search from 'search'
import languages from 'languages'
import layout from 'layout'

window.main = ->
  config = window.mapseries['config']
  search = new Search(config)
  languages.init()
  layout.init()
