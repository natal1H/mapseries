import $ from 'jquery'

parseComponents = (hash) ->
  hash
    .substring(1).split('&')
    .filter (x) -> x
    .map (x) -> x.split('=')

updateAnchorInUrlObj = (obj, key, value) ->
  updateComponent = (component) ->
    [k, v] = component
    if k is key
      [key, value]
    else
      component

  components = parseComponents(obj.hash)

  keys = components.map (x) -> x[0]

  if keys.includes(key)
    components = (updateComponent c for c in components)
  else
    components.push([key, value])

  components = components.map (x) -> x.join('=')

  obj.hash = "##{components.join('&')}"

export default {
  updateAnchor: (key, value) ->
    updateAnchorInUrlObj(window.location, key, value)
    $('a:not(.no-anchor)').each (i, a) -> updateAnchorInUrlObj(a, key, value)

  updateAnchorOnlyLinks: (key, value) ->
    $('a:not(.no-anchor)').each (i, a) -> updateAnchorInUrlObj(a, key, value)

  getAnchor: (key, defaultVal) ->
    components = parseComponents(window.location.hash)
    component = components.find (x) -> x[0] == key

    if component? then component[1] else defaultVal
}
