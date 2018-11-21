
export default (handler, delay) ->
  timeout = null

  (e) ->
    window.clearTimeout(timeout)
    timeoutHandler = () -> handler(e)
    timeout = window.setTimeout(timeoutHandler, delay)
