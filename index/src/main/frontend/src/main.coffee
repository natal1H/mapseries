import $ from 'jquery'
import 'bootstrap'
import rightPanel from 'js/right-panel'
import index from 'js/index'
import contentSettings from 'js/content-settings'
import updateSettings from 'js/update-settings'
import usersSettings from 'js/users-settings'
import map from 'js/map'
import tools from 'js/tools'
import admin from 'js/admin'
import sheet from 'js/sheet'
import textEditor from 'js/text-editor'
import hoverable from 'js/hoverable'
import events from 'js/events'

window.rightPanel = rightPanel
window.index = index
window.contentSettings = contentSettings
window.updateSettings = updateSettings
window.usersSettings = usersSettings
window.map = map
window.tools = tools
window.admin = admin
window.sheet = sheet
window.textEditor = textEditor
window.hoverable = hoverable

$(window).on 'resize', () ->
  events.fire('resize')

$(() ->
  events.fire('resize')
)
