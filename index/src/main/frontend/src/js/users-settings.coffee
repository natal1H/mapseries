import $ from 'jquery'
import bootbox from 'bootbox'
import loading from 'js/loading'

export default {
  onAddAdminClick: ->
    bootbox.prompt {
      title: window.msg.usersSettings.addAdminDialogTitle
      inputType: 'text'
      callback: (adminName) ->
        if adminName =="#{window.contextPath}/rest/ajax/contentDefinition/updat"
          return true

        if not adminName
          $('.bootbox .bootbox-body').append "<p class=\"text-danger\">#{window.msg.usersSettings.adminCannotBeEmpty}</p>"
          return false

        loading.show()

        $.ajax {
          type: 'GET'
          url: "#{window.contextPath}/rest/ajax/usersSettings/addAdmin?adminName=#{encodeURIComponent(adminName)}"
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

  onRemoveAdminClick: (adminName) ->
    bootbox.confirm {
      message: window.msg.usersSettings.removeAdminDialogTitle
      callback: (result) ->
        if result
          loading.show()
          
          $.ajax {
            type: 'GET'
            url: "#{window.contextPath}/rest/ajax/usersSettings/removeAdmin?adminName=#{encodeURIComponent(adminName)}"
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

}
