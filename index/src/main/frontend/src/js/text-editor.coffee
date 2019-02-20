import $ from 'jquery'
import delayedHandler from 'js/delayed-handler'
import bootbox from 'bootbox'
import loading from 'js/loading'
import events from 'js/events'

originalText = ''

saveOriginalText = ->
  originalText = $('textarea').val()

updateLayout = ->
  textarea = $('textarea')
  textareaTop = textarea.offset().top
  windowHeight = $(window).height()
  textareaHeight = Math.round((windowHeight - textareaTop) - 50)
  textarea.css('height', "#{textareaHeight}px")

beforeUnload = (e) -> e.returnValue = window.msg.changesNotSaved

textAreaListener = (e) ->
  newText = $(e.target).val()

  if newText == originalText
    $('#btn-save').prop('disabled', true)
    $(window).off 'beforeunload', beforeUnload
  else
    $('#btn-save').prop('disabled', false)
    $(window).on 'beforeunload', beforeUnload

registerTextAreaListener = ->
  textarea = $('textarea')[0]
  delay = 500
  if textarea.addEventListener
    textarea.addEventListener('input', delayedHandler(textAreaListener, delay))
  else if textarea.attachEvent
    textarea.attachEvent('onpropertychange', delayedHandler(textAreaListener, delay))

save = ->
  window.contentDefinitionData.forEach((item) ->
    if item.name == window.textEditor.name
      item.description = item.description || {}
      item.description[window.textEditor.lang] = $('textarea').val()
  )

  bootbox.prompt {
    title: window.msg.contentSettings.commitMsgDialogTitle
    inputType: 'textarea'
    value: "Update description for #{window.textEditor.name} [#{window.textEditor.lang}]"
    callback: (commitMsg) ->
      if commitMsg == null
        return true

      if not commitMsg
        $('.bootbox .bootbox-body').append "<p class=\"text-danger\">#{window.msg.contentSettings.commitMsgCannotBeEmpty}</p>"
        return false

      loading.show()

      data =
        commitMessage: commitMsg
        content: JSON.stringify(window.contentDefinitionData, null, ' ')

      data = JSON.stringify(data)

      $.ajax {
        type: "POST"
        url: "#{window.contextPath}/rest/ajax/contentDefinition/update"
        data: data
        contentType: "application/json; charset=utf-8"
        dataType: "json"
        success: (resp) ->
          loading.hide()
          if resp.success
            originalText = '' + $('textarea').val()
            $('#btn-save').prop('disabled', true)
            $(window).off 'beforeunload', beforeUnload
          else
            showError "For input #{data}, server returned error message #{resp.message}"
        error: (err) ->
          loading.hide()
          showError "For input #{data}, server returned code #{err.status} with message: #{err.responseText}"
      }

  }

export default {
  main: ->
    $(() ->
      registerTextAreaListener()
      saveOriginalText()
    )
    events.on('resize', updateLayout)

  onSaveClick: save
  onRestoreClick: -> window.location.reload()
}
