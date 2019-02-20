
class Callback
  constructor: (@func, priority) ->
    @priority = priority ? 0

class Events
  constructor: () ->
    @events = {}

  on: (event, func, priority) ->
    callbacks = this._getEvent(event)
    callbacks.push(new Callback(func, priority))
    callbacks.sort (a, b) ->
      if a.priority > b.priority then -1
      else if a.priority < b.priority then 1
      else 0

  fire: (event, thisArg, args...) ->
    callback.func.apply(thisArg, args) for callback in this._getEvent(event)

  _getEvent: (event) ->
    if @events[event]
      @events[event]
    else
      @events[event] = []
      @events[event]

events = new Events()

export default events
