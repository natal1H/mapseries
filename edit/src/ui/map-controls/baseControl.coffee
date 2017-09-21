
class BaseControl

  constructor: ->
    @events = {}

  registerEvents: (event...) ->
    for e in event
      @events[e] = {
        listeners: []
        onceListeners: []
      }

  on: (type, listener) ->
    event = @events[type]

    if not event?
      throw "There is no event of type '#{type}'"

    event.listeners.push listener
    return this

  off: (type, listener) ->
    event = @events[type]

    if not event?
      throw "There is no event of type '#{type}'"

    if (listener not in event.listeners) and (listener not in event.onceListeners)
      throw "The listener has never been registered in this object for event type '#{type}'"

    event.listeners = (x for x in event.listeners when x isnt listener)
    event.onceListeners = (x for x in event.type.onceListeners when x isnt listener)

    return this

  fire: (type, data) ->
    event = @events[type]

    if not event?
      throw "There is no event of type '#{type}'"

    x(data) for x in event.listeners
    x(data) for x in event.onceListeners
    event.onceListeners = []

    return this

  listens: (type) ->
    if @events[type]? then true else false

module.exports = BaseControl
