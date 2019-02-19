import $ from 'jquery'
import ebus from 'ebus'

updateLayout = ->
  updateTabSize()

  if $('.template-dialog').length > 0
    updateDialogPosition()

updateTabSize = ->
  windowHeight = $(window).height()
  tab = $('.tab-pane.active')
  padding = $('#pannel-padding')
  footer = $('#footer')
  # reset heights before doing any calculations
  padding.css('height', '0px');
  tab.css('height', 'auto');
  tabPosition = tab.position()
  tabHeight = tab.height() + footer.height()

  if tabPosition.top + tabHeight > windowHeight
    newTabHeight = (windowHeight - tabPosition.top) - footer.height()
    tab.css('height', Math.round(newTabHeight) + 'px')
    tab.css('overflow-y', 'scroll')
  else
    footerOffset = footer.offset()
    footerBottom = footerOffset.top + footer.height()
    paddingHeight = Math.round(windowHeight - footerBottom)
    padding.css('height', paddingHeight + 'px')
    tab.css('height', 'auto')
    tab.css('overflow-y', 'hidden')

updateDialogPosition = ->
  panelWidth = $('.right-panel').outerWidth()
  panelHeaderHeight = getHeightOfElements('.right-panel .green')

  dialog = $('.template-dialog')
  dialog.css('left', 0)
  dialog.css('bottom', 0)
  dialog.css('right', "#{panelWidth}px")
  dialog.css('top', "#{panelHeaderHeight}px")

  pre = $('.template-dialog-content pre')
  preTop = pre.offset().top
  buttonsHeight = $('.template-dialog-content .clipboard-container').outerHeight()
  windowHeight = $(window).height()

  pre.css('height', "#{(windowHeight - preTop) - buttonsHeight}px")


getHeightOfElements = (selector) ->
  elements = $(selector)
  height = 0
  elements.each (i, v) -> height += $(v).outerHeight()
  return height

dectivateMainTabs = ->
  $('.nav-tabs a').removeClass('active')

deactiveAuthorsTab = ->
  $('#authors-tab').removeClass('active')

init = ->
  ebus.on('resize', updateLayout)
  ebus.on('text-updated', updateLayout)
  ebus.on('dialog-shown', updateDialogPosition)

  $(window).on('resize', () -> ebus.fire('resize'))
  ebus.fire('resize')

  $('a[data-toggle="tab"]').on('shown.bs.tab', (e) ->
    if e.target.id == 'authors-tab'
      dectivateMainTabs()
    else
      deactiveAuthorsTab()

    updateTabSize()
  )

export default {
  init: init
}
