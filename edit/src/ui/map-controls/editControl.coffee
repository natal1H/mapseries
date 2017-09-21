BaseControl = require './baseControl'
$ = require('jquery')
MapboxDraw = require('@mapbox/mapbox-gl-draw')

class EditControl extends BaseControl

  constructor: (options) ->
    super
    @source = options.source ? throw 'EditControl source is mandatory field'
    @drawControl = new MapboxDraw()
    @editMode = off

    @registerEvents 'done', 'switch-to-edit', 'cancel'

  onAdd: (@map) ->
    @container = document.createElement 'div'
    @container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

    @btnEditMode = document.createElement 'button'
    @btnEditMode.className = 'mapboxgl-ctrl-icon icon-edit'

    @btnConfirm = document.createElement 'button'
    @btnConfirm.className = 'mapboxgl-ctrl-icon icon-confirm'
    @btnConfirm.style.display = 'none'

    @btnCancel = document.createElement 'button'
    @btnCancel.className = 'mapboxgl-ctrl-icon icon-cancel'
    @btnCancel.style.display = 'none'

    @container.appendChild @btnEditMode
    @container.appendChild @btnConfirm
    @container.appendChild @btnCancel

    $(@btnEditMode).on 'click', @_onClickEditMode
    $(@btnConfirm).on 'click', @_onClickConfirm
    $(@btnCancel).on 'click', @_onClickCancel

    @container

  onRemove: ->
    @map = undefined
    @container.parentNode.removeChild @container

  cancel: ->
    if not @editMode then return null
    @_switchOffEditMode()
    @drawControl.deleteAll()
    @map.removeControl @drawControl
    @fire('cancel')

  _onClickEditMode: =>
    @_switchOnEditMode()
    @map.addControl @drawControl
    @drawControl.add(@source())
    @fire('switch-to-edit')

  _onClickConfirm: =>
    @_switchOffEditMode()
    @fire('done', @drawControl.getAll())
    @drawControl.deleteAll()
    @map.removeControl @drawControl

  _onClickCancel: =>
    @cancel()

  _switchOnEditMode: ->
    @editMode = on
    $(@btnEditMode).hide()
    $(@btnConfirm).show()
    $(@btnCancel).show()

  _switchOffEditMode: ->
    @editMode = off
    $(@btnEditMode).show()
    $(@btnConfirm).hide()
    $(@btnCancel).hide()



module.exports = EditControl
