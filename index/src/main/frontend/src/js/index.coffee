import $ from 'jquery'
import events from 'js/events'

updateLayout = () ->
  topPanel = $('.top-panel')
  main = $('.main')
  rightPanelElements = $('.right-panel .red')
  rightPanelLast = rightPanelElements.last()

  topPanel.css('height', 'auto')
  rightPanelLast.css('height', 'auto')

  topPanelHeight = topPanel.outerHeight()
  rightPanelHeaderHeight = 0
  rightPanelElements.each (i, v) -> rightPanelHeaderHeight += $(v).outerHeight()

  if topPanelHeight < rightPanelHeaderHeight
    topPanel.css('height', "#{rightPanelHeaderHeight}px")
    main.css('top', "#{rightPanelHeaderHeight}px")
  else
    rightPanelLastHeight = rightPanelLast.outerHeight()
    rightPanelLast.css('height', "#{(topPanelHeight - rightPanelHeaderHeight) + rightPanelLastHeight}px")
    main.css('top', "#{topPanelHeight}px")

export default {
  main: ->
    events.on('resize', updateLayout, 10)
}
