import Handsontable from 'handsontable'
import $ from 'jquery'
import bootbox from 'bootbox'
import loading from 'js/loading'

beforeUnload = (e) -> e.returnValue = window.msg.changesNotSaved

showError = (msg) ->
  bootbox.alert {
    size: 'large',
    title: window.msg.error,
    message: msg
  }

originData = null

export default {
  main: ->
    window.contentDefinitionData ?= [{
      field: ''
      name: ''
      grid: ''
      sheets: ''
      groupby: ''
      thumbnailUrl: ''
    }]
    originData = JSON.stringify(window.contentDefinitionData)

    config =
      columns: [
          {
              data: 'field'
              type: 'text'
          }
          {
              data: 'name'
              type: 'text'
          }
          {
              data: 'grid'
              type: 'text'
          }
          {
              data: 'sheets'
              type: 'text'
          }
          {
              data: 'groupby'
              type: 'text'
          }
          {
              data: 'thumbnailUrl'
              type: 'text'
          }
      ]
      colHeaders: [
        window.msg.contentSettings.field
        window.msg.contentSettings.name
        window.msg.contentSettings.grid
        window.msg.contentSettings.sheets
        window.msg.contentSettings.groupby
        window.msg.contentSettings.thumbnailUrl
      ]
      data: window.contentDefinitionData
      stretchH: 'all'
      contextMenu: true

    table = new Handsontable($('#content-settings-table').get(0), config)

    table.addHook('afterChange', ->
      newData = JSON.stringify(window.contentDefinitionData)
      console.log 'Comparing'
      console.log originData
      console.log newData
      if originData == newData
        $('#btn-save').addClass 'disabled'
        $(window).off 'beforeunload', beforeUnload
      else
        $('#btn-save').removeClass 'disabled'
        $(window).on 'beforeunload', beforeUnload
    )

  onRestoreClick: ->
    window.location.reload()

  onSaveClick: ->

    commitMessage = null

    bootbox.prompt {
      title: window.msg.contentSettings.commitMsgDialogTitle
      inputType: 'textarea'
      callback: (commitMsg) ->
        if commitMsg == null
          return true

        if not commitMsg
          $('.bootbox .bootbox-body').append "<p class=\"text-danger\">#{window.msg.contentSettings.commitMsgCannotBeEmpty}</p>"
          return false

        loading.show()

        data =
          commitMessage: commitMsg
          content: JSON.stringify(window.contentDefinitionData)

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
              originData = JSON.stringify(window.contentDefinitionData)
              $('#btn-save').addClass 'disabled'
              $(window).off 'beforeunload', beforeUnload
            else
              showError "For input #{data}, server returned error message #{resp.message}"
          error: (err) ->
            loading.hide()
            showError "For input #{data}, server returned code #{err.status} with message: #{err.responseText}"
        }

    }
}
