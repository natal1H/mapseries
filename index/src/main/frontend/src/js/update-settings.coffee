import $ from 'jquery'
import bootbox from 'bootbox'
import loading from 'js/loading'

showError = (msg) ->
  bootbox.alert {
    size: 'large',
    title: window.msg.error,
    message: msg
  }

export default {
  main: ->
    url = "ws://#{window.location.host}/#{window.contextPath}/ws/update"
    ws = new WebSocket(url)
    ws.onmessage = (message) ->
      window.location.reload() if message.data == 'reload'

  onUpdateDataClick: ->
    loading.show()
    $.ajax {
      url: "#{window.contextPath}/rest/ajax/updateSettings/updateAction"
      dataType: "json"
      success: (resp) ->
        loading.hide()
        if resp.success
          window.location.reload()
        else
          showError "Server returned error message #{resp.message}"
      error: (err) ->
        loading.hide()
        showError "Server returned code #{err.status} with message: #{err.responseText}"
    }
}
