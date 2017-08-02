BaseControl = require './baseControl'
vex = require 'vex-js'
$ = require 'jquery'
log = require('../../lib/logger')('gridControl')
require 'jquery-ui/autocomplete'
require 'fabric'

class GridControl extends BaseControl
  constructor: (@options) ->
    super
    @registerEvents 'confirm', 'done'
    @options.texts ?= throw 'GridControl: texts is mandatory field.'
    @options.labelGap ?= 5
    @options.canvasPadding ?= 30
    @options.pointRadius ?= 5
    @options.fillColor ?= 'white'
    @options.strokeColor ?= 'black'
    @options.hoverFillColor ?= 'red'
    @options.hoverStrokeColor ?= 'red'
    @options.fontSize ?= 12
    @options.ltCoor ?= [90, -180]
    @options.rtCoor ?= [90, 180]
    @options.lbCoor ?= [-90, -180]
    @options.rbCoor ?= [-90, 180]

    @excludedRects = new Set()
    @proj = @options.initProj ? 4326
    @cols = @options.initCols ? 5
    @rows = @options.initRows ? 5

  onAdd: (@map) ->
    @featuresCounter = 1
    @container = document.createElement 'div'
    @container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

    @btn = document.createElement 'button'
    @btn.className = 'mapboxgl-ctrl-icon icon-grid'
    $(@btn).on 'click', @_onClickBtn

    @container.appendChild @btn

    @container

  onRemove: ->
    @map = undefined
    @container.parentNode.removeChild @container

  _onClickBtn: =>
    input = """
            <canvas id="gridCanvas" width="400" height="300"></canvas>
            <label for="input-cols">#{@options.texts.colsCount}:</label>
            <input type="number" id="input-cols" value="#{@cols}">
            <label for="input-rows">#{@options.texts.rowsCount}:</label>
            <input type="number" id="input-rows" value="#{@rows}">
            <div id="bttn-proj">EPSG: #{@proj}</div>
            """
    _this = @
    vex.dialog.open {
      message: @options.texts.gridDialogTitle
      input: input
      callback: @_onConfirmDialog
      afterOpen: ->
        _this._initCanvas()
        _this._initDialog(@content)
        _this._updateCanvas()
    }

  _onConfirmDialog: (data) =>

    @fire 'confirm', data

    if data is false
      return

    left = @options.ltCoor[1]
    top = @options.ltCoor[0]
    xstep = (@options.rbCoor[1] - @options.ltCoor[1]) / @cols
    ystep = (@options.ltCoor[0] - @options.rbCoor[0]) / @rows

    coors = []
    for x in [0...@cols]
      for y in [0...@rows]
        id = "#{x}-#{y}"
        if @excludedRects.has(id) then continue

        lt = [top - ystep*y, left + xstep*x]
        rt = [top - ystep*y, left + xstep*(x+1)]
        rb = [top - ystep*(y+1), left + xstep*(x+1)]
        lb = [top - ystep*(y+1), left + xstep*x]
        coors.push lt, rt, rb, lb


    @_transformCoors coors, (transformedCoors) =>
      features = []
      while transformedCoors.length isnt 0
        features.push @_createPolygon transformedCoors[0...4]
        transformedCoors = transformedCoors[4..]
      @fire 'done', {
        type: 'FeatureCollection'
        features: features
      }

  _createPolygon: (x) ->
    feature =
      type: 'Feature'
      properties:
        SHEET: @featuresCounter++
      geometry:
        type: 'Polygon'
        coordinates: [[
          [ parseFloat(x[0].x), parseFloat(x[0].y) ]
          [ parseFloat(x[1].x), parseFloat(x[1].y) ]
          [ parseFloat(x[2].x), parseFloat(x[2].y) ]
          [ parseFloat(x[3].x), parseFloat(x[3].y) ]
          [ parseFloat(x[0].x), parseFloat(x[0].y) ]
        ]]

  _onConfirmProjDialog: (data) =>
    if data?
      projParser = new RegExp(/^(\d+).*/)
      @_onProjChanged(projParser.exec(data.proj)[1])

  _onProjChanged: (@proj) ->
    document.getElementById('bttn-proj').innerHTML = "EPSG: #{@proj}"

  _onColsChanged: =>
    @cols = @inputCols.value
    @excludedRects.clear()
    @_updateCanvas()

  _onRowsChanged: =>
    @rows = @inputRows.value
    @excludedRects.clear()
    @_updateCanvas()

  _onBttnProjClick: =>
    vex.dialog.open {
      message: 'Projekce',
      afterOpen: @_initProjDialog
      input: '<input type="text" name="proj" id="input-proj">',
      callback: @_onConfirmProjDialog
    }

  _onCoorsKeyEvent: (e) =>
    carret = [e.target.selectionStart, e.target.selectionEnd]
    start = e.target.value.substring(0, carret[0])
    end = e.target.value.substring(carret[1])

    contains = (x, y) -> x.indexOf(y) > -1
    isEmpty = (x) -> not x or x.length is 0
    isDigit = (x) -> ('0' <= x <= '9') or x in ['.', ',']

    startContainsDegree = contains(start, '°')
    startContainsMinute = contains(start, "'")
    startContainsSecond = contains(start, '"')
    startIsEmpty = isEmpty(start)

    endContainsMinus = contains(end, '-')
    endContainsDegree = contains(end, '°')
    endContainsMinute = contains(end, "'")
    endContainsSecond = contains(end, '"')

    isMinus = e.keyCode == 109
    isNumber = e.keyCode >= 96 && e.keyCode <= 105
    isDecimalSep = e.keyCode == 190 || e.keyCode == 188
    isSpace = e.keyCode == 32
    isNavigation = e.keyCode == 37 or # LEFT
                   e.keyCode == 39 or # RIGHT
                   e.keyCode == 36 or # HOME
                   e.keyCode == 35 # END
    isTab = e.keyCode == 9
    isRemove = e.keyCode == 8 or # BACKSPACE
               e.keyCode == 46 # DELETE
    isCopyPaste = (e.ctrlKey && e.keyCode == 67) or # C
                  (e.ctrlKey && e.keyCode == 86) # V
    isMarkAll = e.ctrlKey && e.keyCode == 65 # A

    if isNavigation or isTab or isRemove or isCopyPaste or isMarkAll
      # Preserves default behavior
      return

    if startContainsSecond
      # we do not allow adding any new character
      e.preventDefault()
      return

    if isMinus and startIsEmpty and not endContainsMinus
      # Preserves default behavior
      return
    else if isNumber
      # Preserves default behavior
      return
    else if isDecimalSep
      i = carret[0]
      j = carret[0]
      value = e.target.value

      i-- while (i > 0 and isDigit(value[i])) or (i == value.length)
      j++ while j < value.length and isDigit(value[j])

      if not isDigit(value[i]) then i++
      if not isDigit(value[j]) then j--

      number = value.substring(i, j+1)

      if not contains(number, '.') and not contains(number, ',')
        e.target.value = start + '.' + end

    else if isSpace
      changed = false
      if startContainsMinute and not endContainsSecond
        e.target.value = start + '"' + end
        changed = true
      else if startContainsDegree and not startContainsMinute and not endContainsMinute
        e.target.value = start + "'" + end
        changed = true
      else if not startContainsDegree and not endContainsDegree
        e.target.value = start + '°' + end;
        changed = true

      if changed
        e.target.selectionStart = carret[0] + 1
        e.target.selectionEnd = carret[0] + 1
    e.preventDefault();

  _initCanvas: ->
    @canvas = new fabric.Canvas('gridCanvas');
    @canvas.selection = false;
    @canvas.renderOnAddRemove = false;
    @canvas.on 'mouse:down', (options) -> options?.target?.click? this
    @canvas.on 'mouse:over', (options) -> options?.target?.over? this
    @canvas.on 'mouse:out',  (options) -> options?.target?.out? this

  _initDialog: (content) ->
    @inputCols = document.getElementById('input-cols');
    @inputRows = document.getElementById('input-rows');
    bttnProj = document.getElementById('bttn-proj');

    @cols = @inputCols.value
    @rows = @inputRows.value

    $(@inputCols).on 'change', @_onColsChanged
    $(@inputRows).on 'change', @_onRowsChanged
    $(bttnProj).on 'click', @_onBttnProjClick

  _initProjDialog: =>
    inputProj  = document.getElementById 'input-proj'
    $(inputProj).autocomplete {
      source: (request, response) =>
        $.ajax {
          url: 'http://epsg.io'
          jsonp: 'callback'
          dataType: 'jsonp'
          data:
            q: request.term
            format: 'json'
            trans: '1'
          success: (data) =>
            if data.status == 'ok'

              result = ("#{result.code} #{result.name}" for result in data.results)
              response result
            else
              console.error data
              response []
          error: (data) =>
            console.error data
            response []
        }
    }

  _initCoorsDialog: =>
    inputNorth = document.getElementById 'input-north'
    inputEast  = document.getElementById 'input-east'

    inputNorth.addEventListener 'keydown', @_onCoorsKeyEvent
    inputEast.addEventListener 'keydown', @_onCoorsKeyEvent

  _showCoorsDialog: (dataModel) ->
    input = """
            <label for="input-north">Severní souřadnice:<label><input type="text" name="north" id="input-north">
            <label for="input-east">Východní souřadnice:</label><input type="text" name="east" id="input-east">
            """

    vex.dialog.open {
      message: 'Súradnice',
      input: input,
      afterOpen: @_initCoorsDialog
      callback: (data) => @_confirmCoorsDialog data, dataModel
    }

  _confirmCoorsDialog: (data, dataModel) ->
    log.debug "Calling confirmCoorsDialog with params data=#{data}, dataModel=#{dataModel}"
    if data?
      dataModel[0] = @_coorStrToNum data.north
      dataModel[1] = @_coorStrToNum data.east
      @_updateCanvas()

  _coorStrToNum: (coor) ->
    log.debug "Calling coorStrToNum with param #{coor}"
    re = new RegExp(/^\s*(-?\d+(\.\d+)?)\s*([°|\s]\s*(\d+(\.\d+)?)?)?\s*(['|\s]\s*(\d+(\.\d+)?)?)?\s*"?\s*$/)
    matches = re.exec(coor)
    grad = parseInt(matches[1])
    min = parseInt(matches[4])
    sec = parseInt(matches[7])
    min = if isNaN(min) then 0 else min
    sec = if isNaN(sec) then 0 else sec
    log.debug "coorStrToNum: grad=#{grad}, min=#{min}, sec=#{sec}"
    grad + min / 60.0 + sec / 3600.0

  _updateCanvas: ->
    log.debug 'Calling updateCanvas'
    left = @options.canvasPadding
    right = @canvas.getWidth() - @options.canvasPadding
    top = @options.canvasPadding
    bottom = @canvas.getHeight() - @options.canvasPadding
    width = right - left
    height = bottom - top
    rectWidth = width / @cols
    rectHeight = height / @rows
    _this = @
    @canvas.clear()

    for y in [0...@rows]
      for x in [0...@cols]
        rect = new fabric.Rect {
          id: "#{x}-#{y}"
          left: left + x * rectWidth
          top: top + y * rectHeight
          width: rectWidth
          height: rectHeight
          fill: @options.fillColor
          stroke: @options.strokeColor
          selectable: false
          included: true
        }
        rect.click = (canvas) ->
          if @.included
            @set {
              fill: canvas.backgroundColor
              stroke: canvas.backgroundColor
            }
            @included = false
            _this.excludedRects.add @id
          else
            @set {
              fill: _this.options.fillColor
              stroke: _this.options.strokeColor
            }
            @included = true;
            _this.excludedRects.delete @id

        if @excludedRects.has rect.id
          rect.set {
            fill: canvas.backgroundColor
            stroke: canvas.backgroundColor
          }
          rect.included = false

        @canvas.add(rect)

    ltPoint = new fabric.Circle {
      left: left - @options.pointRadius
      top: top - @options.pointRadius
      data: @options.ltCoor
    }
    rbPoint = new fabric.Circle {
      left: right - @options.pointRadius
      top: bottom - @options.pointRadius
      data: @options.rbCoor
    }

    points = [ltPoint, rbPoint]

    for point in points
      point.set {
        radius: @options.pointRadius
        fill: @options.strokeColor
        stroke: @options.strokeColor
        selectable: false
      }
      point.over = (canvas) ->
        this.set {
          fill: _this.options.hoverFillColor
          stroke: _this.options.hoverStrokeColor
        }
        canvas.renderAll();

      point.out = (canvas) ->
        this.set {
          fill: _this.options.strokeColor
          stroke: _this.options.strokeColor
        }
        canvas.renderAll();

      point.click = (canvas) ->
        _this._showCoorsDialog.call(_this, this.data);

      @canvas.add point

    ltLabel = new fabric.Text "#{@options.ltCoor[0].toFixed(2)}, #{@options.ltCoor[1].toFixed(2)}", {
      left: left - @options.pointRadius
      fontSize: @options.fontSize
      selectable: false
    }
    ltLabel.top = top - @options.pointRadius - @options.labelGap - ltLabel.height

    rbLabel = new fabric.Text "#{@options.rbCoor[0].toFixed(2)}, #{@options.rbCoor[1].toFixed(2)}", {
      top: bottom + @options.pointRadius + @options.labelGap
      textAlign: 'right'
      fontSize: @options.fontSize
      selectable: false
    }
    rbLabel.left = right + @options.pointRadius - rbLabel.width

    labels = [ltLabel, rbLabel]

    for label in labels
      label.fill = @options.fillColor
      label.stroke = @options.strokeColor
      @canvas.add label

    @canvas.renderAll()

  _transformCoors: (coors, cb, result = []) ->
    batch = coors[0...20]
    rest = coors[20..]

    callbackInternal = (r) =>
      result = result.concat(r);
      if rest.length isnt 0
        @_transformCoors rest, cb, result
      else
        cb result

    @_doTransformCoors batch, callbackInternal

  _doTransformCoors: (coors, cb) ->
    out = ("#{coor[1]},#{coor[0]}" for coor in coors)
    out = out.join(';');
    $.ajax {
      url: 'http://epsg.io/trans',
      jsonp: 'callback',
      dataType: 'jsonp',
      data:
        data: out,
        s_srs: @proj,
        t_srs: 4326
      success: (response) => cb response
      error: (xhr, msg, exception) =>
        console.error(xhr)
        console.error(msg)
        console.error(exception)
        alert msg
        cb null
    }


module.exports = GridControl
