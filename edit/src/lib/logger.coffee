queryString = require 'query-string'

params = queryString.parse(location.search)

matchFilter = (scriptName) -> if params.filter then params.filter == scriptName else true

module.exports = (scriptName) ->
  {
    debug: (msg) ->
      if params.debug and matchFilter scriptName
        console.log "[DEBUG] #{scriptName}: #{msg}"
    info: (msg) ->
      console.log "[INFO] #{scriptName}: #{msg}"
    error: (msg) ->
      console.error "[ERROR] #{scriptName}: #{msg}"
  }
